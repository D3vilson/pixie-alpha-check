import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { I18nProvider, useT } from "@/i18n";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  const t = useT();
  const router = useRouter();
  const pathname = typeof window !== "undefined" ? window.location.pathname + window.location.search : "(SSR)";
  const matches = router.state.matches.map((m) => m.routeId);
  const allRoutes = Object.keys((router as unknown as { routesById?: Record<string, unknown> }).routesById ?? {}).sort();

  useEffect(() => {
    console.warn("[Router 404] No route matched", {
      pathname,
      matchedRouteIds: matches,
      registeredRoutes: allRoutes,
    });
  }, [pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-3xl">
        <h1 className="text-5xl font-bold text-foreground">404</h1>
        <h2 className="mt-3 text-lg font-semibold text-foreground">{t.app.notFound.h2}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t.app.notFound.body}</p>

        <div className="mt-6 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-left text-xs font-mono">
          <div className="mb-2 text-sm font-semibold text-destructive">🔎 Router diagnostics</div>
          <div><span className="opacity-70">pathname:</span> {pathname}</div>
          <div className="mt-1">
            <span className="opacity-70">matched routeIds:</span>{" "}
            {matches.length ? matches.join(" → ") : "(none)"}
          </div>
          <details className="mt-2">
            <summary className="cursor-pointer opacity-70">Registered routes ({allRoutes.length})</summary>
            <ul className="mt-2 max-h-64 overflow-auto">
              {allRoutes.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </details>
          <div className="mt-2 opacity-70">Pełny log w konsoli przeglądarki (filter: "[Router 404]").</div>
        </div>

        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t.app.notFound.goHome}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const t = useT();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{t.app.error.h1}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.app.error.body}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t.app.error.tryAgain}
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {t.app.notFound.goHome}
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "xx" },
      { name: "description", content: "Identifies website visitors, revealing company names and contact details for B2B sales." },
      { name: "author", content: "Pixie" },
      { property: "og:title", content: "xx" },
      { property: "og:description", content: "Identifies website visitors, revealing company names and contact details for B2B sales." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "xx" },
      { name: "twitter:description", content: "Identifies website visitors, revealing company names and contact details for B2B sales." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/2a4bdc2d-0a3e-45e4-9ba0-00918ef96e0f/id-preview-19a579d2--3b881b0e-c61f-415e-8aa3-da9d6271efe6.lovable.app-1784194271756.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/2a4bdc2d-0a3e-45e4-9ba0-00918ef96e0f/id-preview-19a579d2--3b881b0e-c61f-415e-8aa3-da9d6271efe6.lovable.app-1784194271756.png" },
    ],
    links: [
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      router.invalidate();
      queryClient.invalidateQueries();
    });
    return () => subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <Outlet />
        <Toaster richColors position="top-right" />
      </I18nProvider>
    </QueryClientProvider>
  );
}
