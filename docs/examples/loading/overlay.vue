<template>
  <div>
    <div class="loading-overlay__buttons">
      <button type="button" @click="pending = !pending">切换局部加载</button>
      <button type="button" @click="bodyPending = !bodyPending">切换 body 加载</button>
      <button type="button" @click="showFull">全屏加载 2 秒</button>
      <label
        >动画<select v-model="animation">
          <option value="earth">earth</option>
          <option value="searching">searching</option>
          <option value="solving">solving</option>
        </select></label
      >
    </div>
    <div class="loading-overlay__grid">
      <section v-loading="loading" :aria-busy="pending">
        <strong>全球订单</strong>
        <p>等待最新数据</p>
      </section>
      <section v-loading.body="bodyLoading" :aria-busy="bodyPending">
        <strong>后台任务</strong>
        <p>挂载到 body 的加载遮罩</p>
      </section>
      <section v-loading="pending" element-loading-background="transparent">
        <strong>默认 Loading</strong>
        <p>Element Plus 原生转圈</p>
      </section>
    </div>
    <span v-loading.fullscreen.lock="fullLoading" />
  </div>
</template>
<script setup lang="ts">
import { onScopeDispose, ref } from 'vue'
import { vLoading } from 'element-plus'
import { useData } from 'vitepress'
import { useFlLoading } from '../../../packages/components/loading'
import type { FlLoadingAnimation } from '../../../packages/components/loading'

const { isDark } = useData()
const pending = ref(false),
  bodyPending = ref(false),
  fullPending = ref(false)
const animation = ref<FlLoadingAnimation>('earth')
const loading = useFlLoading(pending, () => ({
  animation: animation.value,
  text: '正在查询…',
  theme: isDark.value ? 'dark' : 'light',
  background: 'transparent'
}))
const bodyLoading = useFlLoading(bodyPending, () => ({
  animation: 'working',
  text: '正在处理…',
  theme: isDark.value ? 'dark' : 'light',
  background: 'transparent'
}))
const fullLoading = useFlLoading(fullPending, () => ({
  animation: animation.value,
  text: '正在同步…',
  theme: isDark.value ? 'dark' : 'light',
  background: 'transparent'
}))
let timer: ReturnType<typeof setTimeout> | undefined
const showFull = () => {
  clearTimeout(timer)
  fullPending.value = true
  timer = setTimeout(() => {
    fullPending.value = false
  }, 2000)
}
onScopeDispose(() => clearTimeout(timer))
</script>
<style scoped>
.loading-overlay__buttons {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}
button,
select {
  padding: 6px 10px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  background: transparent;
  color: inherit;
  cursor: pointer;
}
.loading-overlay__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}
section {
  min-height: 200px;
  padding: 20px;
  border: 1px solid var(--el-border-color);
  background: transparent;
}
</style>
