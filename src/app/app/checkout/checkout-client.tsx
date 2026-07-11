"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { plans, type PlanKey } from "@/lib/config";
import type { Organization } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { loadMidtransSnap } from "@/lib/midtrans/client";

declare global {
  interface Window {
    snap: any;
  }
}

export function CheckoutClient({ orgs }: { orgs: Organization[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planKey = (searchParams.get("plan") as PlanKey) || "pro";
  const plan = plans[planKey];

  const [selectedOrgId, setSelectedOrgId] = useState<string>(
    orgs.length > 0 ? orgs[0].id : ""
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Preload snap.js
    loadMidtransSnap().catch(console.error);
  }, []);

  if (!plan) {
    return (
      <div className="text-center">
        <h2 className="text-xl text-white">Plan not found</h2>
        <Link href="/pricing" className="text-brand-400 hover:underline mt-4 inline-block">
          Return to pricing
        </Link>
      </div>
    );
  }

  async function handleCheckout() {
    if (!selectedOrgId) {
      setError("Please select an organization");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      await loadMidtransSnap(); // Ensure loaded

      const res = await fetch("/api/midtrans/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: selectedOrgId,
          plan: planKey,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate checkout");
      }

      if (data.token) {
        // Embed the Snap UI directly in our page instead of a popup
        window.snap.embed(data.token, {
          embedId: "snap-container",
          onSuccess: function (result: any) {
            router.push(`/app/org/${selectedOrgId}/billing?success=true`);
          },
          onPending: function (result: any) {
            router.push(`/app/org/${selectedOrgId}/billing?pending=true`);
          },
          onError: function (result: any) {
            setError("Payment failed. Please try again.");
            setIsProcessing(false);
          },
          onClose: function () {
            setIsProcessing(false);
          },
        });
      } else if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setIsProcessing(false);
    }
  }

  return (
    <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 relative">
      {/* Decorative Orbs */}
      <div className="orb orb-violet w-[300px] h-[300px] -top-20 -left-20 opacity-50" />
      <div className="orb orb-cyan w-[250px] h-[250px] bottom-0 -right-20 opacity-50" />

      {/* Plan Summary */}
      <div className="glass-card p-8 rounded-3xl border border-surface-300/30 flex flex-col relative z-10 overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <h2 className="text-sm font-bold uppercase tracking-wider text-brand-400 mb-2">Order Summary</h2>
        <h1 className="text-3xl font-bold text-white mb-2">{plan.name} Plan</h1>
        <div className="flex items-end gap-1 mb-6">
          <span className="text-4xl font-black text-white">
            Rp {plan.price.toLocaleString("id-ID")}
          </span>
          <span className="text-zinc-400 mb-1">/month</span>
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4">What's included:</h3>
          <ul className="space-y-3">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-zinc-300 text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Checkout Form & Embed Container */}
      <div className="glass-card p-8 rounded-3xl border border-surface-300/30 relative z-10 flex flex-col justify-center min-h-[400px]">
        {isProcessing ? (
          <div id="snap-container" className="w-full h-full min-h-[400px] rounded-xl overflow-hidden bg-white/5 relative">
            <div className="absolute inset-0 flex items-center justify-center -z-10 animate-pulse text-brand-500 text-sm">
              Loading Secure Checkout...
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Complete Payment</h2>
              <p className="text-sm text-zinc-400">
                Select your organization and proceed to secure checkout.
              </p>
            </div>

            {orgs.length === 0 ? (
              <div className="p-6 bg-surface-200/50 rounded-2xl border border-surface-300 text-center">
                <h3 className="text-white font-medium mb-2">No Organization Found</h3>
                <p className="text-sm text-zinc-400 mb-4">
                  You need an organization to subscribe to a plan.
                </p>
                <Button onClick={() => router.push("/app/orgs")} variant="gradient" className="w-full">
                  Create Organization
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                    Target Organization
                  </label>
                  <select
                    value={selectedOrgId}
                    onChange={(e) => setSelectedOrgId(e.target.value)}
                    className="w-full bg-surface-300/50 border border-surface-400/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all appearance-none cursor-pointer"
                  >
                    {orgs.map((org) => (
                      <option key={org.id} value={org.id} className="bg-surface-100">
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                    {error}
                  </div>
                )}

                <div className="pt-4 border-t border-surface-400/30">
                  <Button
                    onClick={handleCheckout}
                    isLoading={isProcessing}
                    variant="gradient"
                    size="lg"
                    className="w-full text-base py-6 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-[url('/file.svg')] opacity-20 group-hover:scale-110 transition-transform duration-500 bg-center" />
                    <span className="relative z-10 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      Proceed to Payment
                    </span>
                  </Button>
                  <p className="text-center text-xs text-zinc-500 mt-4 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Secured by Midtrans
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
