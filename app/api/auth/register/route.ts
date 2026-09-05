import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { setSessionCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const password = body?.password as string | undefined;
  const displayName = (body?.display_name as string | undefined)?.trim() || null;

  if (!password || password.length < 4) {
    return NextResponse.json({ error: "密碼至少需要 4 個字元" }, { status: 400 });
  }

  const { data: accountNoData, error: seqError } = await supabaseAdmin.rpc("next_account_no");
  if (seqError || !accountNoData) {
    return NextResponse.json({ error: "無法建立帳號，請稍後再試" }, { status: 500 });
  }
  const accountNo = accountNoData as string;

  const passwordHash = await bcrypt.hash(password, 10);

  const { error: insertError } = await supabaseAdmin.from("accounts").insert({
    account_no: accountNo,
    display_name: displayName,
    password_hash: passwordHash,
    points: 0,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await setSessionCookie({ account_no: accountNo, is_admin: false });

  return NextResponse.json({ account_no: accountNo });
}
