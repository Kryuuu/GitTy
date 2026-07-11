"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FolderKanban, 
  Bot, 
  GitMerge, 
  Store, 
  CreditCard, 
  Receipt, 
  Activity, 
  AlertTriangle, 
  ShieldAlert, 
  Server, 
  Settings, 
  Menu,
  X,
  LogOut
} from "lucide-react";
import { siteConfig } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAVIGATION = [
  { group: "Overview", items: [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  ]},
  { group: "Platform", items: [
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Organizations", href: "/admin/organizations", icon: Building2 },
    { name: "Projects", href: "/admin/projects", icon: FolderKanban },
    { name: "AI Agents", href: "/admin/agents", icon: Bot },
    { name: "Workflows", href: "/admin/workflows", icon: GitMerge },
  ]},
  { group: "Commerce", items: [
    { name: "Marketplace", href: "/admin/marketplace", icon: Store },
    { name: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
    { name: "Transactions", href: "/admin/transactions", icon: Receipt },
  ]},
  { group: "Monitoring", items: [
    { name: "AI Usage", href: "/admin/usage", icon: Activity },
    { name: "Reports", href: "/admin/reports", icon: AlertTriangle },
    { name: "Audit Logs", href: "/admin/audit-logs", icon: ShieldAlert },
    { name: "System Health", href: "/admin/system", icon: Server },
  ]},
  { group: "Configuration", items: [
    { name: "Platform Settings", href: "/admin/settings", icon: Settings },
  ]}
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string>("");

  useEffect(() => {
    async function loadAdminInfo() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setAdminEmail(user.email);
      }
    }
    loadAdminInfo();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const SidebarContent = () => (
    <>
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-surface-400/30">
        <Link href="/admin" className="flex items-center gap-2">
          <img src="/logo.png" alt="GitTy Logo" className="h-8 w-auto object-contain" />
          <span className="text-lg font-bold text-white tracking-tight">Admin Console</span>
        </Link>
      </div>
      
      <nav className="flex flex-1 flex-col overflow-y-auto px-4 py-4 hide-scrollbar">
        {NAVIGATION.map((group, idx) => (
          <div key={group.group} className={idx !== 0 ? "mt-6" : ""}>
            <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              {group.group}
            </h3>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                        isActive
                          ? "bg-brand-500/10 text-brand-400"
                          : "text-zinc-400 hover:bg-surface-300 hover:text-white"
                      }`}
                    >
                      <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-brand-400" : "text-zinc-500 group-hover:text-zinc-300"}`} />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t border-surface-400/30 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-surface-200 p-3 border border-surface-400/50">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-400 text-xs font-medium text-white">
            SA
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-medium text-white">{adminEmail || "Super Admin"}</span>
            <span className="truncate text-xs text-brand-400">Platform Level</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />
          <div className="fixed inset-y-0 left-0 z-40 w-72 bg-surface-100 border-r border-surface-400/30 shadow-2xl flex flex-col">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col border-r border-surface-400/30 bg-surface-100">
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-surface-400/30 bg-background/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-zinc-400 hover:text-white"
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="text-lg font-bold text-white tracking-tight">Admin Console</span>
          </div>

          <div className="hidden lg:flex items-center text-sm text-zinc-400">
            <span className="capitalize">{pathname.split('/').filter(Boolean).join(' / ')}</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/app" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Exit Admin
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center justify-center h-8 w-8 rounded-lg bg-surface-200 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
