// ============================================
// GitTy — Organization Sidebar
// ============================================
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/config";

interface OrgSidebarProps {
  orgId: string;
  orgName: string;
  orgSlug: string;
  userRole: string;
  userEmail: string;
}

const navItems = [
  { icon: "✨", label: "Workspace", path: "/workspace" },
  { icon: "📚", label: "Knowledge", path: "/knowledge" },
  { icon: "📊", label: "Dashboard", path: "/dashboard" },
  { icon: "📁", label: "Projects", path: "/projects" },
  { icon: "🤖", label: "AI Agents", path: "/agents" },
  { icon: "🏪", label: "Marketplace", path: "/marketplace" },
  { icon: "👥", label: "Members", path: "/members" },
  { icon: "💳", label: "Billing", path: "/billing" },
];

export function OrgSidebar({
  orgId,
  orgName,
  orgSlug,
  userRole,
  userEmail,
}: OrgSidebarProps) {
  const pathname = usePathname();
  const basePath = `/app/org/${orgId}`;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-surface-50 border-b border-surface-300/30 flex items-center justify-between px-4 z-40">
        <Link href="/app/orgs" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="GitTy Logo" className="h-8 w-auto object-contain" />
          <span className="font-bold text-white text-sm">
            {siteConfig.name}
          </span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-xl bg-surface-200 flex items-center justify-center text-white"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 bottom-0 w-64 bg-surface-50 border-r border-surface-300/30 flex flex-col z-50 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b border-surface-300/30 flex items-center justify-between">
        <Link href="/app/orgs" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="GitTy Logo" className="h-8 w-auto object-contain" />
          <span className="font-bold text-white text-sm">
            {siteConfig.name}
          </span>
        </Link>
        <button 
          className="md:hidden text-zinc-400 hover:text-white"
          onClick={() => setIsOpen(false)}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Org Switcher */}
      <div className="p-4 border-b border-surface-300/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-600/20 flex items-center justify-center text-brand-400 font-bold">
            {orgName[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {orgName}
            </p>
            <p className="text-xs text-zinc-500">/{orgSlug}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const href = `${basePath}${item.path}`;
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={item.path}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                isActive
                  ? "bg-brand-600/10 text-brand-400"
                  : "text-zinc-400 hover:text-white hover:bg-surface-200"
              )}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-surface-300/30 space-y-1">
          <Link
            href="/marketplace"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-surface-200 transition-all"
          >
            <span className="text-lg">🏪</span>
            Marketplace
          </Link>
          <Link
            href="/app/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-surface-200 transition-all"
          >
            <span className="text-lg">⚙️</span>
            Settings
          </Link>
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-surface-300/30">
        <Link href="/app/settings" className="flex items-center gap-3 hover:bg-surface-200 p-2 -m-2 rounded-xl transition-colors group">
          <div className="w-8 h-8 rounded-full bg-surface-300 flex items-center justify-center text-xs text-zinc-400 group-hover:bg-brand-500/20 group-hover:text-brand-400 transition-colors">
            {userEmail[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-zinc-400 truncate group-hover:text-white transition-colors">{userEmail}</p>
            <p className="text-[10px] text-zinc-500 capitalize">Manage Account</p>
          </div>
        </Link>
      </div>
    </aside>
    </>
  );
}
