
-- ============ ENUMS ============
CREATE TYPE public.workspace_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE public.integration_type AS ENUM ('slack', 'teams', 'webhook');
CREATE TYPE public.alert_channel AS ENUM ('slack', 'teams', 'webhook');
CREATE TYPE public.consent_source AS ENUM ('form_submit', 'email_link', 'logged_in', 'cmp_signal');

-- ============ WORKSPACES ============
CREATE TABLE public.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  plan text NOT NULL DEFAULT 'free',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.workspace_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role public.workspace_role NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);
CREATE INDEX ON public.workspace_members(user_id);

-- Security-definer helpers (avoid recursive RLS)
CREATE OR REPLACE FUNCTION public.is_workspace_member(_workspace_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = _workspace_id AND user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.has_workspace_role(_workspace_id uuid, _user_id uuid, _roles public.workspace_role[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = _workspace_id AND user_id = _user_id AND role = ANY(_roles)
  );
$$;

-- ============ SITES ============
CREATE TABLE public.sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  domain text NOT NULL,
  tracking_id text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(9), 'base64'),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.sites(workspace_id);

-- ============ COMPANIES (shared catalogue) ============
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL UNIQUE,
  name text NOT NULL,
  industry text,
  size text,
  country text,
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============ PEOPLE (consent-identified) ============
CREATE TABLE public.people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  consent_source public.consent_source NOT NULL,
  consent_ts timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, email)
);
CREATE INDEX ON public.people(workspace_id);

-- ============ SESSIONS ============
CREATE TABLE public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  anon_id text NOT NULL,
  ip_hash text,
  user_agent text,
  country text,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  person_id uuid REFERENCES public.people(id) ON DELETE SET NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (site_id, anon_id)
);
CREATE INDEX ON public.sessions(site_id, started_at DESC);
CREATE INDEX ON public.sessions(company_id);

-- ============ PAGEVIEWS ============
CREATE TABLE public.pageviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  url text NOT NULL,
  referrer text,
  title text,
  ts timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.pageviews(session_id, ts DESC);

-- ============ TARGET ACCOUNTS ============
CREATE TABLE public.target_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  domain_pattern text,
  label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (company_id IS NOT NULL OR domain_pattern IS NOT NULL)
);
CREATE INDEX ON public.target_accounts(workspace_id);

-- ============ ALERT RULES ============
CREATE TABLE public.alert_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  target_account_id uuid REFERENCES public.target_accounts(id) ON DELETE CASCADE,
  channel public.alert_channel NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.alert_rules(workspace_id);

-- ============ IDENTIFY EVENTS ============
CREATE TABLE public.identify_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  person_id uuid NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  source public.consent_source NOT NULL,
  consent_proof jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============ INTEGRATIONS ============
CREATE TABLE public.integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  type public.integration_type NOT NULL,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.integrations(workspace_id);

-- ============ RLS ============
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pageviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.target_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.identify_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- workspaces
CREATE POLICY "members read workspace" ON public.workspaces FOR SELECT TO authenticated
  USING (public.is_workspace_member(id, auth.uid()));
CREATE POLICY "authenticated create workspace" ON public.workspaces FOR INSERT TO authenticated
  WITH CHECK (true);
CREATE POLICY "owners update workspace" ON public.workspaces FOR UPDATE TO authenticated
  USING (public.has_workspace_role(id, auth.uid(), ARRAY['owner']::public.workspace_role[]));
CREATE POLICY "owners delete workspace" ON public.workspaces FOR DELETE TO authenticated
  USING (public.has_workspace_role(id, auth.uid(), ARRAY['owner']::public.workspace_role[]));

-- workspace_members
CREATE POLICY "members read members" ON public.workspace_members FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "user inserts self as owner on new workspace" ON public.workspace_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "admins manage members" ON public.workspace_members FOR UPDATE TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]));
CREATE POLICY "admins remove members" ON public.workspace_members FOR DELETE TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]));

-- sites
CREATE POLICY "members read sites" ON public.sites FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "admins write sites" ON public.sites FOR ALL TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]))
  WITH CHECK (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]));

-- companies (shared catalogue, read-only for users)
CREATE POLICY "authenticated read companies" ON public.companies FOR SELECT TO authenticated USING (true);

-- people
CREATE POLICY "members read people" ON public.people FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "admins delete people" ON public.people FOR DELETE TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]));

-- sessions / pageviews — read via workspace via site
CREATE POLICY "members read sessions" ON public.sessions FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.sites s
    WHERE s.id = sessions.site_id
      AND public.is_workspace_member(s.workspace_id, auth.uid())
  ));
CREATE POLICY "members read pageviews" ON public.pageviews FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.sessions ses
    JOIN public.sites s ON s.id = ses.site_id
    WHERE ses.id = pageviews.session_id
      AND public.is_workspace_member(s.workspace_id, auth.uid())
  ));
CREATE POLICY "members read identify_events" ON public.identify_events FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.sessions ses
    JOIN public.sites s ON s.id = ses.site_id
    WHERE ses.id = identify_events.session_id
      AND public.is_workspace_member(s.workspace_id, auth.uid())
  ));

-- target_accounts
CREATE POLICY "members read targets" ON public.target_accounts FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "admins write targets" ON public.target_accounts FOR ALL TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]))
  WITH CHECK (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]));

-- alert_rules
CREATE POLICY "members read alerts" ON public.alert_rules FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "admins write alerts" ON public.alert_rules FOR ALL TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]))
  WITH CHECK (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]));

-- integrations
CREATE POLICY "members read integrations" ON public.integrations FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "admins write integrations" ON public.integrations FOR ALL TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]))
  WITH CHECK (public.has_workspace_role(workspace_id, auth.uid(), ARRAY['owner','admin']::public.workspace_role[]));

-- ============ SEED COMPANIES (mock EU directory) ============
INSERT INTO public.companies (domain, name, industry, size, country, logo_url) VALUES
  ('klarna.com','Klarna','Fintech','5000+','SE','https://logo.clearbit.com/klarna.com'),
  ('spotify.com','Spotify','Music & Media','5000+','SE','https://logo.clearbit.com/spotify.com'),
  ('sap.com','SAP','Enterprise Software','5000+','DE','https://logo.clearbit.com/sap.com'),
  ('zalando.com','Zalando','Ecommerce','5000+','DE','https://logo.clearbit.com/zalando.com'),
  ('booking.com','Booking.com','Travel','5000+','NL','https://logo.clearbit.com/booking.com'),
  ('adyen.com','Adyen','Payments','1000-5000','NL','https://logo.clearbit.com/adyen.com'),
  ('mistral.ai','Mistral AI','AI','50-200','FR','https://logo.clearbit.com/mistral.ai'),
  ('doctolib.fr','Doctolib','Healthtech','1000-5000','FR','https://logo.clearbit.com/doctolib.fr'),
  ('revolut.com','Revolut','Fintech','5000+','GB','https://logo.clearbit.com/revolut.com'),
  ('monzo.com','Monzo','Fintech','1000-5000','GB','https://logo.clearbit.com/monzo.com'),
  ('miro.com','Miro','SaaS','1000-5000','NL','https://logo.clearbit.com/miro.com'),
  ('hellofresh.com','HelloFresh','Food','5000+','DE','https://logo.clearbit.com/hellofresh.com'),
  ('n26.com','N26','Fintech','1000-5000','DE','https://logo.clearbit.com/n26.com'),
  ('personio.com','Personio','HR Tech','1000-5000','DE','https://logo.clearbit.com/personio.com'),
  ('contentful.com','Contentful','SaaS','500-1000','DE','https://logo.clearbit.com/contentful.com'),
  ('typeform.com','Typeform','SaaS','500-1000','ES','https://logo.clearbit.com/typeform.com'),
  ('glovoapp.com','Glovo','Marketplaces','1000-5000','ES','https://logo.clearbit.com/glovoapp.com'),
  ('factorialhr.com','Factorial','HR Tech','200-500','ES','https://logo.clearbit.com/factorialhr.com'),
  ('voiscooters.com','Voi','Mobility','500-1000','SE','https://logo.clearbit.com/voiscooters.com'),
  ('northvolt.com','Northvolt','Energy','5000+','SE','https://logo.clearbit.com/northvolt.com'),
  ('truecaller.com','Truecaller','Consumer Tech','200-500','SE','https://logo.clearbit.com/truecaller.com'),
  ('mollie.com','Mollie','Payments','500-1000','NL','https://logo.clearbit.com/mollie.com'),
  ('messagebird.com','Bird','Communications','500-1000','NL','https://logo.clearbit.com/messagebird.com'),
  ('alan.com','Alan','Insurtech','500-1000','FR','https://logo.clearbit.com/alan.com'),
  ('qonto.com','Qonto','Fintech','500-1000','FR','https://logo.clearbit.com/qonto.com'),
  ('payfit.com','PayFit','HR Tech','500-1000','FR','https://logo.clearbit.com/payfit.com'),
  ('aircall.io','Aircall','SaaS','500-1000','FR','https://logo.clearbit.com/aircall.io'),
  ('back-market.com','Back Market','Marketplaces','500-1000','FR','https://logo.clearbit.com/back-market.com'),
  ('blablacar.com','BlaBlaCar','Mobility','500-1000','FR','https://logo.clearbit.com/blablacar.com'),
  ('vinted.com','Vinted','Marketplaces','500-1000','LT','https://logo.clearbit.com/vinted.com'),
  ('bolt.eu','Bolt','Mobility','5000+','EE','https://logo.clearbit.com/bolt.eu'),
  ('pipedrive.com','Pipedrive','SaaS','500-1000','EE','https://logo.clearbit.com/pipedrive.com'),
  ('wise.com','Wise','Fintech','5000+','GB','https://logo.clearbit.com/wise.com'),
  ('deepl.com','DeepL','AI','200-500','DE','https://logo.clearbit.com/deepl.com'),
  ('celonis.com','Celonis','Enterprise Software','1000-5000','DE','https://logo.clearbit.com/celonis.com'),
  ('flink.com','Flink','Q-commerce','1000-5000','DE','https://logo.clearbit.com/flink.com'),
  ('trade-republic.com','Trade Republic','Fintech','500-1000','DE','https://logo.clearbit.com/trade-republic.com'),
  ('about-you.com','About You','Ecommerce','1000-5000','DE','https://logo.clearbit.com/about-you.com'),
  ('flixbus.com','FlixBus','Mobility','1000-5000','DE','https://logo.clearbit.com/flixbus.com'),
  ('gorillas.io','Gorillas','Q-commerce','200-500','DE','https://logo.clearbit.com/gorillas.io'),
  ('lieferando.de','Lieferando','Food','1000-5000','DE','https://logo.clearbit.com/lieferando.de'),
  ('about.gitlab.com','GitLab EU','DevTools','500-1000','NL','https://logo.clearbit.com/gitlab.com'),
  ('elastic.co','Elastic','DevTools','1000-5000','NL','https://logo.clearbit.com/elastic.co'),
  ('docplanner.com','Docplanner','Healthtech','500-1000','PL','https://logo.clearbit.com/docplanner.com'),
  ('brainly.com','Brainly','Edtech','500-1000','PL','https://logo.clearbit.com/brainly.com'),
  ('allegro.pl','Allegro','Ecommerce','5000+','PL','https://logo.clearbit.com/allegro.pl'),
  ('ing.com','ING','Banking','5000+','NL','https://logo.clearbit.com/ing.com'),
  ('asml.com','ASML','Hardware','5000+','NL','https://logo.clearbit.com/asml.com'),
  ('shopify.eu','Shopify EU','Ecommerce','5000+','IE','https://logo.clearbit.com/shopify.com'),
  ('intercom.com','Intercom','SaaS','1000-5000','IE','https://logo.clearbit.com/intercom.com');
