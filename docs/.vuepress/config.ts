import { defineUserConfig } from 'vuepress'
import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'
import { searchPlugin } from '@vuepress/plugin-search'
import { markdownChartPlugin } from '@vuepress/plugin-markdown-chart'
import markdownItKatex from 'markdown-it-katex'
import site from './config.json'
import navbar from './navbar.json'
import themeColors from './theme.json'

// 深色黑客主题 6 个 CSS 变量，来自 theme.json（admin 样式编辑器编辑此文件）
const rootCss = `:root{
  --bg:${themeColors.bg};--fg:${themeColors.fg};--accent:${themeColors.accent};
  --accent2:${themeColors.accent2};--border:${themeColors.border};--card-bg:${themeColors.cardBg};
}`

export default defineUserConfig({
  // base 必须为 '/'：自定义域名根路径；github.io 项目页前缀由 Cloudflare Worker 反代补齐
  base: '/',
  lang: 'zh-CN',
  title: site.title,
  description: site.description,
  bundler: viteBundler(),
  theme: defaultTheme({
    navbar,
    siteTitle: '[CSEL]',
    sidebar: false,
  }),

  plugins: [
    // 本地全文搜索（navbar 搜索框）
    searchPlugin({
      locales: {
        '/': { placeholder: '搜索' },
      },
    }),
    // Mermaid 流程图 / 图表（```mermaid 代码块）
    markdownChartPlugin({
      mermaid: true,
    }),
  ],

  // KaTeX 数学公式（$...$ 与 $$...$$）
  extendsMarkdown: (md) => {
    md.use(markdownItKatex)
  },

  head: [
    ['style', {}, rootCss],
    [
      'link',
      { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css' },
    ],
  ],
})
