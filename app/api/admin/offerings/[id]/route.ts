import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/requireAdmin";

const VALID_ICON_KEYS = [
  "flower",
  "fruit",
  "incense",
  "joss_small",
  "joss",
  "treasury",
  "ingot",
  "snack",
  "pastry",
];

// 編輯供品（名稱／圖示／點數／排序／上下架）
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "權限不足" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const updates: Record<string, unknown> = {};

  if (body?.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) return NextResponse.json({ error: "名稱不可為空" }, { status: 400 });
    updates.name = name;
  }
  if (body?.icon_key !== undefined) {
    if (!VALID_ICON_KEYS.includes(body.icon_key)) {
      return NextResponse.json({ error: "無效的圖示" }, { status: 400 });
    }
    updates.icon_key = body.icon_key;
  }
  if (body?.cost !== undefined) {
    const cost = Number(body.cost);
    if (Number.isNaN(cost) || cost <= 0) {
      return NextResponse.json({ error: "CDTB 點數必須是大於 0 的數字" }, { status: 400 });
    }
    updates.cost = cost;
  }
  if (body?.position !== undefined) {
    const position = Number(body.position);
    if (Number.isNaN(position)) {
      return NextResponse.json({ error: "排序必須是數字" }, { status: 400 });
    }
    updates.position = position;
  }
  if (body?.is_active !== undefined) {
    updates.is_active = Boolean(body.is_active);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "沒有要更新的內容" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("offerings")
    .update(updates)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// 刪除供品：如果已經有人敬獻過（worship_log 有引用），資料庫會擋下實體刪除，
// 這裡會自動改成「下架」，保留歷史紀錄完整。
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "權限不足" }, { status: 403 });
  }

  const { error: deleteError } = await supabaseAdmin
    .from("offerings")
    .delete()
    .eq("id", params.id);

  if (!deleteError) {
    return NextResponse.json({ ok: true, mode: "deleted" });
  }

  // 23503 = foreign key violation，代表這個供品已經有敬獻紀錄，改成下架
  const { error: deactivateError } = await supabaseAdmin
    .from("offerings")
    .update({ is_active: false })
    .eq("id", params.id);

  if (deactivateError) {
    return NextResponse.json({ error: deactivateError.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    mode: "deactivated",
    message: "這個供品已經有人敬獻過，無法直接刪除，已自動改為下架",
  });
}
