import { createFileRoute } from "@tanstack/react-router";

// VisitorID EU — pixel śledzący (warstwa 1: zbieranie)
// Instalacja: <script async src="https://app.visitorid.eu/api/public/t.js" data-vid="YOUR_ID"></script>
// Zgodność: GDPR (wyrok NSA 16.10.2025), GPC, brak cookies, brak fingerprintu.
const SCRIPT = `(function(){
  try {
    var s = document.currentScript;
    var tid = s && s.getAttribute('data-vid');
    if (!tid) return;
    var origin = new URL(s.src).origin;
    var endpoint = origin + '/api/public/collect';

    // Opt-out: Global Privacy Control + cookie do-not-identify
    if (navigator.globalPrivacyControl) return;
    if (document.cookie.indexOf('vid_dni=1') !== -1) return;

    // Anonimowy identyfikator (first-party, scoped per domena klienta)
    var key = 'vid_aid';
    var aid = null;
    try { aid = localStorage.getItem(key); } catch(e) {}
    if (!aid) {
      aid = (crypto && crypto.randomUUID) ? crypto.randomUUID() : (Date.now() + '-' + Math.random().toString(36).slice(2));
      try { localStorage.setItem(key, aid); } catch(e) {}
    }

    // Sygnały intent scoring: czas na stronie, głębokość scrolla
    var pageStart = Date.now();
    var maxScroll = 0;
    function trackScroll() {
      var h = document.documentElement;
      var total = (h.scrollHeight - h.clientHeight) || 1;
      var pct = Math.round((h.scrollTop || window.pageYOffset || 0) / total * 100);
      if (pct > maxScroll) maxScroll = Math.min(100, pct);
    }
    window.addEventListener('scroll', trackScroll, { passive: true });

    function send(event, extra) {
      var body = Object.assign({
        tracking_id: tid,
        anon_id: aid,
        event: event || 'pageview',
        url: location.href,
        referrer: document.referrer || null,
        title: document.title,
        tz: (Intl.DateTimeFormat().resolvedOptions().timeZone) || null,
        lang: navigator.language || null,
        screen: (screen.width || 0) + 'x' + (screen.height || 0),
        duration_ms: Date.now() - pageStart,
        scroll_pct: maxScroll,
      }, extra || {});
      try {
        var blob = new Blob([JSON.stringify(body)], { type: 'application/json' });
        if (navigator.sendBeacon) navigator.sendBeacon(endpoint, blob);
        else fetch(endpoint, { method: 'POST', body: JSON.stringify(body), headers: {'Content-Type':'application/json'}, keepalive: true });
      } catch (e) {}
    }

    // Pageview natychmiast
    send('pageview');

    // Re-send przy zmianie URL (SPA)
    function spaChange() {
      pageStart = Date.now();
      maxScroll = 0;
      send('pageview');
    }
    window.addEventListener('popstate', spaChange);
    var ps = history.pushState;
    history.pushState = function(){ ps.apply(this, arguments); setTimeout(spaChange, 0); };

    // Wyjście ze strony → finalny beacon z czasem trwania
    function flush() { send('unload'); }
    document.addEventListener('visibilitychange', function(){
      if (document.visibilityState === 'hidden') flush();
    });
    window.addEventListener('pagehide', flush);

    // Publiczne API do identyfikacji (wymaga zgody klienta — np. po submit formularza)
    window.VisitorID = window.VisitorID || {};
    window.VisitorID.identify = function(payload) {
      if (!payload || !payload.email || !payload.consent) {
        console.warn('[VisitorID] identify wymaga { email, consent }');
        return;
      }
      fetch(origin + '/api/public/identify', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          tracking_id: tid, anon_id: aid,
          email: payload.email, name: payload.name || null,
          consent: payload.consent,
        }),
        keepalive: true,
      }).catch(function(){});
    };
    window.VisitorID.optOut = function() {
      document.cookie = 'vid_dni=1; path=/; max-age=31536000; SameSite=Lax';
    };
  } catch (e) {}
})();`;

export const Route = createFileRoute("/api/public/t.js")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(SCRIPT, {
          status: 200,
          headers: {
            "Content-Type": "application/javascript; charset=utf-8",
            "Cache-Control": "public, max-age=300",
            "Access-Control-Allow-Origin": "*",
          },
        });
      },
    },
  },
});
