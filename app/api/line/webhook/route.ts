import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

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

  console.log("LINE webhook received:", JSON.stringify(data));

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "員林財德宮 LINE Webhook",
  });
}
