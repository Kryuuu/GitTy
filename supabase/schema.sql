-- ============================================
-- GitTy - Production Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- Clean up existing tables and types if rerunning the script
DROP TABLE IF EXISTS public.marketplace_purchases CASCADE;
DROP TABLE IF EXISTS public.marketplace_items CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.public_pages CASCADE;
DROP TABLE IF EXISTS public.agents CASCADE;
DROP TABLE IF EXISTS public.ai_memory CASCADE;
DROP TABLE IF EXISTS public.knowledge CASCADE;
DROP TABLE IF EXISTS public.ai_logs CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.org_members CASCADE;
DROP TABLE IF EXISTS public.organizations CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TYPE IF EXISTS public.org_role CASCADE;

-- ============================================
-- PROFILES
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PUBLIC PAGES
-- ============================================
CREATE TABLE public.public_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  theme TEXT DEFAULT 'dark',
  layout_config JSONB DEFAULT '{}',
  links JSONB DEFAULT '[]',
  custom_sections JSONB DEFAULT '[]',
  booking_config JSONB DEFAULT '{}',
  newsletter_config JSONB DEFAULT '{}',
  analytics_cache JSONB DEFAULT '{}',
  custom_domain TEXT UNIQUE,
  banner_url TEXT,
  seo_metadata JSONB DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.public_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public pages are viewable by everyone"
  ON public.public_pages FOR SELECT
  USING (is_published = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage own public page"
  ON public.public_pages FOR ALL
  USING (auth.uid() = user_id);

CREATE TABLE public.hub_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  public_page_id UUID REFERENCES public.public_pages(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSONB DEFAULT '[]',
  seo_metadata JSONB DEFAULT '{}',
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(public_page_id, slug)
);

ALTER TABLE public.hub_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hub pages are viewable by everyone"
  ON public.hub_pages FOR SELECT
  USING (
    is_published = true OR 
    auth.uid() IN (SELECT user_id FROM public.public_pages WHERE id = public_page_id)
  );

CREATE POLICY "Users can manage own hub pages"
  ON public.hub_pages FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM public.public_pages WHERE id = public_page_id));

-- Trigger to auto-create public page
CREATE OR REPLACE FUNCTION public.handle_new_public_page()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.public_pages (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created_page
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_public_page();

-- ============================================
-- ORGANIZATIONS
-- ============================================
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ORG MEMBERS (RBAC)
-- ============================================
CREATE TYPE public.org_role AS ENUM ('owner', 'admin', 'member');

CREATE TABLE public.org_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.org_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

-- Helper functions to avoid infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.get_user_orgs()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT org_id FROM org_members WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_user_admin_orgs()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin');
$$;

-- RLS: Org members can see their org's members
CREATE POLICY "Org members can view members"
  ON public.org_members FOR SELECT
  USING (org_id IN (SELECT * FROM public.get_user_orgs()));

CREATE POLICY "Org admins can insert members"
  ON public.org_members FOR INSERT
  WITH CHECK (
    org_id IN (SELECT * FROM public.get_user_admin_orgs())
    OR
    -- Allow self-insert for org creation flow
    (user_id = auth.uid())
  );

CREATE POLICY "Org admins can update members"
  ON public.org_members FOR UPDATE
  USING (org_id IN (SELECT * FROM public.get_user_admin_orgs()));

CREATE POLICY "Org admins can delete members"
  ON public.org_members FOR DELETE
  USING (
    org_id IN (SELECT * FROM public.get_user_admin_orgs())
    OR user_id = auth.uid()
  );

-- RLS for organizations (must be after org_members)
CREATE POLICY "Org members can view their orgs"
  ON public.organizations FOR SELECT
  USING (
    auth.uid() = owner_id
    OR EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = organizations.id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create orgs"
  ON public.organizations FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Org owners can update org"
  ON public.organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = organizations.id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Org owners can delete org"
  ON public.organizations FOR DELETE
  USING (auth.uid() = owner_id);

-- ============================================
-- PROJECTS
-- ============================================
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'paused')),
  settings JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view projects"
  ON public.projects FOR SELECT
  USING (
    is_public = true
    OR EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = projects.org_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Org members can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = projects.org_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Org admins can update projects"
  ON public.projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = projects.org_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Org admins can delete projects"
  ON public.projects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = projects.org_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  );

-- ============================================
-- AI LOGS
-- ============================================
CREATE TABLE public.ai_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  agent_type TEXT DEFAULT 'assistant',
  prompt TEXT NOT NULL,
  response TEXT,
  provider TEXT NOT NULL DEFAULT 'openai',
  model TEXT,
  tokens_used INTEGER DEFAULT 0,
  cost_cents INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view AI logs"
  ON public.ai_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = ai_logs.org_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Org members can create AI logs"
  ON public.ai_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = ai_logs.org_id
      AND om.user_id = auth.uid()
    )
  );

-- ============================================
-- AI MEMORY
-- ============================================
CREATE TABLE public.ai_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  memory_type TEXT DEFAULT 'context' CHECK (memory_type IN ('context', 'fact', 'preference', 'summary', 'knowledge')),
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view AI memory"
  ON public.ai_memory FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = ai_memory.org_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Org members can insert AI memory"
  ON public.ai_memory FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = ai_memory.org_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Org members can update AI memory"
  ON public.ai_memory FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = ai_memory.org_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Org admins can delete AI memory"
  ON public.ai_memory FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = ai_memory.org_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  );

-- ============================================
-- KNOWLEDGE BASE
-- ============================================
CREATE TABLE public.knowledge (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT,
  file_size INTEGER,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'failed')),
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view knowledge"
  ON public.knowledge FOR SELECT
  USING (org_id IN (SELECT * FROM public.get_user_orgs()));

CREATE POLICY "Org members can create knowledge"
  ON public.knowledge FOR INSERT
  WITH CHECK (org_id IN (SELECT * FROM public.get_user_orgs()));

CREATE POLICY "Org members can update knowledge"
  ON public.knowledge FOR UPDATE
  USING (org_id IN (SELECT * FROM public.get_user_orgs()));

CREATE POLICY "Org admins can delete knowledge"
  ON public.knowledge FOR DELETE
  USING (org_id IN (SELECT * FROM public.get_user_admin_orgs()));

-- ============================================
-- STORAGE BUCKETS
-- ============================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('knowledge_files', 'knowledge_files', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Org members can view their files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'knowledge_files' AND
    (auth.uid() IN (
      SELECT user_id FROM public.org_members WHERE org_id::text = (string_to_array(name, '/'))[1]
    ))
  );

CREATE POLICY "Org members can upload files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'knowledge_files' AND
    (auth.uid() IN (
      SELECT user_id FROM public.org_members WHERE org_id::text = (string_to_array(name, '/'))[1]
    ))
  );

-- ============================================
-- AGENTS
-- ============================================
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  avatar TEXT DEFAULT '🤖',
  system_prompt TEXT NOT NULL,
  provider TEXT DEFAULT 'openai',
  temperature NUMERIC DEFAULT 0.7,
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'org', 'public')),
  settings JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view agents"
  ON public.agents FOR SELECT
  USING (
    org_id IN (SELECT * FROM public.get_user_orgs())
    OR visibility = 'public'
  );

CREATE POLICY "Org members can create agents"
  ON public.agents FOR INSERT
  WITH CHECK (org_id IN (SELECT * FROM public.get_user_orgs()));

CREATE POLICY "Org members can update agents"
  ON public.agents FOR UPDATE
  USING (org_id IN (SELECT * FROM public.get_user_orgs()));

CREATE POLICY "Org admins can delete agents"
  ON public.agents FOR DELETE
  USING (org_id IN (SELECT * FROM public.get_user_admin_orgs()));

-- ============================================
-- SUBSCRIPTIONS
-- ============================================
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  midtrans_customer_id TEXT,
  midtrans_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  usage_limit INTEGER DEFAULT 1000,
  usage_count INTEGER DEFAULT 0,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view subscription"
  ON public.subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = subscriptions.org_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = subscriptions.org_id
      AND om.user_id = auth.uid()
      AND om.role = 'owner'
    )
  );

-- ============================================
-- MARKETPLACE ITEMS
-- ============================================
CREATE TABLE public.marketplace_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  long_description TEXT,
  type TEXT NOT NULL CHECK (type IN ('prompt', 'workflow', 'template', 'agent', 'plugin')),
  price_cents INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'usd',
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  content JSONB DEFAULT '{}',
  preview_url TEXT,
  downloads INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  revenue_share NUMERIC(5,2) DEFAULT 80.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published items viewable by all"
  ON public.marketplace_items FOR SELECT
  USING (
    is_published = true
    OR EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = marketplace_items.creator_org_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Org members can create items"
  ON public.marketplace_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = marketplace_items.creator_org_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Item creator org can update"
  ON public.marketplace_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = marketplace_items.creator_org_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Item creator org can delete"
  ON public.marketplace_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = marketplace_items.creator_org_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  );

-- ============================================
-- MARKETPLACE PURCHASES
-- ============================================
CREATE TABLE public.marketplace_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES public.marketplace_items(id),
  buyer_org_id UUID NOT NULL REFERENCES public.organizations(id),
  buyer_id UUID NOT NULL REFERENCES auth.users(id),
  price_cents INTEGER NOT NULL,
  midtrans_transaction_id TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.marketplace_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view their purchases"
  ON public.marketplace_purchases FOR SELECT
  USING (buyer_id = auth.uid());

CREATE POLICY "Authenticated users can purchase"
  ON public.marketplace_purchases FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_org_members_org ON public.org_members(org_id);
CREATE INDEX idx_org_members_user ON public.org_members(user_id);
CREATE INDEX idx_projects_org ON public.projects(org_id);
CREATE INDEX idx_ai_logs_org ON public.ai_logs(org_id);
CREATE INDEX idx_ai_logs_project ON public.ai_logs(project_id);
CREATE INDEX idx_ai_memory_org ON public.ai_memory(org_id);
CREATE INDEX idx_ai_memory_project ON public.ai_memory(project_id);
CREATE INDEX idx_agents_org ON public.agents(org_id);
CREATE INDEX idx_knowledge_org ON public.knowledge(org_id);
CREATE INDEX idx_knowledge_project ON public.knowledge(project_id);
CREATE INDEX idx_subscriptions_org ON public.subscriptions(org_id);
CREATE INDEX idx_public_pages_user ON public.public_pages(user_id);
CREATE INDEX idx_marketplace_type ON public.marketplace_items(type);
CREATE INDEX idx_marketplace_published ON public.marketplace_items(is_published);
CREATE INDEX idx_marketplace_purchases_buyer ON public.marketplace_purchases(buyer_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_public_pages_updated_at BEFORE UPDATE ON public.public_pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_hub_pages_updated_at BEFORE UPDATE ON public.hub_pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_knowledge_updated_at BEFORE UPDATE ON public.knowledge FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_ai_memory_updated_at BEFORE UPDATE ON public.ai_memory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_marketplace_items_updated_at BEFORE UPDATE ON public.marketplace_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
