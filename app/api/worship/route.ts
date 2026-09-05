import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const offeringId = body?.offering_id as number | undefined;
  if (!offeringId) {
    return NextResponse.json({ error: "缺少供品資訊" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.rpc("worship", {
    p_account_no: session.account_no,
    p_offering_id: offeringId,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ new_points: data });
}
