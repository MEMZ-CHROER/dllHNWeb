// Cloudflare Worker — Decap CMS GitHub OAuth
const CLIENT_ID = "Ov23lic1nKgeoKmknWON";
const CLIENT_SECRET = "a2813536d99cd25b5bcc313bb7ced55255289c1c";
const SITE = "https://hn.liuxiyu.cn";

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // ── 有 code → 回调 ──
    if (path === "/auth" && url.searchParams.has("code")) {
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

    // ── 无 code → 发起 OAuth ──
    if (path === "/auth") {
      const loc = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(SITE + "/auth")}&scope=repo+user&allow_signup=false`;
      return Response.redirect(loc, 302);
    }

    return new Response("Not Found", { status: 404 });
  },
};
