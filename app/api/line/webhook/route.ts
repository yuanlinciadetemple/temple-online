import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

type LineEvent = {
  type?: string;
  replyToken?: string;
  source?: {
    type?: string;
    userId?: string;
  };
  message?: {
    type?: string;
    text?: string;
  };
};

async function replyLine(replyToken: string, text: string) {
  const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  if (!accessToken) {
    console.error("LINE_CHANNEL_ACCESS_TOKEN is missing");
    return;
  }

  const response = await fetch(
    "https://api.line.me/v2/bot/message/reply",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        replyToken,
        messages: [
          {
            type: "text",
            text,
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    console.error(
      "LINE reply failed:",
      response.status,
      await response.text()
    );
  }
}

export async function POST(req: NextRequest) {
  const channelSecret = process.env.LINE_CHANNEL_SECRET;

  if (!channelSecret) {
    console.error("LINE_CHANNEL_SECRET is missing");

    return NextResponse.json(
      { error: "LINE_CHANNEL_SECRET is missing" },
      { status: 500 }
    );
  }

  const body = await req.text();
  const signature = req.headers.get("x-line-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing LINE signature" },
      { status: 401 }
    );
  }

  const expectedSignature = crypto
    .createHmac("sha256", channelSecret)
    .update(body)
    .digest("base64");

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return NextResponse.json(
      { error: "Invalid LINE signature" },
      { status: 401 }
    );
  }

  const data = JSON.parse(body);
  const events: LineEvent[] = Array.isArray(data.events)
    ? data.events
    : [];

  for (const event of events) {
    if (
      event.type !== "message" ||
      event.message?.type !== "text" ||
      !event.replyToken
    ) {
      continue;
    }

    const text = event.message.text?.trim() ?? "";
    const lineUserId = event.source?.userId;

    // 只有 6 位純數字才視為會員綁定碼
    if (!/^\d{6}$/.test(text)) {
      continue;
    }

    if (!lineUserId) {
      await replyLine(
        event.replyToken,
        "無法取得您的 LINE 使用者資料，請改用一對一聊天室進行綁定。"
      );
      continue;
    }

    // 查詢有效、未使用、未過期的綁定碼
    const { data: binding, error: bindingError } =
      await supabaseAdmin
        .from("line_binding_codes")
        .select("id, account_no, expires_at, used_at")
        .eq("code", text)
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

    if (bindingError) {
      console.error("查詢 LINE 綁定碼失敗:", bindingError);

      await replyLine(
        event.replyToken,
        "系統暫時無法處理綁定，請稍後再試。"
      );
      continue;
    }

    if (!binding) {
      await replyLine(
        event.replyToken,
        "這組綁定碼無效或已超過 10 分鐘，請回到網路財神廟重新產生綁定碼。"
      );
      continue;
    }

    // 檢查這個 LINE 是否已綁到其他會員
    const { data: existingAccount } = await supabaseAdmin
      .from("accounts")
      .select("account_no")
      .eq("line_user_id", lineUserId)
      .maybeSingle();

    if (
      existingAccount &&
      existingAccount.account_no !== binding.account_no
    ) {
      await replyLine(
        event.replyToken,
        "此 LINE 帳號已綁定其他會員帳號，如需變更請聯絡員林財德宮。"
      );
      continue;
    }

    // 將 LINE User ID 寫入會員
    const { error: updateError } = await supabaseAdmin
      .from("accounts")
      .update({
        line_user_id: lineUserId,
        line_bound_at: new Date().toISOString(),
      })
      .eq("account_no", binding.account_no);

    if (updateError) {
      console.error("綁定 LINE 會員失敗:", updateError);

      await replyLine(
        event.replyToken,
        "LINE 綁定失敗，請稍後重新產生綁定碼再試。"
      );
      continue;
    }

    // 綁定碼使用後立即失效
    await supabaseAdmin
      .from("line_binding_codes")
      .update({
        used_at: new Date().toISOString(),
      })
      .eq("id", binding.id);

    await replyLine(
      event.replyToken,
      `綁定成功！\n您已成功綁定員林財德宮網路財神廟會員 ${binding.account_no}。\n未來宮方完成您的祈福作業後，可透過 LINE 官方帳號通知您。`
    );

    console.log(
      `LINE 綁定成功：會員 ${binding.account_no}`
    );
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "員林財德宮 LINE Webhook",
  });
}
