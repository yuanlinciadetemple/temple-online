import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "權限不足" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const q = (searchParams.get("q") ?? "").trim();
  const today = searchParams.get("today") === "1";
  let query = supabaseAdmin.from("worship_orders").select("*, items:worship_order_items(*), member:accounts!worship_orders_account_no_fkey(display_name,real_name,line_display_name)").order("created_at", { ascending: false }).limit(200);
  if (status === "pending" || status === "completed") query = query.eq("status", status);
  if (today) {
    const now = new Date();
    const taipei = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Taipei" }));
    taipei.setHours(0, 0, 0, 0);
    const offset = now.getTime() - new Date(now.toLocaleString("en-US", { timeZone: "Asia/Taipei" })).getTime();
    const startUtc = new Date(taipei.getTime() + offset);
    const endUtc = new Date(startUtc.getTime() + 86400000);
    query = query.gte("created_at", startUtc.toISOString()).lt("created_at", endUtc.toISOString());
  }
  if (q) query = query.or(`order_no.ilike.%${q}%,account_no.ilike.%${q}%,prayer_name.ilike.%${q}%`);
  const { data, error } = await query;

if (error) {
  return NextResponse.json({ error: error.message }, { status: 500 });
}

const accountNos = [...new Set((data ?? []).map((o: any) => o.account_no))];

const { data: accounts } = accountNos.length
  ? await supabaseAdmin
      .from("accounts")
      .select("account_no, line_user_id")
      .in("account_no", accountNos)
  : { data: [] };

const lineMap = new Map(
  (accounts ?? []).map((a: any) => [a.account_no, !!a.line_user_id])
);

const result = (data ?? []).map((o: any) => ({
  ...o,
  line_bound: lineMap.get(o.account_no) ?? false,
}));

return NextResponse.json(result);}
