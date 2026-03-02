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
        { error: `Payment link for ${plan} plan is not configured.` },
        { status: 500 }
      );
    }

    const checkoutUrl = new URL(paymentLink);
    checkoutUrl.searchParams.set("email", session.user.email);
    checkoutUrl.searchParams.set("metadata_plan", plan);

    // Add redirect url to redirect to dashboard after payment
    const origin = req.headers.get("origin") || req.nextUrl.origin;
    checkoutUrl.searchParams.set("return_url", `${origin}/dashboard`);
    checkoutUrl.searchParams.set("redirect_url", `${origin}/dashboard`);

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
