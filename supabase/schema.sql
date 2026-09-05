-- ============================================================
-- 線上財神廟 - Supabase 資料庫結構（v3：帳號系統 + CDTB點數 + 供品可由後台新增/上下架）
-- 使用方式：到 Supabase 專案的 SQL Editor，貼上整份檔案並執行一次即可
--
-- 如果你之前已經執行過舊版（v1 或 v2）schema，供品表的結構有變動，
-- 請先執行下面兩行清掉舊表，再往下執行整份檔案：
--   drop table if exists public.worship_log cascade;
--   drop table if exists public.offerings cascade;
--
-- 重要：這個版本不使用 Supabase Auth（不需要 email）。
-- 帳號驗證改由網站程式（Next.js API）用 service_role 金鑰處理，
-- 所以這裡的資料表對一般用戶端（anon key）完全不開放，
-- 只有伺服器端的 service_role 金鑰能讀寫，多一層保護。
-- ============================================================

-- 1. 帳號流水號，用來產生 4 碼帳號（0001, 0002, ...最多到 9999）
create sequence if not exists public.account_no_seq start with 1;

create or replace function public.next_account_no()
returns text
language sql
as $$
  select lpad(nextval('public.account_no_seq')::text, 4, '0')
$$;

-- 2. 會員帳號表
create table if not exists public.accounts (
  account_no text primary key,           -- 4 碼帳號，例如 0001
  display_name text,                     -- 暱稱，選填
  password_hash text not null,           -- 密碼雜湊值（不存明碼）
  points integer not null default 0,     -- CDTB 點數
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- 3. 供品桌設定（id 改用自動編號，之後在後台新增供品時不用自己指定 id）
create table if not exists public.offerings (
  id bigint generated always as identity primary key,
  name text not null,
  icon_key text not null,
  cost integer not null,
  position smallint not null default 0,
  is_active boolean not null default true,  -- 後台「刪除」實際上是下架，保留歷史敬獻紀錄
  created_at timestamptz not null default now()
);

-- 初次建立才塞入預設供品（如果你是重新執行整份檔案，這裡不會重複塞入）
insert into public.offerings (name, icon_key, cost, position)
select v.name, v.icon_key, v.cost, v.position
from (values
  ('清香', 'incense', 45, 1),
  ('小份金紙', 'joss_small', 275, 2),
  ('金紙', 'joss', 575, 3),
  ('補財庫', 'treasury', 1145, 4),
  ('水果', 'fruit', 825, 5),
  ('鮮花', 'flower', 1425, 6),
  ('零食', 'snack', 725, 7)
) as v(name, icon_key, cost, position)
where not exists (select 1 from public.offerings);

-- 4. 敬獻紀錄
create table if not exists public.worship_log (
  id bigint generated always as identity primary key,
  account_no text not null references public.accounts(account_no) on delete cascade,
  offering_id bigint not null references public.offerings(id),
  points_spent integer not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 5. 安全機制：開啟 RLS 但完全不設任何 policy，
--    代表 anon / authenticated（一般用戶端金鑰）完全無法讀寫這些表，
--    只有伺服器用 service_role 金鑰才能存取（service_role 會略過 RLS）。
-- ============================================================
alter table public.accounts enable row level security;
alter table public.offerings enable row level security;
alter table public.worship_log enable row level security;

-- ============================================================
-- 6. 敬獻供品：扣點 + 寫紀錄，用交易鎖確保點數不會算錯
-- ============================================================
create or replace function public.worship(p_account_no text, p_offering_id bigint)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cost integer;
  v_points integer;
begin
  select cost into v_cost from public.offerings where id = p_offering_id and is_active;
  if v_cost is null then
    raise exception '找不到這個供品，或供品已下架';
  end if;

  select points into v_points from public.accounts where account_no = p_account_no for update;
  if v_points is null then
    raise exception '找不到帳號';
  end if;
  if v_points < v_cost then
    raise exception 'CDTB 點數不足';
  end if;

  update public.accounts set points = points - v_cost where account_no = p_account_no;
  insert into public.worship_log (account_no, offering_id, points_spent)
    values (p_account_no, p_offering_id, v_cost);

  return (select points from public.accounts where account_no = p_account_no);
end;
$$;

grant execute on function public.next_account_no() to service_role;
grant execute on function public.worship(text, bigint) to service_role;

-- ============================================================
-- 7. 把第一個帳號設成管理員
--    先在網站上完成一次註冊，拿到你的 4 碼帳號後，回來執行這行
--    （把 '0001' 換成你自己的帳號）
-- ============================================================
-- update public.accounts set is_admin = true where account_no = '0001';

