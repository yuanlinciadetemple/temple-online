import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import crypto from "crypto";

export async function POST() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "請先登入" }, { status: 401 });
  }

  // 先確認會員是否已經綁定 LINE
  const { data: account, error: accountError } = await supabaseAdmin
    .from("accounts")
    .select("account_no, line_user_id")
    .eq("account_no", session.account_no)
    .single();

  if (accountError || !account) {
    return NextResponse.json({ error: "找不到會員資料" }, { status: 404 });
  }

  if (account.line_user_id) {
    return NextResponse.json(
      { error: "此會員已經綁定 LINE", already_bound: true },
      { status: 400 }
    );
  }

  // 將這個會員之前尚未使用的綁定碼作廢
  await supabaseAdmin
    .from("line_binding_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("account_no", session.account_no)
    .is("used_at", null);

  // 產生 6 位數字綁定碼
  let code = "";

  for (let i = 0; i < 10; i++) {
    code = crypto.randomInt(100000, 1000000).toString();

    const { data: existing } = await supabaseAdmin
      .from("line_binding_codes")
      .select("id")
      .eq("code", code)
      .maybeSingle();

    if (!existing) break;
  }

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const { error } = await supabaseAdmin.from("line_binding_codes").insert({
    account_no: session.account_no,
    code,
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    console.error("建立 LINE 綁定碼失敗:", error);
    return NextResponse.json(
      { error: "無法建立 LINE 綁定碼" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    code,
    expires_at: expiresAt.toISOString(),
    expires_in_minutes: 10,
  });
}
