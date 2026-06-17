import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { useT } from "@/i18n";
import { AuthShell, Field, Divider, GoogleIcon } from "./_marketing.login";

export const Route = createFileRoute("/_marketing/signup")({
  head: () => ({
    meta: [
      { title: "Create your workspace — Pixie" },
      { name: "description", content: "Start free for 14 days. EU-hosted, GDPR-compliant visitor identification." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const t = useT();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspace, setWorkspace] = useState("");
  const [loading, setLoading] = useState(false);

  const schema = z.object({
    email: z.string().trim().email(t.auth.errEmail).max(255),
    password: z.string().min(8, t.auth.errPw).max(72),
    workspace: z.string().trim().min(2, t.auth.errWs).max(80),
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/app" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password, workspace });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/app`,
        data: { pending_workspace: parsed.data.workspace },
      },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t.auth.checkEmail);
  };

  const google = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/app" });
    if (result.error) { setLoading(false); toast.error(t.auth.googleFailed); return; }
    if (result.redirected) return;
    navigate({ to: "/app" });
  };

  return (
    <AuthShell title={t.auth.signupTitle} subtitle={t.auth.signupSub}>
      <button onClick={google} disabled={loading} className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-surface disabled:opacity-50">
        <GoogleIcon /> {t.auth.signupGoogle}
      </button>
      <Divider />
      <form onSubmit={submit} className="space-y-3">
        <Field label={t.auth.workspaceName} type="text" value={workspace} onChange={setWorkspace} placeholder="Acme GmbH" />
        <Field label={t.auth.workEmail} type="email" value={email} onChange={setEmail} placeholder="you@company.eu" />
        <Field label={t.auth.password} type="password" value={password} onChange={setPassword} placeholder={t.auth.pwPlaceholder} />
        <button type="submit" disabled={loading} className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50">
          {loading ? t.auth.creating : t.auth.createWorkspace}
        </button>
      </form>
      <p className="text-center text-xs text-muted-foreground">
        {t.auth.acceptPre} <Link to="/gdpr" className="text-accent hover:underline">{t.auth.acceptLink}</Link>.
      </p>
      <p className="text-center text-sm text-muted-foreground">
        {t.auth.haveAccount} <Link to="/login" className="text-accent hover:underline">{t.common.logIn}</Link>
      </p>
    </AuthShell>
  );
}
