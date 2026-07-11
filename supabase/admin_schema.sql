-- ============================================
-- GitTy - Admin Panel Schema Update
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Extend profiles with platform roles and account status
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS platform_role TEXT NOT NULL DEFAULT 'user'
CHECK (platform_role IN ('user', 'support', 'admin', 'super_admin'));

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'active'
CHECK (account_status IN ('active', 'suspended', 'banned', 'deleted'));

-- Update RLS for profiles to allow admins to see profiles and update them
-- (Existing policies might allow reading, we just make sure admins can read/update all)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.platform_role IN ('support', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Super admins can update profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.platform_role = 'super_admin'
    )
  );


-- 2. Admin Audit Logs
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON public.admin_audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.platform_role IN ('support', 'admin', 'super_admin')
    )
  );

-- Only service role / trusted server functions can insert audit logs directly (or super admins for fallback)
CREATE POLICY "Super admins can insert audit logs"
  ON public.admin_audit_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.platform_role IN ('admin', 'super_admin')
    )
  );

-- 3. Platform Settings (Singleton)
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id BOOLEAN PRIMARY KEY DEFAULT TRUE,
  platform_name TEXT NOT NULL DEFAULT 'GitTy',
  registration_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
  marketplace_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  marketplace_commission_percent NUMERIC(5,2) NOT NULL DEFAULT 10,
  announcement_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  announcement_message TEXT,
  feature_flags JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT singleton_platform_settings CHECK (id = TRUE)
);

-- Insert default row if not exists
INSERT INTO public.platform_settings (id) VALUES (TRUE) ON CONFLICT DO NOTHING;

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read platform settings
CREATE POLICY "Public can read platform settings"
  ON public.platform_settings FOR SELECT
  USING (true);

-- Only Super Admins can update
CREATE POLICY "Super admins can update settings"
  ON public.platform_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.platform_role = 'super_admin'
    )
  );

-- 4. Admin Notes
CREATE TABLE IF NOT EXISTS public.admin_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view and create notes"
  ON public.admin_notes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.platform_role IN ('support', 'admin', 'super_admin')
    )
  );

-- 5. Reports (Abuse Management)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed')),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view and manage reports"
  ON public.reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.platform_role IN ('support', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update reports"
  ON public.reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.platform_role IN ('support', 'admin', 'super_admin')
    )
  );

-- Function to set a specific user to super_admin (for secure initial bootstrap)
CREATE OR REPLACE FUNCTION public.make_super_admin(target_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET platform_role = 'super_admin'
  WHERE id = (SELECT id FROM auth.users WHERE email = target_email LIMIT 1);
END;
$$;

-- RELOAD SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
