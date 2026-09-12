<template>
  <div class="loading-size__grid">
    <div v-for="size in sizes" :key="size" class="loading-size__cell">
      <FlLoading
        animation="earth"
        :size="size"
        :text="`${size}px`"
        :theme="isDark ? 'dark' : 'light'"
        layout="vertical" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useData } from 'vitepress'
import { FlLoading } from '../../../../packages/components/loading'
import type { FlLoadingSize } from '../../../../packages/components/loading'

const { isDark } = useData()
const sizes: FlLoadingSize[] = [20, 32, 48, 64, 96]
</script>

<style scoped>
.loading-size__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-top: 1px solid var(--el-border-color);
  border-left: 1px solid var(--el-border-color);
  background: transparent;
}
.loading-size__cell {
  display: grid;
  place-items: center;
  min-width: 0;
  min-height: 160px;
  padding: 18px 12px;
  border-right: 1px solid var(--el-border-color);
  border-bottom: 1px solid var(--el-border-color);
  background: transparent;
}
@media (max-width: 767px) {
  .loading-size__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 479px) {
  .loading-size__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
