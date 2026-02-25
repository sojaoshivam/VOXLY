import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PAYMENT_LINKS } from "@/lib/dodo";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await req.json();

    if (!plan || !["creator", "pro"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan. Must be 'creator' or 'pro'." },
        { status: 400 }
      );
    }

    const paymentLink = PAYMENT_LINKS[plan];

    if (!paymentLink) {
      return NextResponse.json(
        { error: `Payment link not configured for ${plan} plan. Set DODO_${plan.toUpperCase()}_PAYMENT_LINK in .env.local` },
        { status: 500 }
      );
    }

    // Append customer email and plan metadata as query params
    const checkoutUrl = new URL(paymentLink);
    checkoutUrl.searchParams.set("email", session.user.email);
    checkoutUrl.searchParams.set("metadata[plan]", plan);

    // Add return url to redirect to dashboard after payment
    const origin = req.headers.get("origin") || req.nextUrl.origin;
    checkoutUrl.searchParams.set("return_url", `${origin}/dashboard`);

    return NextResponse.json({
      checkoutUrl: checkoutUrl.toString(),
      plan,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout" },
      { status: 500 }
    );
  }
}
