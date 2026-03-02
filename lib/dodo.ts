import crypto from "crypto";
import { Webhook } from "svix";
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

export function getProductIdForPlan(plan: string): string | null {
  const link = plan === "creator"
    ? process.env.DODO_CREATOR_PAYMENT_LINK
    : process.env.DODO_PRO_PAYMENT_LINK;

  if (!link) return null;
  // Extracts 'pdt_0NZ...' out of https://test.checkout.dodopayments.com/buy/pdt_xyz?quantity=1
  const match = link.match(/pdt_[a-zA-Z0-9]+/);
  return match ? match[0] : null;
}

// ─── Webhook Handling ─────────────────────────────────────────────────────────
// Dodo sends a POST to /api/webhooks/dodo-payment when payment succeeds.
export async function handlePaymentWebhook(payload: any): Promise<{ success: boolean; ignored?: boolean; error?: string }> {
  try {
    // Dodo webhook payload structure
    const eventType = payload.type || payload.event;
    const data = payload.data || payload;

    const isSuccess =
      eventType === "payment.succeeded" ||
      eventType === "payment_succeeded" ||
      eventType === "payment.successful" ||
      eventType === "subscription.active" ||
      eventType === "subscription.created" ||
      eventType === "checkout.session.completed" ||
      data?.status === "succeeded" ||
      data?.status === "paid" ||
      data?.status === "active";

    if (!isSuccess) {
      console.log("Webhook event ignored (not a success event):", eventType);
      return { success: true, ignored: true };
    }

    // Extract customer email and plan from payload
    const customerEmail =
      data?.customer?.email ||
      data?.customer_email ||
      payload.customer_email;

    // Plan detection logic
    const productId = data?.product_id || data?.items?.[0]?.product_id || data?.line_items?.[0]?.product_id;
    const metadataPlan = data?.metadata?.plan || payload?.metadata?.plan || data?.metadata?.metadata_plan || payload?.metadata?.metadata_plan;
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

    const customerId = data?.customer_id || payload?.customer_id || data?.customer?.customer_id;

    if (!customerEmail) {
      console.error("Webhook: missing customer email in payload");
      console.log("Full data for debugging:", JSON.stringify(data, null, 2));
      return { success: false, error: "Missing email" };
    }

    if (!["creator", "pro"].includes(plan)) {
      console.error("Webhook: could not determine plan. Plan detected:", plan);
      console.log("Full data for debugging:", JSON.stringify(data, null, 2));
      return { success: false, error: "Invalid plan" };
    }

    // Find user using lowercase for efficient B-tree index usage
    const user = await prisma.user.findFirst({
      where: {
        email: customerEmail.toLowerCase()
      }
    });
    if (!user) {
      console.error("Webhook: user not found for email:", customerEmail);
      return { success: false, error: "User not found" };
    }

    // Upgrade user's subscription tier
    const userUpdateData: any = {
      subscriptionTier: plan,
      subscriptionEndsAt: getSubscriptionExpiry(),
    };

    if (customerId) {
      userUpdateData.dodoCustomerId = customerId;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: userUpdateData,
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
    return { success: true };
  } catch (err) {
    console.error("handlePaymentWebhook error:", err);
    return { success: false, error: String(err) };
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
    const wh = new Webhook(secret);

    // The Svix Webhook class expects the exact raw string body
    // and an object containing the required headers
    wh.verify(body, {
      "svix-id": id,
      "svix-timestamp": timestamp,
      "svix-signature": signature,
    });

    return true;
  } catch (err) {
    console.error("Webhook: Svix verification failed:", err);
    return false;
  }
}
