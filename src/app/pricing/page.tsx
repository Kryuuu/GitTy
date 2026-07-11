// ============================================
// GitTy — Pricing Page
// ============================================
import Link from "next/link";
import { siteConfig, plans } from "@/lib/config";
import { formatCurrency } from "@/lib/utils";

export const metadata = {
  title: `Pricing — ${siteConfig.name}`,
  description: "Simple, transparent pricing for teams of all sizes.",
};

export default function PricingPage() {
  const planEntries = Object.entries(plans) as [
    string,
    (typeof plans)[keyof typeof plans],
  ][];

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Nav */}
      <header className="border-b border-surface-300/30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="GitTy Logo" className="h-10 w-auto object-contain" />
            <span className="text-lg font-bold text-white">
              {siteConfig.name}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm gradient-brand text-white px-4 py-2 rounded-xl"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-zinc-400 max-w-lg mx-auto">
            Start free and scale as you grow. No hidden fees. Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {planEntries.map(([key, plan]) => (
            <div
              key={key}
              className={`flex flex-col h-full rounded-2xl p-6 transition-all ${
                key === "team"
                  ? "gradient-border bg-surface-100 ring-1 ring-brand-500/20 scale-[1.02]"
                  : "glass-card"
              }`}
            >
              {key === "team" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-500/10 text-brand-400 border border-brand-500/20 mb-4">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
              <div className="mt-3 mb-6">
                <span className="text-3xl font-bold text-white">
                  {plan.price === 0 ? "Gratis" : formatCurrency(plan.price)}
                </span>
                {plan.price > 0 && (
                  <span className="text-zinc-500 text-sm">/bulan</span>
                )}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-zinc-400"
                  >
                    <svg
                      className="w-4 h-4 text-green-400 mt-0.5 shrink-0"
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
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.price === 0 ? "/register" : `/app/checkout?plan=${key}`}
                className={`mt-auto block text-center py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                  key === "team"
                    ? "bg-gradient-to-r from-brand-500 to-purple-600 text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/50 hover:scale-[1.02]"
                    : "bg-surface-200 text-white hover:bg-surface-300 border border-surface-300/50 hover:border-surface-300"
                }`}
              >
                {plan.price === 0 ? "Get Started Free" : `Get ${plan.name} Plan`}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Can I try GitTy for free?",
                a: "Yes! The Free plan gives you access to core features including AI assistant, 3 projects, and 500 AI requests per month. No credit card required.",
              },
              {
                q: "How does AI usage billing work?",
                a: "Each plan comes with a monthly AI request allowance. If you need more, you can upgrade your plan at any time. Enterprise plans offer unlimited AI usage.",
              },
              {
                q: "Can I cancel my subscription?",
                a: "Absolutely. You can cancel your subscription at any time from your billing page. You'll retain access until the end of your current billing period.",
              },
              {
                q: "Is my data secure?",
                a: "Yes. We use Supabase with Row Level Security, strict multi-tenant data isolation, and no cross-organization data access. Your data stays your data.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="glass-card rounded-xl p-5">
                <h3 className="font-semibold text-white mb-2">{q}</h3>
                <p className="text-sm text-zinc-400">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
