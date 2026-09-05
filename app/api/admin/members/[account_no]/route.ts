import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(_req: NextRequest, { params }: { params: { account_no: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "權限不足" }, { status: 403 });
  const cutoff = new Date(); cutoff.setMonth(cutoff.getMonth() - 18);
  const [{ data: member, error: memberError }, { data: recipients }, { data: orders }] = await Promise.all([
    supabaseAdmin.from("accounts").select("account_no,display_name,real_name,lunar_birth_year,lunar_birth_month,lunar_birth_day,lunar_birth_leap_month,address,line_display_name,points,is_admin,created_at").eq("account_no", params.account_no).single(),
    supabaseAdmin.from("prayer_recipients").select("*").eq("account_no", params.account_no).order("is_default", { ascending: false }),
    supabaseAdmin.from("worship_orders").select("*, items:worship_order_items(*)").eq("account_no", params.account_no).gte("created_at", cutoff.toISOString()).order("created_at", { ascending: false }).limit(100),
  ]);
  if (memberError) return NextResponse.json({ error: "找不到會員" }, { status: 404 });
  return NextResponse.json({ member, recipients: recipients ?? [], orders: orders ?? [] });
}
