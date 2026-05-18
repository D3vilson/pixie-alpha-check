import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_marketing")({
  component: MarketingLayout,
});

function MarketingLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <Logo />
          <span className="font-display text-xl tracking-tight">VisitorID <span className="text-accent">EU</span></span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <Link to="/features" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>Features</Link>
          <Link to="/pricing" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>Pricing</Link>
          <Link to="/gdpr" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>GDPR</Link>
          <Link to="/docs/install" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>Install</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="hidden sm:inline-flex items-center justify-center rounded-md px-3 py-2 text-sm text-foreground/80 hover:text-foreground transition-colors"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 bg-surface">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="font-display text-lg">VisitorID <span className="text-accent">EU</span></span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            See which European companies visit your website — built around GDPR, not around it.
          </p>
        </div>
        <FooterCol title="Product" items={[
          { to: "/features", label: "Features" },
          { to: "/pricing", label: "Pricing" },
          { to: "/docs/install", label: "Install" },
        ]} />
        <FooterCol title="Trust" items={[
          { to: "/gdpr", label: "GDPR & DPA" },
          { to: "/gdpr", label: "Sub-processors" },
          { to: "/gdpr", label: "Data deletion" },
        ]} />
        <FooterCol title="Company" items={[
          { to: "/login", label: "Log in" },
          { to: "/signup", label: "Sign up" },
        ]} />
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-5 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} VisitorID EU. Built in the EU.</span>
          <span>Lawful basis: legitimate interest (company reveal) · consent (person reveal)</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { to: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground/70">{title}</h4>
      <ul className="mt-4 space-y-2 text-sm">
        {items.map((i) => (
          <li key={i.label}>
            <Link to={i.to} className="text-muted-foreground hover:text-foreground transition-colors">
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Logo() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z" />
      </svg>
    </span>
  );
}
