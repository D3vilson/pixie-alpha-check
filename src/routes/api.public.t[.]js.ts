import { createFileRoute } from "@tanstack/react-router";

const SCRIPT = `(function(){
  try {
    var s = document.currentScript;
    var tid = s && s.getAttribute('data-vid');
    if (!tid) return;
    var origin = new URL(s.src).origin;
    var endpoint = origin + '/api/public/collect';

    // GPC + do-not-identify opt-outs
    if (navigator.globalPrivacyControl) return;
    if (document.cookie.indexOf('vid_dni=1') !== -1) return;

    // first-party anon id, scoped to customer's domain
    var key = 'vid_aid';
    var aid = localStorage.getItem(key);
    if (!aid) {
      aid = (crypto.randomUUID ? crypto.randomUUID() : (Date.now() + '-' + Math.random()));
      localStorage.setItem(key, aid);
    }

    function send(extra) {
      var body = Object.assign({
        tracking_id: tid,
        anon_id: aid,
        url: location.href,
        referrer: document.referrer || null,
        title: document.title,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }, extra || {});
      try {
        var blob = new Blob([JSON.stringify(body)], { type: 'application/json' });
        if (navigator.sendBeacon) navigator.sendBeacon(endpoint, blob);
        else fetch(endpoint, { method: 'POST', body: JSON.stringify(body), headers: {'Content-Type':'application/json'}, keepalive: true });
      } catch (e) {}
    }

    send();
    window.addEventListener('popstate', function(){ send(); });
    // SPA pushState hook
    var ps = history.pushState;
    history.pushState = function(){ ps.apply(this, arguments); setTimeout(send, 0); };

    // public identify API
    window.VisitorID = window.VisitorID || {};
    window.VisitorID.identify = function(payload) {
      if (!payload || !payload.email || !payload.consent) {
        console.warn('[VisitorID] identify requires { email, consent }');
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
