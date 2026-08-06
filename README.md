# DllHN / CSEL 项目网站

基于 GitHub Pages + Jekyll + Decap CMS 的静态站点。

## 在线编辑

访问 `https://你的域名/admin/`，用 GitHub 账号登录后即可在线写文章。

## 本地开发

```bash
# 预览
jekyll serve
# 浏览器打开 http://localhost:4000
```

## 目录结构

```
├─ index.md              主页
├─ csel-mod.md           CSEL Mod
├─ _config.yml           Jekyll 配置
├─ _layouts/default.html 页面模板
├─ assets/css/style.css  样式
└─ admin/                Decap CMS 后台
    ├─ index.html
    └─ config.yml
```
