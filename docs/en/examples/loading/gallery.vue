<template>
  <div class="loading-gallery">
    <div class="loading-gallery__grid">
      <div v-for="animation in animations" :key="animation" class="loading-gallery__cell">
        <FlLoading
          :animation="animation"
          :paused="paused"
          :text="animation"
          :theme="isDark ? 'dark' : 'light'"
          layout="vertical" />
      </div>
    </div>
    <label class="loading-gallery__pause"
      ><input v-model="paused" type="checkbox" />Pause animations</label
    >
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useData } from 'vitepress'
import { FlLoading } from '../../../../packages/components/loading'
import type { FlLoadingAnimation } from '../../../../packages/components/loading'

const { isDark } = useData()
const animations: FlLoadingAnimation[] = [
  'working',
  'searching',
  'solving',
  'listening',
  'composing',
  'shaping',
  'earth'
]
const paused = ref(false)
</script>
<style scoped>
.loading-gallery__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-top: 1px solid var(--el-border-color);
  border-left: 1px solid var(--el-border-color);
  background: transparent;
}
.loading-gallery__cell {
  display: grid;
  place-items: center;
  min-width: 0;
  min-height: 140px;
  padding: 18px 12px;
  border-right: 1px solid var(--el-border-color);
  border-bottom: 1px solid var(--el-border-color);
  background: transparent;
}
.loading-gallery__pause {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  margin-top: 16px;
}
@media (max-width: 767px) {
  .loading-gallery__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 479px) {
  .loading-gallery__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
