import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Ensures the current user has a workspace + site. Creates a default
 * "My Workspace" + a placeholder site on first call. Returns the active
 * workspace and the user's role.
 */
export const bootstrapWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId, claims } = context;

    // Look for an existing membership (RLS-scoped to user).
    const { data: memberships, error: memErr } = await supabase
      .from("workspace_members")
      .select("workspace_id, role, workspaces(id, name, plan)")
      .limit(1);
    if (memErr) throw memErr;

    if (memberships && memberships.length > 0) {
      const m = memberships[0] as any;
      return {
        workspace: m.workspaces,
        role: m.role as "owner" | "admin" | "member",
      };
    }

    // Bootstrap: create workspace + owner membership + default site.
    // Use admin client so we sidestep race conditions with RLS during the
    // multi-step write — the owner is pinned to the verified userId.
    const email = (claims as any).email as string | undefined;
    const defaultName = email ? `${email.split("@")[0]}'s workspace` : "My workspace";

    const { data: ws, error: wsErr } = await supabaseAdmin
      .from("workspaces")
      .insert({ name: defaultName })
      .select("id, name, plan")
      .single();
    if (wsErr) throw wsErr;

    const { error: memInsErr } = await supabaseAdmin
      .from("workspace_members")
      .insert({ workspace_id: ws.id, user_id: userId, role: "owner" });
    if (memInsErr) throw memInsErr;

    await supabaseAdmin
      .from("sites")
      .insert({ workspace_id: ws.id, domain: "example.com" });

    return { workspace: ws, role: "owner" as const };
  });

export const getSites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { workspaceId: string }) =>
    z.object({ workspaceId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: sites, error } = await context.supabase
      .from("sites")
      .select("id, domain, tracking_id, created_at")
      .eq("workspace_id", data.workspaceId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return sites ?? [];
  });

export const createSite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { workspaceId: string; domain: string }) =>
    z
      .object({
        workspaceId: z.string().uuid(),
        domain: z.string().min(3).max(255).regex(/^[a-zA-Z0-9.-]+$/),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: site, error } = await context.supabase
      .from("sites")
      .insert({ workspace_id: data.workspaceId, domain: data.domain })
      .select("id, domain, tracking_id, created_at")
      .single();
    if (error) throw error;
    return site;
  });

export const getLiveVisits = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { workspaceId: string }) =>
    z.object({ workspaceId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: sites } = await context.supabase
      .from("sites")
      .select("id")
      .eq("workspace_id", data.workspaceId);
    const siteIds = (sites ?? []).map((s) => s.id);
    if (siteIds.length === 0) return [];

    const { data: sessions, error } = await context.supabase
      .from("sessions")
      .select(
        "id, started_at, last_seen_at, country, company_id, person_id, companies(id, name, domain, logo_url, industry, country)",
      )
      .in("site_id", siteIds)
      .order("last_seen_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return sessions ?? [];
  });

export const getCompanies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { workspaceId: string }) =>
    z.object({ workspaceId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: sites } = await context.supabase
      .from("sites")
      .select("id")
      .eq("workspace_id", data.workspaceId);
    const siteIds = (sites ?? []).map((s) => s.id);
    if (siteIds.length === 0) return [];

    const { data: sessions, error } = await context.supabase
      .from("sessions")
      .select("company_id, last_seen_at, companies(id, name, domain, logo_url, industry, country, size)")
      .in("site_id", siteIds)
      .not("company_id", "is", null)
      .order("last_seen_at", { ascending: false })
      .limit(500);
    if (error) throw error;

    // Aggregate by company_id
    const byCompany = new Map<string, any>();
    for (const s of sessions ?? []) {
      const c = (s as any).companies;
      if (!c) continue;
      const cur = byCompany.get(c.id);
      if (!cur) {
        byCompany.set(c.id, { ...c, visits: 1, last_seen_at: s.last_seen_at });
      } else {
        cur.visits += 1;
      }
    }
    return Array.from(byCompany.values()).sort(
      (a, b) => new Date(b.last_seen_at).getTime() - new Date(a.last_seen_at).getTime(),
    );
  });

export const getTargetAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { workspaceId: string }) =>
    z.object({ workspaceId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("target_accounts")
      .select("id, label, domain_pattern, company_id, created_at, companies(id, name, domain, logo_url)")
      .eq("workspace_id", data.workspaceId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return rows ?? [];
  });

export const addTargetAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { workspaceId: string; domain: string; label?: string }) =>
    z
      .object({
        workspaceId: z.string().uuid(),
        domain: z.string().min(2).max(255).regex(/^[a-zA-Z0-9.*-]+$/),
        label: z.string().max(100).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("target_accounts")
      .insert({
        workspace_id: data.workspaceId,
        domain_pattern: data.domain,
        label: data.label ?? data.domain,
      })
      .select("id, label, domain_pattern")
      .single();
    if (error) throw error;
    return row;
  });

export const deleteTargetAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("target_accounts").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const getIntegrations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { workspaceId: string }) =>
    z.object({ workspaceId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("integrations")
      .select("id, type, enabled, settings, created_at")
      .eq("workspace_id", data.workspaceId);
    if (error) throw error;
    return rows ?? [];
  });

export const upsertWebhookIntegration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { workspaceId: string; type: "slack" | "teams"; webhookUrl: string }) =>
    z
      .object({
        workspaceId: z.string().uuid(),
        type: z.enum(["slack", "teams"]),
        webhookUrl: z.string().url().max(500),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    // Replace any existing of same type.
    await context.supabase
      .from("integrations")
      .delete()
      .eq("workspace_id", data.workspaceId)
      .eq("type", data.type);
    const { data: row, error } = await context.supabase
      .from("integrations")
      .insert({
        workspace_id: data.workspaceId,
        type: data.type,
        enabled: true,
        settings: { webhook_url: data.webhookUrl },
      })
      .select("id, type, enabled, settings")
      .single();
    if (error) throw error;
    return row;
  });

export const deleteIntegration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("integrations").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const getStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { workspaceId: string }) =>
    z.object({ workspaceId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: sites } = await context.supabase
      .from("sites")
      .select("id")
      .eq("workspace_id", data.workspaceId);
    const siteIds = (sites ?? []).map((s) => s.id);
    if (siteIds.length === 0)
      return { sessions: 0, companies: 0, people: 0, sites: 0 };

    const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    const [sessions, companies, people] = await Promise.all([
      context.supabase
        .from("sessions")
        .select("id", { count: "exact", head: true })
        .in("site_id", siteIds)
        .gte("started_at", since),
      context.supabase
        .from("sessions")
        .select("company_id", { count: "exact", head: true })
        .in("site_id", siteIds)
        .not("company_id", "is", null)
        .gte("started_at", since),
      context.supabase
        .from("people")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", data.workspaceId),
    ]);

    return {
      sessions: sessions.count ?? 0,
      companies: companies.count ?? 0,
      people: people.count ?? 0,
      sites: siteIds.length,
    };
  });

export const getPeople = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { workspaceId: string }) =>
    z.object({ workspaceId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: people, error } = await context.supabase
      .from("people")
      .select("id, email, name, consent_source, consent_ts, created_at, company_id, companies(id, name, domain, logo_url)")
      .eq("workspace_id", data.workspaceId)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw error;
    return people ?? [];
  });

export const deletePerson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("people").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const getCompanyDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { workspaceId: string; companyId: string }) =>
    z
      .object({
        workspaceId: z.string().uuid(),
        companyId: z.string().uuid(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: company, error: cErr } = await context.supabase
      .from("companies")
      .select("id, name, domain, logo_url, industry, size, country")
      .eq("id", data.companyId)
      .maybeSingle();
    if (cErr) throw cErr;
    if (!company) return null;

    const { data: sites } = await context.supabase
      .from("sites")
      .select("id")
      .eq("workspace_id", data.workspaceId);
    const siteIds = (sites ?? []).map((s) => s.id);
    if (siteIds.length === 0) return { company, sessions: [], pageviews: [] };

    const { data: sessions } = await context.supabase
      .from("sessions")
      .select("id, started_at, last_seen_at, country, person_id, people(id, email, name)")
      .eq("company_id", data.companyId)
      .in("site_id", siteIds)
      .order("last_seen_at", { ascending: false })
      .limit(50);

    const sessionIds = (sessions ?? []).map((s) => s.id);
    const { data: pageviews } = sessionIds.length
      ? await context.supabase
          .from("pageviews")
          .select("id, session_id, url, title, ts")
          .in("session_id", sessionIds)
          .order("ts", { ascending: false })
          .limit(100)
      : { data: [] as any[] };

    return { company, sessions: sessions ?? [], pageviews: pageviews ?? [] };
  });
