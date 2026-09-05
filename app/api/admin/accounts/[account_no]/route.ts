import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/requireAdmin";

// 調整點數 / 重設密碼
export async function PATCH(
  req: NextRequest,
  { params }: { params: { account_no: string } }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "權限不足" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const updates: Record<string, unknown> = {};

  if (body?.points !== undefined) {
    const points = Number(body.points);
    if (Number.isNaN(points) || points < 0) {
      return NextResponse.json({ error: "點數不可為負數" }, { status: 400 });
    }
    updates.points = points;
  }

  if (body?.new_password) {
    const newPassword = String(body.new_password);
    if (newPassword.length < 4) {
      return NextResponse.json({ error: "密碼至少需要 4 個字元" }, { status: 400 });
    }
    updates.password_hash = await bcrypt.hash(newPassword, 10);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "沒有要更新的內容" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("accounts")
    .update(updates)
    .eq("account_no", params.account_no);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// 刪除帳號
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { account_no: string } }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "權限不足" }, { status: 403 });
  }

  if (params.account_no === admin.account_no) {
    return NextResponse.json({ error: "不能刪除自己目前登入的管理員帳號" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("accounts")
    .delete()
    .eq("account_no", params.account_no);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
