import { NextRequest, NextResponse } from "next/server";
import { handlePaymentWebhook } from "@/lib/dodo";

/**
 * TEST ENDPOINT: Manually trigger a payment webhook for testing
 * Only works in development mode
 *
 * Usage: POST /api/webhooks/test-dodo-payment
 * Body: { email: "user@example.com", plan: "creator" or "pro", amount: 29900 }
 */
export async function POST(req: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Test endpoint only available in development" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { email, plan, amount } = body;

    if (!email || !plan) {
      return NextResponse.json(
        { error: "Missing email or plan. Expected: { email, plan, amount? }" },
        { status: 400 }
      );
    }

    // Simulate a DODO webhook payload
    const mockPayload = {
      type: "payment.succeeded",
      data: {
        payment_id: `test_${Date.now()}`,
        status: "paid",
        customer_email: email,
        amount: amount || (plan === "creator" ? 29900 : 59900), // in paise
        metadata: {
          plan: plan,
        },
      },
    };

    console.log("🧪 TEST: Simulating webhook payload:", JSON.stringify(mockPayload, null, 2));

    const success = await handlePaymentWebhook(mockPayload);

    if (success) {
      console.log("✅ TEST: Webhook simulation succeeded");
      return NextResponse.json({
        success: true,
        message: `User ${email} upgraded to ${plan} plan`,
      });
    } else {
      console.log("❌ TEST: Webhook simulation failed");
      return NextResponse.json(
        { error: "Webhook processing failed - check logs" },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("Test webhook error:", err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
