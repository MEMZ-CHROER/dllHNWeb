// Cloudflare Worker — API proxy + OAuth + Page Password Protection

const GH_API = 'https://api.github.com';
const SITE_ORIGIN = 'https://MEMZ-CHROER.github.io/dllHNWeb';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // ── Existing: OAuth ──
    if (path === "/auth") {
      if (url.searchParams.has("code")) {
        const code = url.searchParams.get("code");
        const r = await fetch("https://github.com/login/oauth/access_token", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code }),
        });
        const data = await r.json();
        return new Response(
          `<!DOCTYPE html><html><body><script>
(function() {
  var token = ${JSON.stringify(data.access_token)};
  if (token && window.opener) {
    window.opener.postMessage({ type: 'authorization', data: { token: token } }, '*');
    window.opener.postMessage('authorization:' + JSON.stringify({ token: token }), '*');
  }
  window.close();
})();
<\/script></body></html>`,
          { headers: { "Content-Type": "text/html; charset=utf-8" } }
        );
      }
      const loc = `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent("https://hn.liuxiyu.cn/auth")}&scope=repo+user&allow_signup=false`;
      return Response.redirect(loc, 302);
    }

    // ── Existing: API proxy (cached GET, passthrough others) ──
    if (path.startsWith("/api/") || path.startsWith("/raw/")) {
      const isRaw = path.startsWith("/raw/");
      const target = GH_API + path.replace(/^\/(api|raw)/, "") + url.search;
      const cache = caches.default;
      if (request.method === "GET") {
        const cacheKey = new Request(target, request);
        let cached = await cache.match(cacheKey);
        if (cached) return cached;
        let res = await fetch(target, {
          headers: {
            Authorization: "Bearer " + env.GITHUB_TOKEN,
            "Content-Type": "application/json",
            Accept: isRaw ? "application/vnd.github.v3.raw" : "application/vnd.github.v3+json",
            "User-Agent": "CSEL-Worker",
          },
        });
        res = new Response(res.body, res);
        res.headers.set("Cache-Control", "public, max-age=10");
        ctx.waitUntil(cache.put(cacheKey, res.clone()));
        return res;
      }
      return fetch(target, {
        method: request.method,
        headers: {
          Authorization: "Bearer " + env.GITHUB_TOKEN,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "CSEL-Worker",
        },
        body: request.body,
      });
    }

    // ── Password Protection ──
    // Normalize path: /md-jc → /md-jc, /md-jc/ → /md-jc
    var pagePath = path.replace(/\/$/, '');
    // Check cookie
    var cookie = request.headers.get('Cookie') || '';
    var passKey = 'pw_' + pagePath.replace(/\//g, '_');
    var passed = cookie.includes(passKey + '=1');

    // Check if password form was submitted
    if (request.method === 'POST' && pagePath !== '/admin' && !pagePath.startsWith('/admin') && !pagePath.startsWith('/assets')) {
      var body = await request.text();
      var formData = new URLSearchParams(body);
      var submittedPw = formData.get('password') || '';
      // Fetch password config
      var cfgUrl = GH_API + '/repos/MEMZ-CHROER/dllHNWeb/contents/_passwords.json';
      var cfgRes = await fetch(cfgUrl, {
        headers: { Authorization: "Bearer " + env.GITHUB_TOKEN, Accept: "application/vnd.github.v3.raw", "User-Agent": "CSEL-Worker" },
      });
      if (cfgRes.ok) {
        var cfgText = await cfgRes.text();
        try {
          var cfg = JSON.parse(cfgText);
          if (cfg[pagePath] && cfg[pagePath] === submittedPw) {
            var redirect = pagePath || '/';
            return new Response('', {
              status: 302,
              headers: {
                'Set-Cookie': passKey + '=1; Path=/; Max-Age=86400; SameSite=Lax',
                'Location': redirect,
              },
            });
          }
        } catch(e) {}
      }
      return new Response('密码错误', { status: 403 });
    }

    // If not passed, show password form
    if (!passed && pagePath !== '/admin' && !pagePath.startsWith('/admin') && !pagePath.startsWith('/assets')) {
      var cfgUrl2 = GH_API + '/repos/MEMZ-CHROER/dllHNWeb/contents/_passwords.json';
      var cfgRes2 = await fetch(cfgUrl2, {
        headers: { Authorization: "Bearer " + env.GITHUB_TOKEN, Accept: "application/vnd.github.v3.raw", "User-Agent": "CSEL-Worker" },
      });
      var needsPw = false;
      if (cfgRes2.ok) {
        var cfgText2 = await cfgRes2.text();
        try { var cfg2 = JSON.parse(cfgText2); if (cfg2[pagePath]) needsPw = true; } catch(e) {}
      }
      if (needsPw) {
        return new Response(
          '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">' +
          '<title>页面已加密</title><style>body{margin:0;background:#0c0c0c;color:#cce8cc;font:16px/1.7 monospace;display:flex;min-height:100vh;align-items:center;justify-content:center}' +
          '.box{max-width:380px;padding:32px;background:#0f1a0f;border:1px solid #1a3a1a;text-align:center}' +
          'h1{font-size:20px;color:#00ff41;margin:0 0 16px}input{width:100%;padding:10px;background:#0c0c0c;border:1px solid #1a3a3a;color:#cce8cc;font:15px monospace;box-sizing:border-box}' +
          'button{width:100%;padding:12px;margin-top:12px;background:#00ff41;color:#000;border:none;font:15px monospace;font-weight:bold;cursor:pointer}' +
          '.err{color:#e74c3c;font-size:14px}</style></head><body>' +
          '<div class="box"><h1>🔒 页面已加密</h1>' +
          (url.searchParams.get('wrong') ? '<p class="err">密码错误</p>' : '') +
          '<form method="POST"><input type="password" name="password" placeholder="输入访问密码" /><button type="submit">验证</button></form></div></body></html>',
          { headers: { "Content-Type": "text/html; charset=utf-8" } }
        );
      }
    }

    // ── Proxy to origin (GitHub Pages) ──
    var originUrl = SITE_ORIGIN + path;
    var cache = caches.default;
    var cacheKey = new Request(originUrl, request);
    var cached = await cache.match(cacheKey);
    if (cached) return cached;
    var originRes = await fetch(originUrl, { headers: { "User-Agent": "CSEL-Worker" } });
    var res = new Response(originRes.body, originRes);
    if (originRes.ok) {
      res.headers.set("Cache-Control", "public, max-age=300");
      ctx.waitUntil(cache.put(cacheKey, res.clone()));
    }
    return res;
  },
};
