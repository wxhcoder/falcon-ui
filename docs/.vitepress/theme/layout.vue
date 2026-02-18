<template>
  <Layout class="falcon-docs-layout">
    <template #nav-bar-title-before>
      <span class="falcon-docs-layout__mark" />
    </template>
  </Layout>
</template>

<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'

const { Layout } = DefaultTheme
</script>

<style scoped>
.falcon-docs-layout__mark {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 8px;
  border-radius: 999px;
  background: var(--vp-c-brand-1);
}
</style>
