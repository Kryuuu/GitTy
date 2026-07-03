// ============================================
// GitTy — Platform Configuration
// ============================================

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "GitTy",
  description:
    "AI-native SaaS platform for teams. Create, automate, and scale with intelligent agents.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og.png",
  links: {
    github: "https://github.com/gitty-platform",
    twitter: "https://twitter.com/gitty",
  },
};

export const plans = {
  free: {
    name: "Free",
    price: 0,
    priceId: "",
    features: [
      "1 Organization",
      "3 Projects",
      "500 AI requests/month",
      "Basic AI Assistant",
      "Community Support",
    ],
    limits: {
      orgs: 1,
      projects: 3,
      aiRequests: 500,
      members: 3,
    },
  },
  pro: {
    name: "Pro",
    price: 99000,
    priceId: process.env.MIDTRANS_PRICE_PRO || "",
    features: [
      "5 Organizations",
      "Unlimited Projects",
      "10,000 AI requests/month",
      "All AI Agents",
      "AI Memory System",
      "Priority Support",
    ],
    limits: {
      orgs: 5,
      projects: -1,
      aiRequests: 10000,
      members: 10,
    },
  },
  team: {
    name: "Team",
    price: 249000,
    priceId: process.env.MIDTRANS_PRICE_TEAM || "",
    features: [
      "Unlimited Organizations",
      "Unlimited Projects",
      "50,000 AI requests/month",
      "All AI Agents + Custom",
      "Advanced AI Memory",
      "Marketplace Publishing",
      "Team Collaboration",
      "Dedicated Support",
    ],
    limits: {
      orgs: -1,
      projects: -1,
      aiRequests: 50000,
      members: 50,
    },
  },
  enterprise: {
    name: "Enterprise",
    price: 999000,
    priceId: process.env.MIDTRANS_PRICE_ENTERPRISE || "",
    features: [
      "Everything in Team",
      "Unlimited AI requests",
      "Custom AI Models",
      "SSO / SAML",
      "Audit Logs",
      "SLA Agreement",
      "Dedicated Account Manager",
      "Custom Integrations",
    ],
    limits: {
      orgs: -1,
      projects: -1,
      aiRequests: -1,
      members: -1,
    },
  },
} as const;

export type PlanKey = keyof typeof plans;

export const agentTypes = [
  {
    id: "content",
    name: "Content Agent",
    description: "Generates marketing copy, blog posts, social media content",
    icon: "✍️",
    systemPrompt:
      "You are a creative content agent. Generate compelling, on-brand content for marketing, blogs, and social media.",
  },
  {
    id: "research",
    name: "Research Agent",
    description: "Analyzes data, summarizes documents, finds insights",
    icon: "🔬",
    systemPrompt:
      "You are a research agent. Analyze data, summarize documents, and provide actionable insights.",
  },
  {
    id: "coding",
    name: "Coding Agent",
    description: "Writes code, reviews PRs, suggests improvements",
    icon: "💻",
    systemPrompt:
      "You are a coding agent. Write clean, efficient code and provide technical guidance.",
  },
  {
    id: "analyst",
    name: "Business Analyst",
    description: "Business strategy, market analysis, competitive intelligence",
    icon: "📊",
    systemPrompt:
      "You are a business analyst agent. Provide strategic analysis, market insights, and business recommendations.",
  },
  {
    id: "automation",
    name: "Automation Agent",
    description: "Designs workflows, automates tasks, optimizes processes",
    icon: "⚡",
    systemPrompt:
      "You are an automation agent. Design efficient workflows and suggest process optimizations.",
  },
] as const;

export type AgentType = (typeof agentTypes)[number]["id"];
