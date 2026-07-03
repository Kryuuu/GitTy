// ============================================
// GitTy — Billing Actions (Client)
// ============================================
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { plans, type PlanKey } from "@/lib/config";

interface BillingActionsProps {
  orgId: string;
  currentPlan: PlanKey;
}

export function BillingActions({
  orgId,
  currentPlan,
}: BillingActionsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  async function handleUpgrade(planKey: PlanKey) {
    setIsLoading(planKey);

    try {
      const response = await fetch("/api/midtrans/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          plan: planKey,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to create checkout session");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setIsLoading(null);
    }
  }

  async function handleManage() {
    setIsLoading("manage");
    // Usually with Midtrans, subscription management might be custom UI
    // Since there's no ready portal like Stripe, we can redirect to a contact/support page
    // or implement custom cancel API.
    alert("Subscription management features coming soon");
    setIsLoading(null);
  }

  const planEntries = (
    Object.entries(plans) as [PlanKey, (typeof plans)[PlanKey]][]
  ).filter(([key]) => key !== "free");

  if (currentPlan !== "free") {
    return (
      <Button
        variant="secondary"
        onClick={handleManage}
        isLoading={isLoading === "manage"}
      >
        Manage Subscription
      </Button>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {planEntries.map(([key, plan]) => {
        const isCurrent = key === currentPlan;
        return (
          <div
            key={key}
            className={`rounded-xl p-4 border transition-all ${
              isCurrent
                ? "border-brand-500/50 bg-brand-500/5"
                : "border-surface-400/30 hover:border-surface-400/60"
            }`}
          >
            <h4 className="font-semibold text-white">{plan.name}</h4>
            <p className="text-2xl font-bold text-white mt-1">
              ${plan.price}
              <span className="text-sm text-zinc-500">/mo</span>
            </p>
            <Button
              variant={isCurrent ? "secondary" : "gradient"}
              size="sm"
              className="w-full mt-3"
              disabled={isCurrent}
              isLoading={isLoading === key}
              onClick={() => handleUpgrade(key)}
            >
              {isCurrent ? "Current" : "Upgrade"}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
