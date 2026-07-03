// ============================================
// GitTy — TypeScript Type Definitions
// ============================================

export type OrgRole = "owner" | "admin" | "member";

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  owner_id: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: OrgRole;
  joined_at: string;
  // Joined fields
  profiles?: Profile;
}

export interface Project {
  id: string;
  org_id: string;
  title: string;
  description: string | null;
  status: "active" | "archived" | "paused";
  settings: Record<string, unknown>;
  is_public: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AILog {
  id: string;
  org_id: string;
  project_id: string | null;
  user_id: string;
  agent_type: string;
  prompt: string;
  response: string | null;
  provider: string;
  model: string | null;
  tokens_used: number;
  cost_cents: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AIMemory {
  id: string;
  org_id: string;
  project_id: string | null;
  memory_type: "context" | "fact" | "preference" | "summary" | "knowledge";
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Knowledge {
  id: string;
  org_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  file_url: string | null;
  file_type: string | null;
  file_size: number | null;
  status: "processing" | "ready" | "failed";
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  org_id: string | null;
  name: string;
  description: string | null;
  avatar: string | null;
  system_prompt: string;
  provider: string;
  temperature: number;
  visibility: "private" | "org" | "public";
  settings: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicPage {
  id: string;
  user_id: string;
  theme: string;
  layout_config: { alignment?: string; spacing?: string; card_style?: string; fontFamily?: string; bgImage?: string; accentColor?: string; customCss?: string };
  links: { title: string; url: string; icon?: string; description?: string; is_pinned?: boolean; is_hidden?: boolean; category?: string }[];
  custom_sections: { id: string; type: string; content: any }[];
  booking_config: { enabled?: boolean; provider?: string; url?: string };
  newsletter_config: { enabled?: boolean; provider?: string };
  analytics_cache: { views?: number; visitors?: number; clicks?: number };
  custom_domain?: string;
  banner_url?: string;
  seo_metadata: { title?: string; description?: string; og_image?: string };
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface HubPage {
  id: string;
  public_page_id: string;
  slug: string;
  title: string;
  content: { id: string; type: string; data: any }[];
  seo_metadata: { title?: string; description?: string };
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  org_id: string;
  midtrans_customer_id: string | null;
  midtrans_subscription_id: string | null;
  plan: "free" | "pro" | "team" | "enterprise";
  status: "active" | "canceled" | "past_due" | "trialing";
  usage_limit: number;
  usage_count: number;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceItem {
  id: string;
  creator_org_id: string;
  creator_id: string;
  title: string;
  description: string | null;
  long_description: string | null;
  type: "prompt" | "workflow" | "template" | "agent" | "plugin";
  price_cents: number;
  currency: string;
  category: string | null;
  tags: string[];
  content: Record<string, unknown>;
  preview_url: string | null;
  downloads: number;
  rating: number;
  is_published: boolean;
  revenue_share: number;
  created_at: string;
  updated_at: string;
  // Joined
  organizations?: Pick<Organization, "name" | "slug" | "logo_url">;
}

export interface MarketplacePurchase {
  id: string;
  item_id: string;
  buyer_org_id: string;
  buyer_id: string;
  price_cents: number;
  midtrans_transaction_id: string | null;
  status: string;
  created_at: string;
}

// AI Chat types
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  agent_type?: string;
  timestamp: number;
}
