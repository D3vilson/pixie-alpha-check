import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { bootstrapWorkspace } from "@/lib/workspace.functions";
import { useT } from "@/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";

export const Route = createFileRoute("/app")({
  head: () => ({ meta: [{ title: "Dashboard — Pixie" }] }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
  },
  component: AppLayout,
});

function AppLayout() {
  const t = useT();
  const navigate = useNavigate();
  const bootstrap = useServerFn(bootstrapWorkspace);
  const { data, isLoading, error } = useQuery({
    queryKey: ["workspace-bootstrap"],
    queryFn: () => bootstrap(),
  });

  useEffect(() => { if (error) console.error(error); }, [error]);

  if (isLoading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">{t.app.loadingWs}</p>
      </div>
    );
  }

  const ws = data.workspace;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen grid-cols-[240px_1fr]">
        <aside className="border-r border-border/60 bg-surface px-4 py-6 flex flex-col">
          <div className="px-2 mb-8">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z" />
                </svg>
              </span>
              <span className="font-display text-base">Pixie</span>
            </Link>
            <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">{t.app.workspace}</p>
            <p className="text-sm font-medium truncate">{ws.name}</p>
          </div>
          <nav className="flex flex-col gap-0.5 text-sm">
            <NavItem to="/app" label={t.app.nav.liveVisits} exact />
            <NavItem to="/app/install" label="📌 Instalacja" />
            <NavItem to="/app/hot-leads" label="🔥 Hot Leads" />
            <NavItem to="/app/companies" label={t.app.nav.companies} />
            <NavItem to="/app/people" label={t.app.nav.people} />
            <NavItem to="/app/target-accounts" label={t.app.nav.targetAccounts} />
            <NavItem to="/app/integrations" label={t.app.nav.integrations} />
            <NavItem to="/app/consent-audit" label={t.app.nav.consentAudit} />
            <NavItem to="/app/settings" label={t.app.nav.settings} />
            <NavItem to="/app/account" label="👤 Konto" />
          </nav>
          <div className="mt-auto pt-6 border-t border-border/60 space-y-3">
            <LanguageSwitcher className="w-full justify-center" />
            <button
              onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/login" }); }}
              className="w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-background hover:text-foreground"
            >
              {t.common.signOut}
            </button>
          </div>
        </aside>
        <main className="overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavItem({ to, label, exact }: { to: string; label: string; exact?: boolean }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact }}
      className="rounded-md px-3 py-2 text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
      activeProps={{ className: "rounded-md px-3 py-2 bg-background text-foreground font-medium" }}
    >
      {label}
    </Link>
  );
}
