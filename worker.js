// Cloudflare Worker — API proxy + OAuth + Page Password Protection + Multi-User Auth

const GH_API = 'https://api.github.com';
const SITE_ORIGIN = 'https://MEMZ-CHROER.github.io/dllHNWeb';
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_LOGIN_ATTEMPTS = 5;
const MAX_USERNAME_LEN = 32;
const MAX_PASSWORD_LEN = 128;

// In-memory rate limiter (per Worker instance, resets on cold start)
const loginAttempts = new Map();

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

async function sha256(input) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function isAdmin(token, db) {
  if (!token || typeof token !== "string") return false;
  const { results } = await db.prepare(
    "SELECT u.role FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ?"
  ).bind(token).all();
  return results && results.length > 0 && results[0].role === "admin";
}

function sanitize(input, maxLen = MAX_USERNAME_LEN) {
  if (typeof input !== "string") return "";
  return input.replace(/[<>&"'\\;]/g, "").trim().substring(0, maxLen);
}

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (entry) {
    if (entry.count >= MAX_LOGIN_ATTEMPTS && now - entry.windowStart < RATE_LIMIT_WINDOW) {
      return false;
    }
    if (now - entry.windowStart > RATE_LIMIT_WINDOW) {
      loginAttempts.set(ip, { count: 1, windowStart: now });
    } else {
      entry.count++;
    }
  } else {
    loginAttempts.set(ip, { count: 1, windowStart: now });
  }
  return true;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // ── CORS preflight ──
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE", "Access-Control-Allow-Headers": "Content-Type,Authorization" } });
    }

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

    // ═══════════════════════════════════════════════
    //  MULTI-USER AUTH API
    // ═══════════════════════════════════════════════

    // Login
    if (path === "/api/auth/login" && request.method === "POST") {
      const clientIp = request.headers.get("CF-Connecting-IP") || "unknown";
      if (!checkRateLimit(clientIp)) {
        return json({ error: "too many attempts, try later" }, 429);
      }
      const body = await request.json();
      const username = sanitize(body.username, MAX_USERNAME_LEN);
      const password = typeof body.password === "string" ? body.password.substring(0, MAX_PASSWORD_LEN) : "";
      if (!username || username.length < 2) return json({ error: "invalid username" }, 400);
      if (!password) return json({ error: "invalid password" }, 400);
      const { results } = await env.DB.prepare("SELECT * FROM users WHERE username = ?").bind(username).all();
      if (!results || results.length === 0) return json({ error: "invalid credentials" }, 401);
      const user = results[0];
      const hash = await sha256(password);
      if (hash !== user.password_hash) return json({ error: "invalid credentials" }, 401);
      const token = await sha256(username + ":" + hash + ":" + crypto.randomUUID());
      await env.DB.prepare("INSERT INTO sessions (user_id, token) VALUES (?, ?)").bind(user.id, token).run();
      // Reset rate limit on success
      loginAttempts.delete(clientIp);
      return json({ token, username: user.username, role: user.role, permissions: user.permissions || "all" });
    }

    // Verify session
    if (path === "/api/auth/check" && request.method === "POST") {
      const body = await request.json();
      if (!body.token || typeof body.token !== "string") return json({ valid: false });
      const { results } = await env.DB.prepare(
        "SELECT u.id, u.username, u.role FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ?"
      ).bind(body.token).all();
      if (!results || results.length === 0) return json({ valid: false });
      return json({ valid: true, username: results[0].username, role: results[0].role, permissions: results[0].permissions || "all" });
    }

    // Logout
    if (path === "/api/auth/logout" && request.method === "POST") {
      const body = await request.json();
      if (body.token) await env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(body.token).run();
      return json({ ok: true });
    }

    // List users (admin only)
    if (path === "/api/auth/users" && request.method === "GET") {
      const token = url.searchParams.get("token");
      if (!await isAdmin(token, env.DB)) return json({ error: "unauthorized" }, 403);
      const { results } = await env.DB.prepare("SELECT id, username, role, permissions, created_at FROM users ORDER BY id").all();
      return json(results || []);
    }

    // Create user (admin only)
    if (path === "/api/auth/users" && request.method === "POST") {
      const body = await request.json();
      if (!await isAdmin(body.token, env.DB)) return json({ error: "unauthorized" }, 403);
      const username = sanitize(body.username, MAX_USERNAME_LEN);
      if (!username || username.length < 2) return json({ error: "invalid username" }, 400);
      const password = typeof body.password === "string" ? body.password : "";
      if (password.length < 6) return json({ error: "password too short (min 6)" }, 400);
      const role = body.role === "admin" ? "admin" : "editor";
      const perms = body.permissions === "all" ? "all" : (body.permissions || "media,navbar,pages,passwords");
      const hash = await sha256(password);
      try {
        await env.DB.prepare("INSERT INTO users (username, password_hash, role, permissions) VALUES (?, ?, ?, ?)").bind(username, hash, role, perms).run();
        return json({ ok: true });
      } catch (e) {
        if (e.message && e.message.includes("UNIQUE")) return json({ error: "username already exists" }, 409);
        return json({ error: "create failed" }, 500);
      }
    }

    // Delete user (admin only)
    if (path === "/api/auth/users/delete" && request.method === "POST") {
      const body = await request.json();
      if (!await isAdmin(body.token, env.DB)) return json({ error: "unauthorized" }, 403);
      const id = parseInt(body.id);
      if (!id || id <= 1) return json({ error: "cannot delete root admin" }, 400);
      await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(id).run();
      await env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(id).run();
      return json({ ok: true });
    }

    // Change password
    if (path === "/api/auth/password" && request.method === "POST") {
      const body = await request.json();
      if (!body.token || typeof body.token !== "string") return json({ error: "unauthorized" }, 401);
      const { results } = await env.DB.prepare(
        "SELECT u.id, u.password_hash FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ?"
      ).bind(body.token).all();
      if (!results || results.length === 0) return json({ error: "unauthorized" }, 401);
      const user = results[0];
      const oldHash = await sha256(body.oldPassword || "");
      if (oldHash !== user.password_hash) return json({ error: "wrong password" }, 401);
      const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
      if (newPassword.length < 6) return json({ error: "password too short" }, 400);
      const newHash = await sha256(newPassword);
      await env.DB.prepare("UPDATE users SET password_hash = ? WHERE id = ?").bind(newHash, user.id).run();
      return json({ ok: true });
    }

    // ═══════════════════════════════════════════════
    //  GITHUB API PROXY
    // ═══════════════════════════════════════════════
    if (path.startsWith("/api/") || path.startsWith("/raw/")) {
      const isRaw = path.startsWith("/raw/");
      const target = GH_API + path.replace(/^\/(api|raw)/, "") + url.search;
      const cache = caches.default;
      if (request.method === "GET") {
        const cacheKey = new Request(target, request);
        let cached = await cache.match(cacheKey);
        if (cached) return cached;
        const headers = { Authorization: "Bearer " + env.GITHUB_TOKEN, "Content-Type": "application/json", "User-Agent": "CSEL-Worker" };
        headers.Accept = isRaw ? "application/vnd.github.v3.raw" : "application/vnd.github.v3+json";
        let res = await fetch(target, { headers });
        res = new Response(res.body, res);
        res.headers.set("Cache-Control", "public, max-age=10");
        ctx.waitUntil(cache.put(cacheKey, res.clone()));
        return res;
      }
      const headers = { Authorization: "Bearer " + env.GITHUB_TOKEN, "Content-Type": "application/json", "User-Agent": "CSEL-Worker" };
      headers.Accept = "application/vnd.github.v3+json";
      return fetch(target, { method: request.method, headers, body: request.body });
    }

    // ═══════════════════════════════════════════════
    //  PAGE PASSWORD PROTECTION
    // ═══════════════════════════════════════════════
    var pagePath = path.replace(/\/$/, '');
    var cookie = request.headers.get('Cookie') || '';
    var passKey = 'pw_' + pagePath.replace(/\//g, '_');
    var passed = cookie.includes(passKey + '=1');

    if (request.method === 'POST' && pagePath !== '/admin' && !pagePath.startsWith('/admin') && !pagePath.startsWith('/assets')) {
      var body = await request.text();
      var formData = new URLSearchParams(body);
      var submittedPw = formData.get('password') || '';
      var cfgUrl = GH_API + '/repos/MEMZ-CHROER/dllHNWeb/contents/_passwords.json';
      var cfgRes = await fetch(cfgUrl, {
        headers: { Authorization: "Bearer " + env.GITHUB_TOKEN, Accept: "application/vnd.github.v3.raw", "User-Agent": "CSEL-Worker" },
      });
      if (cfgRes.ok) {
        var cfgText = await cfgRes.text();
        try {
          var cfg = JSON.parse(cfgText);
          if (cfg[pagePath] && cfg[pagePath] === submittedPw) {
            return new Response('', { status: 302, headers: { 'Set-Cookie': passKey + '=1; Path=/; Max-Age=86400; SameSite=Lax', 'Location': pagePath || '/', } });
          }
        } catch(e) {}
      }
      return new Response('密码错误', { status: 403 });
    }

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
