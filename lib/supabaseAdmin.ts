import { createClient } from "@supabase/supabase-js";

// 這個檔案只能在伺服器端（API routes）使用，絕對不要 import 到任何
// 標記 "use client" 的檔案裡，否則 service role key 會外洩到瀏覽器。

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.warn(
    "[supabaseAdmin] 尚未設定 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY，請檢查 .env.local"
  );
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});
