# 網路財神廟

會員登入 + CDTB 點數敬獻供品的網站。技術：**Next.js**（網站程式）＋ **Supabase**（純資料庫，不用它的會員系統）＋ **Vercel**（免費部署）。

---

## 這一版的重點設計

- **帳號用 4 碼數字**（例如 `0001`），不需要 email。註冊時自己設定密碼，系統自動配發帳號號碼
- 點數單位是 **CDTB**
- 供品桌目前有 7 項：清香 45／小份金紙 275／金紙 575／補財庫 1145／水果 825／鮮花 1425／零食 725（CDTB）
- 後台管理可以：**搜尋所有帳號、調整任何人的點數、重設任何人的密碼、刪除帳號、手動建立新帳號**，也能**直接新增供品、改名字/點數/圖示、上下架、刪除供品**（後台頁面最下面「供品桌」那一區）
- **密碼不會以明碼儲存或顯示**：資料庫只存密碼的雜湊值（無法逆推回原密碼），後台看不到使用者的密碼本身，只能「重設」成新密碼。這是為了避免資料庫萬一外流時，使用者的密碼被看光光——尤其很多人會在不同網站重複使用同一組密碼，這樣做是保護你的會員

### 安全架構怎麼運作

一般的「前端直接連資料庫」寫法在這個帳號系統下不安全，因為前端的金鑰是公開的，任何人都能用瀏覽器的開發者工具看到。所以這一版所有跟帳號、點數有關的操作，都改成先送到你自己網站的後端程式（Next.js 的 API 路由），由後端用只有伺服器看得到的 `service_role` 金鑰去操作資料庫，瀏覽器完全碰不到這把金鑰，也完全碰不到資料庫本身。登入狀態則是用一個加密簽章過的 cookie（`temple_session`）來記住是哪個帳號。

---

## 一、建立 Supabase 專案（只拿來當資料庫用）

1. 到 https://supabase.com 註冊帳號，點 **New Project**
2. 專案名稱、資料庫密碼隨意設定，Region 選 **Northeast Asia (Tokyo)** 或離你近的
3. 左側選單點 **SQL Editor**，打開這個專案裡的 `supabase/schema.sql`，全部複製貼上，按 **Run**
   - 這一步會建立帳號表、供品資料、敬獻紀錄，以及安全機制
4. 左側選單點 **Project Settings → API**，記下：
   - `Project URL`
   - `service_role` 這把 key（**不是** `anon public`，這把 key 權限很大，絕對不能外流、不能出現在前端程式碼、不能上傳到公開的 GitHub repo）

---

## 二、在本機把網站跑起來

需要先安裝 [Node.js](https://nodejs.org)（18 版以上）。

```bash
cd temple-online
npm install

# 設定環境變數
cp .env.local.example .env.local
```

打開 `.env.local`，填入：

```
SUPABASE_URL=剛剛複製的 Project URL
SUPABASE_SERVICE_ROLE_KEY=剛剛複製的 service_role key
SESSION_SECRET=隨便打一串長亂碼，例如用 openssl rand -base64 32 產生
```

```bash
npm run dev
```

打開瀏覽器 `http://localhost:3000`，會看到登入畫面，點「立即註冊」建立第一個帳號。

### 把自己設成管理員

1. 先在網站上註冊一個帳號，記下系統配發給你的 4 碼帳號（例如 `0001`）
2. 回到 Supabase 的 **SQL Editor**，執行（換成你自己的帳號）：

```sql
update public.accounts set is_admin = true where account_no = '0001';
```

3. 重新登入，首頁左下角會出現「後台管理」按鈕

---

## 三、部署到 Vercel

1. 把 `temple-online` 資料夾上傳到 GitHub（新建一個 repository）
   - `.gitignore` 已經排除了 `.env.local`，你的金鑰不會被上傳，這點很重要
2. 到 https://vercel.com 用 GitHub 帳號登入，**Add New → Project**，選這個 repository
3. 在 **Environment Variables** 加入跟 `.env.local` 一樣的三個變數
4. 點 **Deploy**，等 1-2 分鐘即可拿到正式網址

之後想接自訂網域，到 Vercel 專案的 **Settings → Domains** 設定即可。

---

## 四、之後可能會用到的操作

**改供品名稱或點數**：Supabase SQL Editor 執行，例如：
```sql
update public.offerings set name = '你想要的名字' where id = 6;
update public.offerings set cost = 999 where id = 3;
```

**新增供品項目**：
```sql
insert into public.offerings (id, name, icon_key, cost, position)
values (8, '新供品', 'flower', 300, 8);
```
（`icon_key` 目前有現成插畫的選項：`flower` `fruit` `incense` `joss_small` `joss` `treasury` `ingot` `snack`，選一個現有的重複用沒問題）

**幫信眾直接開帳號、儲值**：登入後台管理頁最上面的「新增帳號」表單即可，會直接給一組新的 4 碼帳號。

**串金流讓人真的付費購買 CDTB**：需要接綠界 ECPay 或 TapPay 之類的金流服務，這塊因為牽涉金流審核與資安規範，之後有需要我們再另外討論怎麼接。

---

## 檔案結構

```
temple-online/
├─ app/
│  ├─ page.tsx                    # 首頁（財神廟 + 供品桌）
│  ├─ login/page.tsx              # 登入（4碼帳號 + 密碼）
│  ├─ signup/page.tsx             # 註冊（自訂密碼，系統配發帳號）
│  ├─ admin/page.tsx              # 後台：帳號列表、點數、密碼重設、刪除、新增
│  └─ api/
│     ├─ auth/register/route.ts   # 註冊
│     ├─ auth/login/route.ts      # 登入
│     ├─ auth/logout/route.ts     # 登出
│     ├─ me/route.ts              # 取得目前登入帳號的資料
│     ├─ offerings/route.ts       # 供品清單
│     ├─ worship/route.ts         # 敬獻（扣點）
│     └─ admin/accounts/          # 後台管理用的 API
├─ components/
│  ├─ OfferingSlot.tsx            # 單一供品按鈕
│  ├─ PointsBadge.tsx             # 右上角 CDTB 點數顯示
│  └─ icons/                      # 供品插畫圖示
├─ lib/
│  ├─ supabaseAdmin.ts            # 伺服器專用的資料庫連線（service_role）
│  ├─ session.ts                  # 登入 cookie 的簽章 / 驗證
│  ├─ requireAdmin.ts             # 檢查是否為管理員
│  └─ types.ts
├─ public/temple-bg.jpg           # 你的財神廟照片
└─ supabase/schema.sql            # 資料庫結構，貼到 Supabase 執行
```
