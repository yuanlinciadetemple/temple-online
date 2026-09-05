import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登入" }, { status: 401 });
  const { data: target } = await supabaseAdmin.from("prayer_recipients").select("is_default").eq("id", params.id).eq("account_no", session.account_no).maybeSingle();
  if (!target) return NextResponse.json({ error: "找不到祈福對象" }, { status: 404 });
  if (target.is_default) return NextResponse.json({ error: "本人祈福資料不能刪除" }, { status: 400 });
  const { error } = await supabaseAdmin.from("prayer_recipients").delete().eq("id", params.id).eq("account_no", session.account_no);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
