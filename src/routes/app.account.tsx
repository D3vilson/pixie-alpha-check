import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/use-workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/app/account")({
  head: () => ({ meta: [{ title: "Konto — Pixie" }] }),
  component: AccountPage,
});

type Plan = "free" | "starter" | "pro" | "scale";

const PLAN_LIMITS: Record<Plan, { visits: number; price: string; label: string }> = {
  free: { visits: 500, price: "0 zł", label: "Free" },
  starter: { visits: 5_000, price: "149 zł / mies.", label: "Starter" },
  pro: { visits: 25_000, price: "449 zł / mies.", label: "Pro" },
  scale: { visits: 100_000, price: "1 290 zł / mies.", label: "Scale" },
};

function AccountPage() {
  const { data: ws } = useWorkspace();
  const [user, setUser] = useState<{ id: string; email?: string; created_at?: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser({ id: data.user.id, email: data.user.email, created_at: data.user.created_at });
    });
  }, []);

  const plan = (ws?.workspace.plan ?? "free") as Plan;
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
  // Mock usage — real metering can be wired later.
  const usedVisits = Math.floor(limits.visits * 0.32);
  const usagePct = Math.min(100, Math.round((usedVisits / limits.visits) * 100));

  return (
    <div className="px-8 py-8 max-w-3xl">
      <h1 className="font-display text-3xl">Konto</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Zarządzaj swoim profilem, hasłem i planem subskrypcji.
      </p>

      {/* Profile */}
      <Section title="Profil" desc="Twoje dane konta w Pixie.">
        <div className="grid grid-cols-[140px_1fr] gap-y-2 text-sm">
          <span className="text-muted-foreground">Email</span>
          <span className="font-medium">{user?.email ?? "—"}</span>
          <span className="text-muted-foreground">User ID</span>
          <code className="text-xs">{user?.id ?? "—"}</code>
          <span className="text-muted-foreground">Konto od</span>
          <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString("pl-PL") : "—"}</span>
          <span className="text-muted-foreground">Workspace</span>
          <span>{ws?.workspace.name} <span className="text-muted-foreground">({ws?.role})</span></span>
        </div>
      </Section>

      <ChangeEmailForm currentEmail={user?.email} />
      <ChangePasswordForm />
      <PlanBillingSection plan={plan} limits={limits} usedVisits={usedVisits} usagePct={usagePct} />
      <DangerZone email={user?.email} />
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <div className="mb-3">
        <h2 className="font-medium">{title}</h2>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      <div className="rounded-lg border border-border/60 bg-card p-5">{children}</div>
    </section>
  );
}

function ChangeEmailForm({ currentEmail }: { currentEmail?: string }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Section title="Zmiana adresu e-mail" desc="Wyślemy link potwierdzający na nowy adres.">
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!email || email === currentEmail) return;
          setBusy(true);
          const { error } = await supabase.auth.updateUser({ email });
          setBusy(false);
          if (error) toast.error(error.message);
          else { toast.success("Sprawdź skrzynkę — wysłaliśmy link potwierdzający."); setEmail(""); }
        }}
      >
        <div>
          <Label htmlFor="new-email">Nowy adres e-mail</Label>
          <Input id="new-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ty@firma.pl" required className="mt-1" />
        </div>
        <Button type="submit" disabled={busy || !email}>{busy ? "Wysyłam…" : "Zaktualizuj e-mail"}</Button>
      </form>
    </Section>
  );
}

function ChangePasswordForm() {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Section title="Zmiana hasła" desc="Minimum 8 znaków. Po zmianie pozostajesz zalogowany na tym urządzeniu.">
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (pw.length < 8) return toast.error("Hasło musi mieć co najmniej 8 znaków.");
          if (pw !== pw2) return toast.error("Hasła nie są identyczne.");
          setBusy(true);
          const { error } = await supabase.auth.updateUser({ password: pw });
          setBusy(false);
          if (error) toast.error(error.message);
          else { toast.success("Hasło zaktualizowane."); setPw(""); setPw2(""); }
        }}
      >
        <div>
          <Label htmlFor="new-pw">Nowe hasło</Label>
          <Input id="new-pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} required minLength={8} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="new-pw2">Powtórz nowe hasło</Label>
          <Input id="new-pw2" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} required minLength={8} className="mt-1" />
        </div>
        <Button type="submit" disabled={busy || !pw || !pw2}>{busy ? "Zapisuję…" : "Zmień hasło"}</Button>
      </form>
    </Section>
  );
}

function PlanBillingSection({
  plan, limits, usedVisits, usagePct,
}: { plan: Plan; limits: typeof PLAN_LIMITS[Plan]; usedVisits: number; usagePct: number }) {
  const cycleEnd = new Date(); cycleEnd.setDate(1); cycleEnd.setMonth(cycleEnd.getMonth() + 1);
  return (
    <Section title="Plan & billing" desc="Zarządzaj subskrypcją i monitoruj zużycie.">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Aktualny plan</span>
            <span className="rounded-full bg-primary/10 text-primary text-xs px-2 py-0.5 font-medium">{limits.label}</span>
          </div>
          <p className="mt-1 text-lg font-medium">{limits.price}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Następny okres rozliczeniowy: {cycleEnd.toLocaleDateString("pl-PL")}
          </p>
        </div>
        <div className="flex gap-2">
          {plan !== "scale" && (
            <Button onClick={() => toast.info("Upgrade dostępny wkrótce — odezwij się do nas na hello@pixie.app")}>
              Zmień plan
            </Button>
          )}
          <Button variant="outline" onClick={() => toast.info("Portal billingowy uruchomimy w kolejnym wydaniu.")}>
            Faktury
          </Button>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>Wizyty zidentyfikowane w tym cyklu</span>
          <span>{usedVisits.toLocaleString("pl-PL")} / {limits.visits.toLocaleString("pl-PL")}</span>
        </div>
        <div className="h-2 rounded-full bg-surface overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${usagePct}%` }}
          />
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-border/60 text-xs text-muted-foreground">
        Metoda płatności i pełen historia faktur — wkrótce w samoobsłudze. Tymczasem napisz na{" "}
        <a href="mailto:billing@pixie.app" className="text-primary hover:underline">billing@pixie.app</a>.
      </div>
    </Section>
  );
}

function DangerZone({ email }: { email?: string }) {
  return (
    <section className="mt-10">
      <h2 className="font-medium text-destructive mb-3">Strefa niebezpieczna</h2>
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="font-medium">Usuń konto</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-md">
              Trwale usuwa Twoje konto, workspace, wszystkie wizyty i konfigurację. Operacji nie da się cofnąć.
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={() => {
              const ok = typeof window !== "undefined" && window.confirm(
                `Na pewno usunąć konto ${email ?? ""}? Tej operacji nie można cofnąć.`
              );
              if (ok) toast.info("Wyślij potwierdzenie usunięcia na privacy@pixie.app — usuniemy konto w 24h.");
            }}
          >
            Usuń konto
          </Button>
        </div>
      </div>
    </section>
  );
}
