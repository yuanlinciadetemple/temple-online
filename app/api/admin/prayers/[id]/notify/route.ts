import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function sendLinePush(lineUserId: string, message: string) {
  const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  if (!accessToken) {
    return false;
  }

  const response = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      to: lineUserId,
      messages: [{ type: "text", text: message }],
    }),
  });

  if (!response.ok) {
    console.error(
      "LINE resend failed:",
      response.status,
      await response.text()
    );
    return false;
  }

  return true;
}

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json({ error: "權限不足" }, { status: 403 });
  }

  const orderId = Number(params.id);

  if (!Number.isFinite(orderId)) {
    return NextResponse.json(
      { error: "敬獻編號錯誤" },
      { status: 400 }
    );
  }

  const { data: order } = await supabaseAdmin
    .from("worship_orders")
    .select(
      "id, order_no, account_no, prayer_name, status, completed_at, line_notify_status"
    )
    .eq("id", orderId)
    .single();

  if (!order) {
    return NextResponse.json(
      { error: "找不到這筆敬獻紀錄" },
      { status: 404 }
    );
  }

  if (order.status !== "completed") {
    return NextResponse.json(
      { error: "祈福尚未完成，不能發送完成通知" },
      { status: 400 }
    );
  }

  if (order.line_notify_status === "sent") {
    return NextResponse.json(
      { error: "這筆 LINE 通知已成功送出，不能重複發送" },
      { status: 400 }
    );
  }

  const { data: account } = await supabaseAdmin
    .from("accounts")
    .select("line_user_id")
    .eq("account_no", order.account_no)
    .single();

  if (!account?.line_user_id) {
    await supabaseAdmin
      .from("worship_orders")
      .update({
        line_notify_status: "unbound",
        line_notified_at: null,
      })
      .eq("id", orderId);

    return NextResponse.json(
      { error: "會員尚未綁定 LINE" },
      { status: 400 }
    );
  }

  const { data: items } = await supabaseAdmin
    .from("worship_order_items")
    .select("offering_name")
    .eq("worship_order_id", orderId)
    .order("id", { ascending: true });

  const offeringNames =
    items?.map((item) => item.offering_name).join("、") ||
    "敬獻供品";

  const completedTime = order.completed_at
    ? new Date(order.completed_at).toLocaleString("zh-TW", {
        timeZone: "Asia/Taipei",
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const message =
`🙏 員林財德宮祈福通知

祈福對象：${order.prayer_name}
敬獻供品：${offeringNames}
敬獻編號：${order.order_no}

宮方已完成本次祈福作業。
${completedTime ? `完成時間：${completedTime}` : ""}

敬祝
闔家平安・財源廣進

員林財德宮 敬啟`;

  const sent = await sendLinePush(account.line_user_id, message);

  await supabaseAdmin
    .from("worship_orders")
    .update({
      line_notify_status: sent ? "sent" : "failed",
      line_notified_at: sent ? new Date().toISOString() : null,
    })
    .eq("id", orderId);

  if (!sent) {
    return NextResponse.json(
      { error: "LINE 通知仍然傳送失敗，請稍後再試" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "LINE 通知已重新傳送",
  });
}
