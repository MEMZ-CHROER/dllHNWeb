// Cloudflare Worker — GitHub API proxy + OAuth
// token 存在环境变量（Secrets）中，浏览器永不接触

const GH_BASE = 'https://api.github.com';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const TOKEN = env.GITHUB_TOKEN;
    const CLIENT_ID = env.GITHUB_CLIENT_ID;
    const CLIENT_SECRET = env.GITHUB_CLIENT_SECRET;

    // ── OAuth ──
    if (path === "/auth") {
      if (url.searchParams.has("code")) {
        const code = url.searchParams.get("code");
        const r = await fetch("https://github.com/login/oauth/access_token", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code }),
        });
        const data = await r.json();
        const token = data.access_token;
        return new Response(
          `<!DOCTYPE html><html><body><script>
(function() {
  var token = ${JSON.stringify(token)};
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
      const loc = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent("https://hn.liuxiyu.cn/auth")}&scope=repo+user&allow_signup=false`;
      return Response.redirect(loc, 302);
    }

    // ── API 代理 (JSON) ──
    if (path.startsWith("/api/")) {
      const target = GH_BASE + path.replace("/api", "") + url.search;
      const headers = {
        Authorization: "Bearer " + TOKEN,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "CSEL-Worker",
      };
      const res = await fetch(target, { method: request.method, headers, body: request.body });
      return new Response(res.body, { status: res.status, headers: { "Access-Control-Allow-Origin": "*" } });
    }

    // ── API 代理 (raw) ──
    if (path.startsWith("/raw/")) {
      const target = GH_BASE + path.replace("/raw", "") + url.search;
      const headers = {
        Authorization: "Bearer " + TOKEN,
        Accept: "application/vnd.github.v3.raw",
        "User-Agent": "CSEL-Worker",
      };
      const res = await fetch(target, { method: request.method, headers });
      return new Response(res.body, { status: res.status, headers: { "Access-Control-Allow-Origin": "*" } });
    }

    return new Response("Not Found", { status: 404 });
  },
};
