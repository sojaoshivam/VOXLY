import crypto from "crypto";
import { prisma } from "./db";
import { getSubscriptionExpiry } from "./utils";

// ─── Payment Links ───────────────────────────────────────────────────────────
// These are pre-created in the Dodo Payments dashboard.
// Each plan has a static checkout URL that customers are redirected to.
export const PAYMENT_LINKS: Record<string, string> = {
  creator: process.env.DODO_CREATOR_PAYMENT_LINK || "",
  pro: process.env.DODO_PRO_PAYMENT_LINK || "",
};

export const PLAN_PRICES: Record<string, number> = {
  creator: 299,
  pro: 599,
};

// ─── Webhook Handling ─────────────────────────────────────────────────────────
// Dodo sends a POST to /api/webhooks/dodo-payment when payment succeeds.
export async function handlePaymentWebhook(payload: any): Promise<boolean> {
  try {
    // Dodo webhook payload structure
    const eventType = payload.type || payload.event;
    const data = payload.data || payload;

    const isSuccess =
      eventType === "payment.succeeded" ||
      eventType === "payment_succeeded" ||
      data?.status === "succeeded" ||
      data?.status === "paid";

    if (!isSuccess) {
      console.log("Webhook event ignored (not a success event):", eventType);
      return false;
    }

    // Extract customer email and plan from payload
    const customerEmail =
      data?.customer?.email ||
      data?.customer_email ||
      payload.customer_email;

    // Plan detection logic
    const productId = data?.product_id || data?.items?.[0]?.product_id;
    const metadataPlan = data?.metadata?.plan || payload?.metadata?.plan;
    const amount = data?.amount || data?.total_amount || payload?.amount;

    let plan: string = metadataPlan;

    // Fallback 1: Check Product ID against our known links in env
    if (!plan && productId) {
      if (process.env.DODO_CREATOR_PAYMENT_LINK?.includes(productId)) plan = "creator";
      else if (process.env.DODO_PRO_PAYMENT_LINK?.includes(productId)) plan = "pro";
    }

    // Fallback 2: Infer from amount
    if (!plan) {
      plan = inferPlanFromAmount(amount);
    }

    const paymentId =
      data?.payment_id ||
      data?.id ||
      payload?.payment_id ||
      `dodo-${Date.now()}`;

    if (!customerEmail) {
      console.error("Webhook: missing customer email in payload");
      return false;
    }

    if (!["creator", "pro"].includes(plan)) {
      console.error("Webhook: could not determine plan. Plan detected:", plan);
      console.log("Full data for debugging:", JSON.stringify(data, null, 2));
      return false;
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email: customerEmail } });
    if (!user) {
      console.error("Webhook: user not found for email:", customerEmail);
      return false;
    }

    // Upgrade user's subscription tier
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionTier: plan,
        subscriptionEndsAt: getSubscriptionExpiry(),
        dodoCustomerId: paymentId,
      },
    });

    // Record payment (upsert to handle duplicate webhook events)
    await prisma.payment.upsert({
      where: { dodoOrderId: paymentId },
      update: { status: "completed", completedAt: new Date() },
      create: {
        userId: user.id,
        dodoOrderId: paymentId,
        status: "completed",
        amount: PLAN_PRICES[plan] || 0,
        currency: "INR",
        plan,
        subscriptionMonths: 1,
        completedAt: new Date(),
      },
    });

    console.log(`✅ Upgraded ${customerEmail} to ${plan} plan`);
    return true;
  } catch (err) {
    console.error("handlePaymentWebhook error:", err);
    return false;
  }
}

// Infer plan from amount (usually in paise: 29900 = ₹299)
function inferPlanFromAmount(amount: number | undefined): string {
  if (!amount) return "";

  // Creator is ₹299. With tax/fees, it might be between ₹250 and ₹450 (25000 - 45000 paise)
  if (amount >= 25000 && amount <= 45000) return "creator";

  // Pro is ₹599. With tax/fees, it might be > ₹500 (50000+ paise)
  if (amount >= 50000) return "pro";

  // Fallback for raw rupee values if Dodo ever sends them
  if (amount >= 250 && amount <= 450) return "creator";
  if (amount >= 500 && amount <= 999) return "pro";

  return "";
}

// ─── Webhook Signature Verification ──────────────────────────────────────────
export function verifyWebhookSignature(
  body: string,
  signature: string,
  timestamp: string,
  id: string
): boolean {
  let secret = process.env.DODO_WEBHOOK_SECRET || "";

  if (!secret) {
    console.warn("⚠ DODO_WEBHOOK_SECRET not set — skipping signature verification");
    return true; // Allow in dev
  }

  if (!signature || !timestamp || !id) {
    console.error("Webhook: Missing required Svix headers (signature, timestamp, or id)");
    return false;
  }

  try {
    // Svix signature format: "v1,BASE64_HASH"
    if (!signature.startsWith("v1,")) {
      console.error("Webhook: Unsupported signature version");
      return false;
    }
    const actualSignature = signature.substring(3);

    // Svix secrets often start with "whsec_"
    if (secret.startsWith("whsec_")) {
      secret = secret.substring(6);
    }
    const secretBuffer = Buffer.from(secret, 'base64');

    // Svix string to sign: webhook-id + "." + webhook-timestamp + "." + body
    const toSign = `${id}.${timestamp}.${body}`;
    const hmac = crypto.createHmac("sha256", secretBuffer);
    hmac.update(toSign);
    const expectedBase64 = hmac.digest("base64");

    const isValid = actualSignature === expectedBase64;

    if (!isValid) {
      console.error("Webhook: Svix signature mismatch.");
      console.error(`  Expected: ${expectedBase64}`);
      console.error(`  Received: ${actualSignature}`);
    }
    return isValid;
  } catch (err) {
    console.error("Webhook: Signature verification crash:", err);
    return false;
  }
}
