
CREATE TABLE public.ip_lookups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  site_id uuid NOT NULL,
  ip_prefix text NOT NULL,
  country text,
  org text,
  asn_name text,
  asn_domain text,
  company_name text,
  company_domain text,
  company_type text,
  layer text NOT NULL,
  resolved_company_id uuid
);

CREATE INDEX ip_lookups_site_created_idx ON public.ip_lookups (site_id, created_at DESC);

GRANT SELECT, INSERT ON public.ip_lookups TO service_role;
GRANT SELECT ON public.ip_lookups TO authenticated;

ALTER TABLE public.ip_lookups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read ip_lookups"
ON public.ip_lookups
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.sites s
  WHERE s.id = ip_lookups.site_id
    AND public.is_workspace_member(s.workspace_id, auth.uid())
));
