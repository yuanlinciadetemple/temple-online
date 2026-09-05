import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "權限不足" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("accounts")
    .select("account_no, display_name, points, is_admin, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// 後台手動新增帳號（例如幫現場信眾直接開帳號）
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "權限不足" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const password = body?.password as string | undefined;
  const displayName = (body?.display_name as string | undefined)?.trim() || null;
  const initialPoints = Number(body?.points ?? 0);

  if (!password || password.length < 4) {
    return NextResponse.json({ error: "密碼至少需要 4 個字元" }, { status: 400 });
  }
  if (Number.isNaN(initialPoints) || initialPoints < 0) {
    return NextResponse.json({ error: "初始點數不可為負數" }, { status: 400 });
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
    points: initialPoints,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ account_no: accountNo });
}
