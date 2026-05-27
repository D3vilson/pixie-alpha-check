CREATE TABLE public.ip_company_hints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asn text NOT NULL,
  ip_prefix text NOT NULL,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  confidence integer NOT NULL DEFAULT 1,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (asn, ip_prefix, company_id)
);

CREATE INDEX idx_ip_hints_lookup ON public.ip_company_hints (asn, ip_prefix, confidence DESC);

GRANT SELECT ON public.ip_company_hints TO authenticated;
GRANT ALL ON public.ip_company_hints TO service_role;

ALTER TABLE public.ip_company_hints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated read hints"
ON public.ip_company_hints FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.increment_ip_hint(
  _asn text, _prefix text, _company_id uuid
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.ip_company_hints (asn, ip_prefix, company_id)
  VALUES (_asn, _prefix, _company_id)
  ON CONFLICT (asn, ip_prefix, company_id)
  DO UPDATE SET confidence = ip_company_hints.confidence + 1,
                last_seen_at = now();
END;
$$;