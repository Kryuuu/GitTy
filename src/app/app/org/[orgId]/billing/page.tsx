// ============================================
// GitTy — Billing Page
// ============================================
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { plans, type PlanKey } from "@/lib/config";
import { BillingActions } from "./billing-actions";
import { formatCurrency } from "@/lib/utils";

export default async function BillingPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("org_id", orgId)
    .single();

  const currentPlan = (subscription?.plan || "free") as PlanKey;
  const planConfig = plans[currentPlan];
  const usagePercent = subscription
    ? Math.round((subscription.usage_count / subscription.usage_limit) * 100)
    : 0;

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Billing</h1>
        <p className="text-zinc-400 mt-1">
          Manage your subscription and usage
        </p>
      </div>

      {/* Current Plan */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-zinc-500">Current Plan</p>
            <h2 className="text-2xl font-bold text-white">
              {planConfig.name}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">
              {planConfig.price === 0 ? "Gratis" : formatCurrency(planConfig.price)}
            </p>
            {planConfig.price > 0 && (
              <p className="text-sm text-zinc-500">/bulan</p>
            )}
          </div>
        </div>

        {subscription?.status && (
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`w-2 h-2 rounded-full ${
                subscription.status === "active"
                  ? "bg-green-400"
                  : "bg-yellow-400"
              }`}
            />
            <span className="text-sm text-zinc-400 capitalize">
              {subscription.status}
            </span>
          </div>
        )}

        <div className="space-y-2">
          {planConfig.features.map((feature) => (
            <div key={feature} className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-green-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-sm text-zinc-400">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Usage */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          AI Usage This Period
        </h3>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-zinc-400">
            {subscription?.usage_count?.toLocaleString() || 0} /{" "}
            {subscription?.usage_limit?.toLocaleString() || 500} requests
          </span>
          <span className="text-zinc-500">{usagePercent}%</span>
        </div>
        <div className="w-full h-3 bg-surface-300 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              usagePercent > 80
                ? "bg-red-500"
                : usagePercent > 50
                  ? "bg-yellow-500"
                  : "bg-brand-500"
            }`}
            style={{ width: `${Math.min(usagePercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Upgrade Options */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          {currentPlan === "free" ? "Upgrade Your Plan" : "Manage Subscription"}
        </h3>
        <BillingActions
          orgId={orgId}
          currentPlan={currentPlan}
        />
      </div>
    </div>
  );
}
