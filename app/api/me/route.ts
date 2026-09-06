import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登入" }, { status: 401 });

  const { data: account, error } = await supabaseAdmin
    .from("accounts")
    .select("account_no, display_name, real_name, lunar_birth_year, lunar_birth_month, lunar_birth_day, lunar_birth_leap_month, address, line_display_name, points, is_admin, created_at, line_user_id").eq("account_no", session.account_no)
    .single();

  if (error || !account) return NextResponse.json({ error: "找不到帳號資料" }, { status: 404 });
  return NextResponse.json(account);
}
