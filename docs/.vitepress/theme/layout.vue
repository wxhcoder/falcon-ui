<template>
  <Layout class="falcon-docs-layout">
    <template #nav-bar-title-before>
      <span class="falcon-docs-layout__mark" />
    </template>
    <template #nav-bar-content-before>
      <div class="falcon-docs-layout__search-wrap">
        <VPNavBarSearch class="falcon-docs-layout__search" />
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import VPNavBarSearch from 'vitepress/dist/client/theme-default/components/VPNavBarSearch.vue'

const { Layout } = DefaultTheme
</script>

<style scoped>
.falcon-docs-layout :deep(.VPNavBar:not(.home)),
.falcon-docs-layout :deep(.VPNavBar:not(.home) .title),
.falcon-docs-layout :deep(.VPNavBar:not(.home) .content-body),
.falcon-docs-layout :deep(.VPLocalNav) {
  background-color: var(--vp-nav-bg-color);
}

.falcon-docs-layout :deep(.VPNavBar .content-body > .search) {
  display: none;
}

.falcon-docs-layout__search-wrap {
  display: flex;
  align-items: center;
  margin-right: 12px;
}

.falcon-docs-layout__search {
  min-width: 180px;
}

@media (max-width: 767px) {
  .falcon-docs-layout__search-wrap {
    margin-right: 0;
  }

  .falcon-docs-layout__search {
    min-width: 0;
  }
}

.falcon-docs-layout__mark {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 8px;
  border-radius: 999px;
  background: var(--vp-c-brand-1);
}
</style>
