
CREATE TYPE public.crm_provider AS ENUM ('hubspot', 'pipedrive');

CREATE TABLE public.crm_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  provider public.crm_provider NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  min_score int NOT NULL DEFAULT 70,
  owner_email text,
  last_push_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, provider)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_integrations TO authenticated;
GRANT ALL ON public.crm_integrations TO service_role;

ALTER TABLE public.crm_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view crm integrations"
  ON public.crm_integrations FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Members can insert crm integrations"
  ON public.crm_integrations FOR INSERT TO authenticated
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Members can update crm integrations"
  ON public.crm_integrations FOR UPDATE TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()))
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Members can delete crm integrations"
  ON public.crm_integrations FOR DELETE TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Deny anon all on crm_integrations"
  ON public.crm_integrations FOR ALL TO anon USING (false) WITH CHECK (false);

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS pushed_to_crm jsonb NOT NULL DEFAULT '{}'::jsonb;
