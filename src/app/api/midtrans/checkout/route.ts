// ============================================
// GitTy — Midtrans Checkout API Route
// ============================================
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession } from "@/lib/midtrans/server";
import { plans, type PlanKey } from "@/lib/config";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orgId, plan } = await request.json();

    if (!orgId || !plan) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify user is org owner/admin
    const { data: membership } = await supabase
      .from("org_members")
      .select("role")
      .eq("org_id", orgId)
      .eq("user_id", user.id)
      .single();

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return NextResponse.json(
        { error: "Only org owners/admins can manage billing" },
        { status: 403 }
      );
    }

    const planConfig = plans[plan as PlanKey];
    if (!planConfig) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "";
    // Generate a unique order ID for Midtrans
    const orderId = `GITTY-${orgId}-${plan}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

    // Midtrans expects price in IDR for Indonesian merchants.
    // The price in config is already the gross amount needed.
    const priceAmount = planConfig.price;

    const session = await createCheckoutSession({
      orgId,
      price: priceAmount,
      planId: plan,
      orderId: orderId,
      customerEmail: user.email,
      successUrl: `${origin}/app/org/${orgId}/billing`,
    });

    return NextResponse.json({ url: session.redirect_url, token: session.token });
  } catch (error) {
    console.error("Midtrans checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
