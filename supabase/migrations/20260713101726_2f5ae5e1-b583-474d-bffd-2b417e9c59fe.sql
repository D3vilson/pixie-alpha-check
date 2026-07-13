
-- Defense-in-depth: explicit deny policies for write operations on server-only tables.
-- Writes are performed exclusively via service_role (which bypasses RLS).
-- These policies ensure no client-side write is ever possible even if grants change.

-- companies
CREATE POLICY "Deny client insert on companies" ON public.companies FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "Deny client update on companies" ON public.companies FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Deny client delete on companies" ON public.companies FOR DELETE TO anon, authenticated USING (false);

-- identify_events
CREATE POLICY "Deny client insert on identify_events" ON public.identify_events FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "Deny client update on identify_events" ON public.identify_events FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Deny client delete on identify_events" ON public.identify_events FOR DELETE TO anon, authenticated USING (false);

-- ip_company_hints (no policies at all — add deny for all)
CREATE POLICY "Deny client select on ip_company_hints" ON public.ip_company_hints FOR SELECT TO anon, authenticated USING (false);
CREATE POLICY "Deny client insert on ip_company_hints" ON public.ip_company_hints FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "Deny client update on ip_company_hints" ON public.ip_company_hints FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Deny client delete on ip_company_hints" ON public.ip_company_hints FOR DELETE TO anon, authenticated USING (false);

-- ip_lookups
CREATE POLICY "Deny client insert on ip_lookups" ON public.ip_lookups FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "Deny client update on ip_lookups" ON public.ip_lookups FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Deny client delete on ip_lookups" ON public.ip_lookups FOR DELETE TO anon, authenticated USING (false);

-- pageviews
CREATE POLICY "Deny client insert on pageviews" ON public.pageviews FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "Deny client update on pageviews" ON public.pageviews FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Deny client delete on pageviews" ON public.pageviews FOR DELETE TO anon, authenticated USING (false);

-- sessions
CREATE POLICY "Deny client insert on sessions" ON public.sessions FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "Deny client update on sessions" ON public.sessions FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Deny client delete on sessions" ON public.sessions FOR DELETE TO anon, authenticated USING (false);

-- user_roles
CREATE POLICY "Deny client insert on user_roles" ON public.user_roles FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "Deny client update on user_roles" ON public.user_roles FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Deny client delete on user_roles" ON public.user_roles FOR DELETE TO anon, authenticated USING (false);
