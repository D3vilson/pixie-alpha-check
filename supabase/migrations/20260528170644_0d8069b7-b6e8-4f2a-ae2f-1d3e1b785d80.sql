
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS intent_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pageview_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_scroll_pct integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_duration_ms bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_alert_at timestamptz,
  ADD COLUMN IF NOT EXISTS high_intent_hit boolean NOT NULL DEFAULT false;

ALTER TABLE public.sites
  ADD COLUMN IF NOT EXISTS alert_threshold integer NOT NULL DEFAULT 70,
  ADD COLUMN IF NOT EXISTS high_intent_paths text[] NOT NULL DEFAULT ARRAY['/pricing','/cennik','/demo','/contact','/kontakt']::text[];

CREATE INDEX IF NOT EXISTS sessions_site_score_idx
  ON public.sessions (site_id, intent_score DESC, last_seen_at DESC);
