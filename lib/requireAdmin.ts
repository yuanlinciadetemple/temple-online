import { getSession, SessionPayload } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// 這裡刻意重新查一次資料庫，而不是只信任 cookie 裡的 is_admin。
// 因為如果有人被取消管理員資格，他手上舊的登入 cookie（最長 30 天內都有效）
// 不應該繼續被當成管理員使用，所以每次都要用資料庫裡「現在」的狀態為準。
export async function requireAdmin(): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session) return null;

  const { data: account, error } = await supabaseAdmin
    .from("accounts")
    .select("account_no, is_admin")
    .eq("account_no", session.account_no)
    .single();

  if (error || !account || !account.is_admin) return null;
  return { account_no: account.account_no, is_admin: true };
}
