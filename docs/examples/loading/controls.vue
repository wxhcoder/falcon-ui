<template>
  <div class="loading-controls">
    <div class="loading-controls__preview">
      <FlLoading
        :animation="animation"
        :size="size"
        :speed="speed"
        :paused="paused"
        :active="active"
        :color="customColor ? color : ''"
        :theme="isDark ? 'dark' : 'light'"
        :text="text"
        :layout="layout" />
    </div>
    <div class="loading-controls__form">
      <label
        >动画<select v-model="animation">
          <option v-for="item in animations" :key="item">{{ item }}</option>
        </select></label
      >
      <label
        >尺寸<select v-model.number="size">
          <option v-for="item in sizes" :key="item" :value="item">{{ item }}px</option>
        </select></label
      >
      <label
        >速度 {{ speed }}×<input v-model.number="speed" type="range" min="0.25" max="3" step="0.25"
      /></label>
      <label>文字<input v-model="text" type="text" /></label>
      <label
        >布局<select v-model="layout">
          <option value="inline">同行</option>
          <option value="vertical">上下</option>
        </select></label
      >
      <label><input v-model="paused" type="checkbox" />暂停</label>
      <label><input v-model="active" type="checkbox" />显示</label>
      <label
        ><input v-model="customColor" type="checkbox" />自定义颜色<input
          v-model="color"
          type="color"
      /></label>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useData } from 'vitepress'
import { FlLoading } from '../../../packages/components/loading'
import type {
  FlLoadingAnimation,
  FlLoadingLayout,
  FlLoadingSize
} from '../../../packages/components/loading'
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
const sizes: FlLoadingSize[] = [20, 32, 48, 64, 96]
const animation = ref<FlLoadingAnimation>('earth')
const size = ref<FlLoadingSize>(96)
const layout = ref<FlLoadingLayout>('inline')
const speed = ref(1),
  paused = ref(false),
  active = ref(true)
const customColor = ref(false),
  color = ref('#409eff'),
  text = ref('正在同步全球数据…')
</script>
<style scoped>
.loading-controls__preview {
  display: grid;
  place-items: center;
  min-height: 200px;
  border: 1px solid var(--el-border-color);
  background: transparent;
}
.loading-controls__form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 20px;
}
.loading-controls__form label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
.loading-controls__form select,
.loading-controls__form input[type='text'] {
  border: 1px solid var(--el-border-color);
  border-radius: 5px;
  padding: 4px 8px;
  background: transparent;
  color: inherit;
}
</style>
