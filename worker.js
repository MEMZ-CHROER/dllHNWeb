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

      // 渲染页面：多路尝试把 token 送回 Decap CMS
      return new Response(
        `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
<script>
(function() {
  var data = ${JSON.stringify(data)};
  var token = data.access_token;
  console.log('OAuth token:', token ? 'got it' : 'missing');

  // 1) 标准 postMessage 对象格式
  if (window.opener) {
    window.opener.postMessage({ type: 'authorization', data: { token: token } }, '${SITE}');
    window.opener.postMessage({ type: 'authorization', data: { token: token } }, '*');
    // 2) 字符串前缀格式 (legacy)
    window.opener.postMessage('authorization:' + JSON.stringify({ token: token }), '${SITE}');

    // 3) code+state 格式
    window.opener.postMessage({ code: data.access_token, state: '${SITE}' }, '${SITE}');
  }

  // 4) localStorage 兜底
  if (token) {
    localStorage.setItem('github_token', token);
  }

  // 5) 重定向兜底
  if (token) {
    window.location.href = '${SITE}/admin/#access_token=' + token;
  } else {
    window.close();
  }
})();
<\/script></body></html>`,
        { headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    return new Response("Not Found", { status: 404 });
  },
};
