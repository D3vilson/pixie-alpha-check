
CREATE TABLE public.asn_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asn text NOT NULL UNIQUE,
  company_name text NOT NULL,
  company_domain text NOT NULL,
  country text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX asn_companies_asn_idx ON public.asn_companies (asn);

GRANT SELECT ON public.asn_companies TO authenticated;
GRANT ALL ON public.asn_companies TO service_role;

ALTER TABLE public.asn_companies ENABLE ROW LEVEL SECURITY;

-- Admini platformy mogą wszystko
CREATE POLICY "Admins manage asn_companies"
  ON public.asn_companies
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Odmowa dla anon
CREATE POLICY "Deny anon on asn_companies"
  ON public.asn_companies
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);
