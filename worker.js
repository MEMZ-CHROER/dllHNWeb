// Cloudflare Worker — API 网关 + OAuth + 缓存加速

const GH_API = 'https://api.github.com';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // ── OAuth ──
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

    // ── API 代理（只缓存 GET，10 秒 TTL）──
    if (path.startsWith("/api/") || path.startsWith("/raw/")) {
      const isRaw = path.startsWith("/raw/");
      const target = GH_API + path.replace(/^\/(api|raw)/, "") + url.search;
      const cache = caches.default;

      // GET 请求走缓存
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

      // 非 GET（PUT/POST/DELETE）直通，不缓存
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

    return new Response("Not Found", { status: 404 });
  },
};
