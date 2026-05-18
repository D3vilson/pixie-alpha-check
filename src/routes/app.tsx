import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app")({
  head: () => ({ meta: [{ title: "Dashboard — VisitorID EU" }] }),
  component: AppPlaceholder,
});

function AppPlaceholder() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate({ to: "/login" });
        return;
      }
      setEmail(data.session.user.email ?? null);
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-xs uppercase tracking-wider text-accent">Coming up next</p>
        <h1 className="mt-3 font-display text-4xl">Workspace dashboard</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Signed in as <strong>{email ?? "…"}</strong>. The live visits feed, target accounts, and integrations land here in the next build.
        </p>
        <button
          onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/login" }); }}
          className="mt-6 inline-flex rounded-md border border-border bg-card px-4 py-2 text-sm hover:bg-surface"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
