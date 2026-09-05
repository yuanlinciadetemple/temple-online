import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登入" }, { status: 401 });
  const cutoff = new Date(); cutoff.setMonth(cutoff.getMonth() - 18);
  const { data, error } = await supabaseAdmin.from("worship_orders").select("*, items:worship_order_items(*)").eq("account_no", session.account_no).gte("created_at", cutoff.toISOString()).order("created_at", { ascending: false }).limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登入" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const recipientId = Number(body?.recipient_id);
  const offeringIds = Array.isArray(body?.offering_ids) ? [...new Set(body.offering_ids.map(Number).filter(Number.isFinite))] : [];
  if (!recipientId || offeringIds.length === 0) return NextResponse.json({ error: "請選擇祈福對象與至少一項供品" }, { status: 400 });
  const { data, error } = await supabaseAdmin.rpc("create_worship_order", { p_account_no: session.account_no, p_recipient_id: recipientId, p_offering_ids: offeringIds });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
