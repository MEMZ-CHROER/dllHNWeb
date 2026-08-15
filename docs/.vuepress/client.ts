import { defineClientConfig } from 'vuepress/client'
import Layout from './layouts/Layout.vue'

export default defineClientConfig({
  // 覆写默认 Layout：在 #page-bottom 插槽加全站 footer
  layouts: {
    Layout,
  },

  enhance({ router }) {
    // 注册无后缀别名路由：
    // - /csel-mod.html  → /csel-mod（navbar/内容链接用无后缀形式）
    // - /hacknet/       → /hacknet（目录页）
    // 这样 SPA 客户端导航不整页刷新，地址栏保持无后缀 URL。
    const routes = [...router.getRoutes()]
    for (const route of routes) {
      let clean: string | null = null
      if (route.path.endsWith('.html')) {
        clean = route.path.slice(0, -5)
      } else if (route.path.length > 1 && route.path.endsWith('/')) {
        clean = route.path.slice(0, -1)
      }
      if (clean && clean !== route.path && !router.hasRoute(clean)) {
        router.addRoute({
          path: clean,
          name: 'clean:' + route.path,
          components: route.components,
          meta: route.meta,
        })
      }
    }
  },
})
