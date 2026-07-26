// Cloudflare Worker — Decap CMS GitHub OAuth
// 部署到 hn.liuxiyu.cn/auth* 路由

const CLIENT_ID = "Ov23lic1nKgeoKmknWON";
const CLIENT_SECRET = "a2813536d99cd25b5bcc313bb7ced55255289c1c";
const SITE = "https://hn.liuxiyu.cn";

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // ── 1. 发起 OAuth ──
    if (path === "/auth") {
      const cb = `${SITE}/auth/callback`;
      const loc = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(cb)}&scope=repo+user&allow_signup=false`;
      return Response.redirect(loc, 302);
    }

    // ── 2. GitHub 回调 ──
    if (path === "/auth/callback") {
      const code = url.searchParams.get("code");
      if (!code) return new Response("missing code", { status: 400 });

      // 交换 token
      const r = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code }),
      });
      const data = await r.json();

      // 纯 postMessage + 关闭弹窗
      return new Response(
        `<!DOCTYPE html><html><body><script>
(function() {
  var token = (${JSON.stringify(data)}).access_token;
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

    return new Response("Not Found", { status: 404 });
  },
};
