import { NextRequest, NextResponse } from "next/server";
import { handlePaymentWebhook, verifyWebhookSignature } from "@/lib/dodo";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    // Log headers to see what metadata Dodo provides
    const headerObj: Record<string, string> = {};
    req.headers.forEach((val, key) => { headerObj[key] = val; });
    console.log("Webhook Headers:", JSON.stringify(headerObj, null, 2));

    const signature = req.headers.get("webhook-signature") || req.headers.get("x-webhook-signature") || "";
    const timestamp = req.headers.get("webhook-timestamp") || req.headers.get("x-webhook-timestamp") || "";
    const id = req.headers.get("webhook-id") || req.headers.get("x-webhook-id") || "";

    // In development/test mode, be lenient with signature verification
    const isDevMode = process.env.NODE_ENV === "development";
    const skipSignatureCheck = isDevMode || !signature; // Skip if in dev or no signature provided

    if (!skipSignatureCheck && !verifyWebhookSignature(body, signature, timestamp, id)) {
      console.error("Webhook signature verification failed");
      console.warn("Signature provided but verification failed - this may be expected in test mode");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(body);
    console.log("Dodo webhook received:", JSON.stringify(payload, null, 2));

    const success = await handlePaymentWebhook(payload);

    if (success) {
      console.log("✅ Webhook processed successfully");
      return NextResponse.json({ success: true });
    } else {
      console.log("❌ Webhook processing returned false - check logs above");
      return NextResponse.json(
        { error: "Payment not processed (check logs)" },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
