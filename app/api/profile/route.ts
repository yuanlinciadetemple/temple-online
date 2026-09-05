import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登入" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const realName = String(body?.real_name ?? "").trim();
  const displayName = String(body?.display_name ?? "").trim() || realName;
  const lineDisplayName = String(body?.line_display_name ?? "").trim() || null;
  const address = String(body?.address ?? "").trim();
  const year = Number(body?.lunar_birth_year), month = Number(body?.lunar_birth_month), day = Number(body?.lunar_birth_day);
  const leap = Boolean(body?.lunar_birth_leap_month);
  if (!realName || !address) return NextResponse.json({ error: "請填寫姓名與祈福地址" }, { status: 400 });
  if (!Number.isInteger(year) || year < 1 || !Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(day) || day < 1 || day > 30) return NextResponse.json({ error: "請填寫正確的農曆生日" }, { status: 400 });

  const { error: accountError } = await supabaseAdmin.from("accounts").update({ real_name: realName, display_name: displayName, line_display_name: lineDisplayName, address, lunar_birth_year: year, lunar_birth_month: month, lunar_birth_day: day, lunar_birth_leap_month: leap }).eq("account_no", session.account_no);
  if (accountError) return NextResponse.json({ error: accountError.message }, { status: 500 });

  const { data: self } = await supabaseAdmin.from("prayer_recipients").select("id").eq("account_no", session.account_no).eq("is_default", true).maybeSingle();
  if (self) {
    const { error } = await supabaseAdmin.from("prayer_recipients").update({ relationship: "本人", name: realName, address, lunar_birth_year: year, lunar_birth_month: month, lunar_birth_day: day, lunar_birth_leap_month: leap }).eq("id", self.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await supabaseAdmin.from("prayer_recipients").insert({ account_no: session.account_no, relationship: "本人", name: realName, address, lunar_birth_year: year, lunar_birth_month: month, lunar_birth_day: day, lunar_birth_leap_month: leap, is_default: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
