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

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "權限不足" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("offerings")
    .select("*")
    .order("position", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// 後台新增供品
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "權限不足" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const name = (body?.name as string | undefined)?.trim();
  const iconKey = body?.icon_key as string | undefined;
  const cost = Number(body?.cost);

  if (!name) {
    return NextResponse.json({ error: "請輸入供品名稱" }, { status: 400 });
  }
  if (!iconKey || !VALID_ICON_KEYS.includes(iconKey)) {
    return NextResponse.json({ error: "請選擇有效的圖示" }, { status: 400 });
  }
  if (Number.isNaN(cost) || cost <= 0) {
    return NextResponse.json({ error: "CDTB 點數必須是大於 0 的數字" }, { status: 400 });
  }

  const { data: maxPositionRow } = await supabaseAdmin
    .from("offerings")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPosition = (maxPositionRow?.position ?? 0) + 1;

  const { data, error } = await supabaseAdmin
    .from("offerings")
    .insert({ name, icon_key: iconKey, cost, position: nextPosition })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
