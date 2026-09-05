import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { setSessionCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const password = body?.password as string | undefined;
  const realName = String(body?.real_name ?? "").trim();
  const displayName = String(body?.display_name ?? "").trim() || realName || null;
  const lineDisplayName = String(body?.line_display_name ?? "").trim() || null;
  const address = String(body?.address ?? "").trim();
  const year = Number(body?.lunar_birth_year);
  const month = Number(body?.lunar_birth_month);
  const day = Number(body?.lunar_birth_day);
  const leap = Boolean(body?.lunar_birth_leap_month);

  if (!password || password.length < 4) return NextResponse.json({ error: "密碼至少需要 4 個字元" }, { status: 400 });
  if (!realName) return NextResponse.json({ error: "請輸入姓名" }, { status: 400 });
  if (!address) return NextResponse.json({ error: "請輸入祈福地址" }, { status: 400 });
  if (!Number.isInteger(year) || year < 1 || !Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(day) || day < 1 || day > 30) {
    return NextResponse.json({ error: "請填寫正確的農曆生日" }, { status: 400 });
  }

  const { data: accountNoData, error: seqError } = await supabaseAdmin.rpc("next_account_no");
  if (seqError || !accountNoData) return NextResponse.json({ error: "無法建立帳號，請稍後再試" }, { status: 500 });
  const accountNo = accountNoData as string;
  const passwordHash = await bcrypt.hash(password, 10);

  const { error: insertError } = await supabaseAdmin.from("accounts").insert({
    account_no: accountNo,
    display_name: displayName,
    real_name: realName,
    lunar_birth_year: year,
    lunar_birth_month: month,
    lunar_birth_day: day,
    lunar_birth_leap_month: leap,
    address,
    line_display_name: lineDisplayName,
    password_hash: passwordHash,
    points: 0,
  });
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  const { error: recipientError } = await supabaseAdmin.from("prayer_recipients").insert({
    account_no: accountNo,
    relationship: "本人",
    name: realName,
    lunar_birth_year: year,
    lunar_birth_month: month,
    lunar_birth_day: day,
    lunar_birth_leap_month: leap,
    address,
    is_default: true,
  });
  if (recipientError) {
    await supabaseAdmin.from("accounts").delete().eq("account_no", accountNo);
    return NextResponse.json({ error: recipientError.message }, { status: 500 });
  }

  await setSessionCookie({ account_no: accountNo, is_admin: false });
  return NextResponse.json({ account_no: accountNo });
}
