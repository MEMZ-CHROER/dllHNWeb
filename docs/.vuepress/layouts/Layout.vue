<script setup>
import ParentLayout from '@vuepress/theme-default/layouts/Layout.vue'
</script>

<template>
  <ParentLayout>
    <!-- 页面底部插入全站 footer -->
    <template #page-bottom>
      <footer class="csel-footer">
        <p>Built with ❤️ by CSEL Team · 托管于 GitHub Pages</p>
        <p><a href="/admin/">后台管理</a></p>
      </footer>
    </template>
  </ParentLayout>
</template>
