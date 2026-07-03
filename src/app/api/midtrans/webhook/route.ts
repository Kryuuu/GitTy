// ============================================
// GitTy — Midtrans Webhook Handler
// ============================================
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Midtrans sends signature_key to verify authenticity
    const { 
      signature_key, 
      order_id, 
      status_code, 
      gross_amount, 
      transaction_status,
      custom_field1: orgId,
      custom_field2: plan
    } = body;

    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const hash = crypto.createHash("sha512").update(`${order_id}${status_code}${gross_amount}${serverKey}`).digest("hex");

    if (hash !== signature_key) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const usageLimits: Record<string, number> = {
      pro: 10000,
      team: 50000,
      enterprise: -1,
    };

    if (transaction_status === "capture" || transaction_status === "settlement") {
      // Payment successful
      const now = new Date();
      const nextMonth = new Date(now.setMonth(now.getMonth() + 1));

      if (orgId && plan) {
        await supabase
          .from("subscriptions")
          .update({
            plan,
            status: "active",
            usage_limit: usageLimits[plan] || 10000,
            usage_count: 0,
            current_period_start: new Date().toISOString(),
            current_period_end: nextMonth.toISOString(),
          })
          .eq("org_id", orgId);
      }
    } else if (transaction_status === "cancel" || transaction_status === "deny" || transaction_status === "expire") {
      // Payment failed/canceled
      if (orgId) {
        await supabase
          .from("subscriptions")
          .update({
            status: "past_due"
          })
          .eq("org_id", orgId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
