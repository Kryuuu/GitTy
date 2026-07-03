// ============================================
// GitTy — Marketplace Client
// ============================================
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createMarketplaceItemAction } from "./actions";
import type { MarketplaceItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function MarketplaceClient({
  orgId,
  initialItems,
}: {
  orgId: string;
  initialItems: MarketplaceItem[];
}) {
  const [items] = useState<MarketplaceItem[]>(initialItems);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.append("orgId", orgId);
      await createMarketplaceItemAction(formData);
      setIsCreating(false);
    } catch (error) {
      console.error(error);
      alert("Failed to create marketplace item.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-surface-200/50 p-6 rounded-2xl border border-surface-300/30">
        <div>
          <h2 className="text-lg font-bold text-white">Your Products</h2>
          <p className="text-sm text-zinc-400">Total Items: {items.length}</p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} variant="gradient">
            + Create New Item
          </Button>
        )}
      </div>

      {/* Creation Form */}
      {isCreating && (
        <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl border border-brand-500/30 shadow-lg shadow-brand-500/5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">List New Product</h3>
            <button type="button" onClick={() => setIsCreating(false)} className="text-zinc-500 hover:text-white">✕</button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Title</label>
              <Input name="title" required placeholder="e.g. SEO Master Prompt" className="bg-surface-200 border-surface-300/50" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Type</label>
              <select name="type" className="w-full h-10 px-3 py-2 rounded-xl bg-surface-200 border border-surface-300/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50">
                <option value="prompt">Prompt</option>
                <option value="agent">Agent</option>
                <option value="workflow">Workflow</option>
                <option value="template">Template</option>
                <option value="plugin">Plugin</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Description</label>
            <Input name="description" placeholder="Short description of your product..." className="bg-surface-200 border-surface-300/50" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Price (IDR)</label>
              <Input type="number" name="price" step="1" min="0" placeholder="0 (Leave blank for free)" className="bg-surface-200 border-surface-300/50" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Visibility</label>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input type="checkbox" name="isPublished" className="rounded text-brand-500 bg-surface-200 border-surface-400" />
                <span className="text-sm text-zinc-400">Publish immediately to Marketplace</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-300/30">
            <Button type="button" variant="ghost" onClick={() => setIsCreating(false)} disabled={isLoading}>Cancel</Button>
            <Button type="submit" variant="gradient" isLoading={isLoading}>Save Product</Button>
          </div>
        </form>
      )}

      {/* Items Grid */}
      {items.length === 0 && !isCreating ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-dashed border-surface-300/50">
          <div className="text-4xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-white mb-2">No items yet</h3>
          <p className="text-zinc-500">You haven't listed any products on the marketplace.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="glass-card p-5 rounded-2xl group flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant={item.is_published ? "success" : "default"}>
                  {item.is_published ? "Published" : "Draft"}
                </Badge>
                <Badge variant="brand">{item.type}</Badge>
              </div>
              
              <h3 className="font-semibold text-white text-lg">{item.title}</h3>
              <p className="text-sm text-zinc-400 mt-1 line-clamp-2 flex-1">{item.description}</p>
              
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-surface-300/30">
                <span className="font-medium text-brand-400">
                  {item.price_cents === 0 ? "Free" : formatCurrency(item.price_cents)}
                </span>
                <span className="text-xs text-zinc-500">{item.downloads} Downloads</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
