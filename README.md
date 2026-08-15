# DllHN / CSEL 项目网站

基于 **VuePress 2 + Vite** 的静态站点，部署到 GitHub Pages + Cloudflare Worker。

## 本地开发

```bash
# 安装依赖
yarn install

# 开发（HMR，改 md 保存即热更新）
yarn dev
# 打开 http://localhost:8080

# 构建（产物在 docs/.vuepress/dist/）
yarn build
```

## 目录结构

```
├─ docs/                  VuePress 内容
│  ├─ .vuepress/
│  │  ├─ config.ts        VuePress 配置（读取三个 JSON）
│  │  ├─ config.json      站点设置（admin 后台可编辑）
│  │  ├─ navbar.json      导航栏（admin 后台可编辑）
│  │  ├─ theme.json       主题色 6 变量（admin 后台可编辑）
│  │  ├─ client.ts        无后缀别名路由
│  │  ├─ layouts/         自定义 Layout（footer）
│  │  ├─ styles/          深色黑客主题样式
│  │  └─ public/          构建时复制进产物（CNAME / admin / sitemap / 媒体）
│  ├─ index.md            首页
│  ├─ hacknet/            Hacknet 百科
│  └─ programming/        编程知识
├─ worker.js              Cloudflare Worker（OAuth / API 代理 / 页面密码 / URL 重写）
├─ wrangler.toml          Worker 配置
└─ .github/workflows/     deploy.yml（VuePress 构建 + GitHub Pages 部署）
```

## 在线管理

访问 `https://hn.liuxiyu.cn/admin/`，登录后台后可管理页面、导航栏、主题配色、页面密码。

## 部署

- **内容站**：推送到 `master` 分支 → GitHub Actions 构建 VuePress 产物 → Pages artifact 部署
- **Worker**：修改后 `npx wrangler@latest deploy` 重新发布
