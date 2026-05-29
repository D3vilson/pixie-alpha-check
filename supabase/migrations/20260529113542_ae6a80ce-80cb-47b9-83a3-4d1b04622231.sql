ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS nip text,
  ADD COLUMN IF NOT EXISTS krs text,
  ADD COLUMN IF NOT EXISTS regon text,
  ADD COLUMN IF NOT EXISTS pkd text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS registry_source text,
  ADD COLUMN IF NOT EXISTS registry_checked_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS companies_nip_unique
  ON public.companies (nip) WHERE nip IS NOT NULL;

CREATE INDEX IF NOT EXISTS companies_domain_idx
  ON public.companies (domain);