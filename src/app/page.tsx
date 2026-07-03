// ============================================
// GitTy — Landing Page
// ============================================
import Link from "next/link";
import { siteConfig, plans, agentTypes } from "@/lib/config";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

function Navbar({ user }: { user: any }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="GitTy Logo" className="h-10 w-auto object-contain" />
          <span className="text-lg font-bold text-white">
            {siteConfig.name}
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="#features"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Features
          </Link>
          <Link
            href="#agents"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            AI Agents
          </Link>
          <Link
            href="#marketplace"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Marketplace
          </Link>
          <Link
            href="#pricing"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Pricing
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/app/orgs"
              className="text-xs sm:text-sm gradient-brand text-white px-4 sm:px-5 py-2 rounded-xl font-medium hover:shadow-lg hover:shadow-brand-600/25 transition-all hover:scale-[1.02]"
            >
              <span className="hidden sm:inline">Go to Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:block text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-xs sm:text-sm gradient-brand text-white px-4 sm:px-5 py-2 rounded-xl font-medium hover:shadow-lg hover:shadow-brand-600/25 transition-all hover:scale-[1.02]"
              >
                <span className="hidden sm:inline">Get Started Free</span>
                <span className="sm:hidden">Start Free</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function HeroSection({ user }: { user: any }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background orbs */}
      <div className="orb orb-blue w-[600px] h-[600px] -top-40 -left-40" />
      <div className="orb orb-violet w-[500px] h-[500px] top-20 right-0" />
      <div className="orb orb-cyan w-[400px] h-[400px] bottom-0 left-1/3" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
          <span className="text-sm text-brand-300">
            AI-Native Platform — Now in Public Beta
          </span>
        </div>

        <h1
          className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6 animate-slide-up"
        >
          Your AI{" "}
          <span className="gradient-text">Operating System</span>
          <br />
          for Building at Scale
        </h1>

        <p
          className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          Create organizations, deploy AI agents, automate workflows, and
          monetize your expertise — all from one intelligent platform.
        </p>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          <Link
            href={user ? "/app/orgs" : "/register"}
            className="w-full sm:w-auto gradient-brand text-white px-8 py-3.5 rounded-xl font-semibold text-lg shadow-xl shadow-brand-600/25 hover:shadow-2xl hover:shadow-brand-600/30 hover:scale-[1.03] transition-all"
          >
            {user ? "Open Dashboard" : "Start Building — It's Free"}
          </Link>
          <Link
            href="#features"
            className="w-full sm:w-auto flex items-center justify-center gap-2 text-zinc-400 hover:text-white px-6 py-3.5 rounded-xl border border-surface-400/50 hover:border-surface-400 transition-all"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
            Watch Demo
          </Link>
        </div>

        {/* Stats */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-lg mx-auto mt-16 animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          {[
            { value: "10K+", label: "Active Users" },
            { value: "500K+", label: "AI Requests" },
            { value: "99.9%", label: "Uptime" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold gradient-text">{stat.value}</p>
              <p className="text-xs text-zinc-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: "🏢",
      title: "Multi-Tenant Workspaces",
      description:
        "Create organizations, invite teams, and manage projects with enterprise-grade role-based access control.",
    },
    {
      icon: "🤖",
      title: "AI Operating System",
      description:
        "Every project comes with an AI copilot that remembers context, generates content, and evolves with your work.",
    },
    {
      icon: "🧠",
      title: "Persistent AI Memory",
      description:
        "Your AI remembers past interactions, learns preferences, and builds long-term understanding of your projects.",
    },
    {
      icon: "⚡",
      title: "Workflow Automation",
      description:
        "Automate repetitive tasks with AI-powered workflows. Content generation, analysis, and reporting on autopilot.",
    },
    {
      icon: "🏪",
      title: "Marketplace Ecosystem",
      description:
        "Publish and monetize AI prompts, templates, and workflows. Build a revenue stream from your expertise.",
    },
    {
      icon: "🔐",
      title: "Enterprise Security",
      description:
        "Row-level security, strict tenant isolation, and SOC 2-ready architecture. Your data stays your data.",
    },
  ];

  return (
    <section id="features" className="py-24 md:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <p className="text-sm font-medium text-brand-400 mb-3">
            PLATFORM FEATURES
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Everything you need to build with AI
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            A complete AI-native platform that combines workspace management,
            intelligent agents, and marketplace economics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="glass-card rounded-2xl p-6 group"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:gradient-text transition-all">
                {feature.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AgentsSection() {
  return (
    <section id="agents" className="py-24 md:py-32 relative">
      <div className="orb orb-violet w-[400px] h-[400px] top-0 left-0" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <p className="text-sm font-medium text-accent-400 mb-3">
            AI AGENT SYSTEM
          </p>
          <h2 className="text-4xl font-bold text-white mb-4">
            Autonomous AI Agents at your service
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Deploy specialized AI agents that work semi-autonomously inside your
            projects. Each agent has unique capabilities and memory.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {agentTypes.map((agent, i) => (
            <div
              key={agent.id}
              className="glass-card rounded-2xl p-6 group"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-surface-200 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {agent.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{agent.name}</h3>
                </div>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {agent.description}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-xs text-zinc-500">Available</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MarketplaceSection() {
  const items = [
    {
      title: "SEO Blog Writer",
      type: "AI Agent",
      price: formatCurrency(150000),
      downloads: "2.4K",
    },
    {
      title: "Project Sprint Planner",
      type: "Workflow",
      price: "Gratis",
      downloads: "5.1K",
    },
    {
      title: "Pitch Deck Generator",
      type: "Template",
      price: formatCurrency(50000),
      downloads: "1.8K",
    },
    {
      title: "Code Review Bot",
      type: "AI Agent",
      price: formatCurrency(250000),
      downloads: "3.2K",
    },
  ];

  return (
    <section id="marketplace" className="py-24 md:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <p className="text-sm font-medium text-green-400 mb-3">
            MARKETPLACE
          </p>
          <h2 className="text-4xl font-bold text-white mb-4">
            Discover, publish, and monetize
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            A thriving ecosystem of AI prompts, workflows, templates, and agents
            built by the community.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map((item) => (
            <div key={item.title} className="glass-card rounded-2xl p-5 group cursor-pointer">
              <div className="w-full h-32 rounded-xl bg-gradient-to-br from-surface-200 to-surface-300 mb-4 flex items-center justify-center">
                <span className="text-3xl opacity-50">📦</span>
              </div>
              <span className="text-xs text-brand-400 font-medium">
                {item.type}
              </span>
              <h3 className="font-semibold text-white mt-1 group-hover:gradient-text transition-all">
                {item.title}
              </h3>
              <div className="flex items-center justify-between mt-3 text-sm">
                <span className="text-green-400 font-medium">{item.price}</span>
                <span className="text-zinc-500">{item.downloads} downloads</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/marketplace"
            className="text-brand-400 hover:text-brand-300 transition-colors text-sm font-medium"
          >
            Browse all marketplace items →
          </Link>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const planEntries = Object.entries(plans) as [string, (typeof plans)[keyof typeof plans]][];

  return (
    <section id="pricing" className="py-24 md:py-32 relative">
      <div className="orb orb-blue w-[500px] h-[500px] bottom-0 right-0" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <p className="text-sm font-medium text-brand-400 mb-3">PRICING</p>
          <h2 className="text-4xl font-bold text-white mb-4">
            Start free, scale infinitely
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Transparent pricing that grows with you. No hidden fees, no
            surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
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
                href="/register"
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
      </div>
    </section>
  );
}

function CTASection({ user }: { user: any }) {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="orb orb-blue w-[600px] h-[600px] -bottom-60 left-1/4" />
      <div className="orb orb-violet w-[400px] h-[400px] -top-40 right-1/4" />

      <div className="max-w-4xl mx-auto px-4 md:px-6 text-center relative z-10">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to build the future{" "}
          <span className="gradient-text">with AI?</span>
        </h2>
        <p className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto">
          Join thousands of teams already using {siteConfig.name} to automate
          their workflows and ship faster.
        </p>
        <Link
          href={user ? "/app/orgs" : "/register"}
          className="inline-flex justify-center w-full sm:w-auto gradient-brand text-white px-10 py-4 rounded-xl font-semibold text-lg shadow-2xl shadow-brand-600/30 hover:shadow-brand-600/40 hover:scale-[1.03] transition-all"
        >
          {user ? "Continue to Dashboard" : "Get Started — It's Free"}
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-surface-300/30 py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/logo.png" alt="GitTy Logo" className="h-8 w-auto object-contain" />
              <span className="font-bold text-white">{siteConfig.name}</span>
            </div>
            <p className="text-sm text-zinc-500">
              AI-native platform for teams that think in AI.
            </p>
          </div>
          {[
            {
              title: "Product",
              links: ["Features", "Pricing", "Marketplace", "Roadmap"],
            },
            {
              title: "Company",
              links: ["About", "Blog", "Careers", "Contact"],
            },
            {
              title: "Legal",
              links: ["Privacy", "Terms", "Security"],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-surface-300/30 mt-10 pt-6 text-center text-xs text-zinc-600">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main>
      <Navbar user={user} />
      <HeroSection user={user} />
      <FeaturesSection />
      <AgentsSection />
      <MarketplaceSection />
      <PricingSection />
      <CTASection user={user} />
      <Footer />
    </main>
  );
}
