-- DUBL Phase 7: Admin RBAC + audit log
-- Author: spidersw3b3

CREATE TYPE public.admin_role AS ENUM (
  'support',
  'ops',
  'finance',
  'compliance',
  'master'
);

CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  role public.admin_role NOT NULL DEFAULT 'support',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  reason TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_audit_log_created ON public.admin_audit_log(created_at DESC);
CREATE INDEX idx_admin_audit_log_action ON public.admin_audit_log(action);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
-- No client policies — admin-api edge fn + service_role only

COMMENT ON TABLE public.admin_users IS 'Admin operators. Auth via separate JWT/session; not player auth.';
COMMENT ON TABLE public.admin_audit_log IS 'Append-only admin mutation log. Every write requires reason note.';
