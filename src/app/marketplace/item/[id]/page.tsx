// ============================================
// GitTy — Marketplace Item Detail Page
// ============================================
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { MarketplaceItem } from "@/lib/types";

export default async function MarketplaceItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("marketplace_items")
    .select("*, organizations(name, slug, logo_url)")
    .eq("id", id)
    .eq("is_published", true)
    .single();

  if (!data) notFound();

  const item = data as MarketplaceItem;

  return (
    <div className="min-h-screen bg-surface-0">
      <header className="border-b border-surface-300/30">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="GitTy Logo" className="h-10 w-auto object-contain" />
            <span className="text-lg font-bold text-white">
              {siteConfig.name}
            </span>
          </Link>
          <span className="text-zinc-500 text-sm mx-2">/</span>
          <Link
            href="/marketplace"
            className="text-zinc-400 hover:text-white text-sm transition-colors"
          >
            Marketplace
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="brand">{item.type}</Badge>
              {item.tags?.map((tag) => (
                <Badge key={tag} variant="default">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">
              {item.title}
            </h1>
            <p className="text-zinc-400 text-lg mb-8">{item.description}</p>

            {item.long_description && (
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-3">
                  About this {item.type}
                </h2>
                <p className="text-sm text-zinc-400 whitespace-pre-wrap leading-relaxed">
                  {item.long_description}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="glass-card rounded-2xl p-6 sticky top-6">
              <div className="text-3xl font-bold text-white mb-1">
                {item.price_cents === 0
                  ? "Free"
                  : formatCurrency(item.price_cents)}
              </div>
              <p className="text-xs text-zinc-500 mb-6">One-time purchase</p>

              <Button variant="gradient" size="lg" className="w-full mb-4">
                {item.price_cents === 0 ? "Get for Free" : "Purchase Now"}
              </Button>

              <div className="space-y-3 mt-6 pt-6 border-t border-surface-300/30">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Downloads</span>
                  <span className="text-white">
                    {item.downloads.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Rating</span>
                  <span className="text-white">
                    {item.rating > 0
                      ? `${item.rating}/5.0`
                      : "No ratings yet"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Published</span>
                  <span className="text-white">
                    {formatDate(item.created_at)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Creator</span>
                  <span className="text-white">
                    {item.organizations?.name || "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
