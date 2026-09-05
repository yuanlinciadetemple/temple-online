import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { setSessionCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const accountNo = (body?.account_no as string | undefined)?.trim();
  const password = body?.password as string | undefined;

  if (!accountNo || !password) {
    return NextResponse.json({ error: "請輸入帳號與密碼" }, { status: 400 });
  }

  const { data: account, error } = await supabaseAdmin
    .from("accounts")
    .select("account_no, password_hash, is_admin")
    .eq("account_no", accountNo)
    .single();

  if (error || !account) {
    return NextResponse.json({ error: "帳號或密碼錯誤" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, account.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "帳號或密碼錯誤" }, { status: 401 });
  }

  await setSessionCookie({ account_no: account.account_no, is_admin: account.is_admin });

  return NextResponse.json({ account_no: account.account_no, is_admin: account.is_admin });
}
