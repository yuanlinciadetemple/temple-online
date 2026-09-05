-- 網路財神廟 v4：最後安全設定
-- 在前面 1～7 段 SQL 都完成後再執行本檔。

alter table public.prayer_recipients enable row level security;
alter table public.worship_orders enable row level security;
alter table public.worship_order_items enable row level security;

grant execute on function public.create_worship_order(text, bigint, bigint[]) to service_role;
grant execute on function public.complete_worship_order(bigint, text) to service_role;
grant execute on function public.cleanup_old_worship_orders() to service_role;

-- 常用查詢索引
create index if not exists worship_orders_status_created_at_idx
on public.worship_orders(status, created_at desc);

create index if not exists worship_orders_account_created_at_idx
on public.worship_orders(account_no, created_at desc);
