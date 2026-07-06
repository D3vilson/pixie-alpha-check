import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Minimal typed wrapper for the beta `supabase.auth.oauth` namespace so the
// route type-checks without reaching into node_modules.
type AuthorizationDetails = {
  client?: { name?: string | null; logo_url?: string | null } | null;
  redirect_url?: string | null;
  redirect_to?: string | null;
  scopes?: string[] | null;
};
type OAuthNs = {
  getAuthorizationDetails: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  denyAuthorization: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
};
const oauthNs = () =>
  (supabase.auth as unknown as { oauth: OAuthNs }).oauth;

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id:
      typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    const next = location.pathname + location.searchStr;
    if (!data.session) throw redirect({ to: "/login", search: { next } });
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get(
      "authorization_id",
    )!;
    const { data, error } = await oauthNs().getAuthorizationDetails(
      authorizationId,
    );
    if (error) throw error;
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="min-h-screen flex items-center justify-center p-8 text-sm text-muted-foreground">
      Nie udało się załadować żądania autoryzacji:{" "}
      {String((error as Error)?.message ?? error)}
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const ns = oauthNs();
    const { data, error } = approve
      ? await ns.approveAuthorization(authorization_id)
      : await ns.denyAuthorization(authorization_id);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("Serwer autoryzacji nie zwrócił adresu przekierowania.");
      return;
    }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? "aplikację zewnętrzną";

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
      <div className="w-full max-w-md rounded-xl border border-border/60 bg-card p-6 shadow-sm">
        <h1 className="font-display text-2xl">Połącz {clientName} z Pixie</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {clientName} będzie mogła używać narzędzi Pixie w Twoim imieniu —
          czytać sesje, firmy, hot leady i zarządzać target accountami w Twoim
          workspace.
        </p>
        {details?.scopes && details.scopes.length > 0 && (
          <ul className="mt-4 text-xs text-muted-foreground list-disc pl-5 space-y-1">
            {details.scopes.map((s: string) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        )}
        {error && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="mt-6 flex gap-3">
          <button
            disabled={busy}
            onClick={() => decide(true)}
            className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {busy ? "…" : "Zatwierdź"}
          </button>
          <button
            disabled={busy}
            onClick={() => decide(false)}
            className="flex-1 rounded-md border border-border px-4 py-2 text-sm disabled:opacity-60"
          >
            Odrzuć
          </button>
        </div>
      </div>
    </main>
  );
}
