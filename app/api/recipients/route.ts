import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登入" }, { status: 401 });
  const { data, error } = await supabaseAdmin.from("prayer_recipients").select("*").eq("account_no", session.account_no).order("is_default", { ascending: false }).order("created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登入" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const relationship = String(body?.relationship ?? "家人").trim() || "家人";
  const address = String(body?.address ?? "").trim();
  const year = Number(body?.lunar_birth_year), month = Number(body?.lunar_birth_month), day = Number(body?.lunar_birth_day);
  if (!name || !address) return NextResponse.json({ error: "請填寫姓名與祈福地址" }, { status: 400 });
  if (!Number.isInteger(year) || year < 1 || !Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(day) || day < 1 || day > 30) return NextResponse.json({ error: "請填寫正確的農曆生日" }, { status: 400 });
  const { data, error } = await supabaseAdmin.from("prayer_recipients").insert({ account_no: session.account_no, relationship, name, address, lunar_birth_year: year, lunar_birth_month: month, lunar_birth_day: day, lunar_birth_leap_month: Boolean(body?.lunar_birth_leap_month), is_default: false }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
