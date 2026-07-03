// ============================================
// GitTy — Marketplace Page (Public)
// ============================================
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { MarketplaceItem } from "@/lib/types";

export const metadata = {
  title: `Marketplace — ${siteConfig.name}`,
  description:
    "Discover and purchase AI prompts, workflows, templates, and agents from the GitTy community.",
};

export default async function MarketplacePage() {
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("marketplace_items")
    .select("*, organizations(name, slug, logo_url)")
    .eq("is_published", true)
    .order("downloads", { ascending: false })
    .limit(24);

  const marketplaceItems = (items as MarketplaceItem[] | null) || [];

  const categories = ["All", "Prompt", "Workflow", "Template", "Agent", "Plugin"];

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
            <span className="text-zinc-500 text-sm ml-2">/ Marketplace</span>
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

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">
            🏪 Marketplace
          </h1>
          <p className="text-zinc-400 max-w-lg mx-auto">
            Discover AI-powered prompts, workflows, templates, and agents built
            by the community.
          </p>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                cat === "All"
                  ? "bg-brand-600 text-white"
                  : "bg-surface-200 text-zinc-400 hover:bg-surface-300 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        {marketplaceItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-surface-200 flex items-center justify-center mx-auto mb-6 text-4xl">
              📦
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Marketplace Coming Soon
            </h2>
            <p className="text-zinc-400 mb-6 max-w-md mx-auto">
              The marketplace is being built. Soon you&apos;ll be able to
              publish and discover AI agents, prompts, and workflows.
            </p>
            <Link
              href="/register"
              className="inline-flex gradient-brand text-white px-6 py-2.5 rounded-xl font-medium"
            >
              Join the Waitlist
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {marketplaceItems.map((item) => (
              <Link
                key={item.id}
                href={`/marketplace/item/${item.id}`}
                className="glass-card rounded-2xl overflow-hidden group"
              >
                <div className="h-40 bg-gradient-to-br from-surface-200 to-surface-300 flex items-center justify-center">
                  <span className="text-4xl opacity-40">
                    {item.type === "prompt"
                      ? "💬"
                      : item.type === "workflow"
                        ? "⚡"
                        : item.type === "template"
                          ? "📄"
                          : item.type === "agent"
                            ? "🤖"
                            : "🔌"}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="brand">{item.type}</Badge>
                    {item.category && (
                      <span className="text-xs text-zinc-500">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-white group-hover:gradient-text transition-all">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-zinc-400 line-clamp-2 mt-1">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-300/30">
                    <span className="text-green-400 font-semibold">
                      {item.price_cents === 0
                        ? "Free"
                        : formatCurrency(item.price_cents)}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {item.downloads.toLocaleString()} downloads
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
