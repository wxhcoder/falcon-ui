<template>
  <div>
    <div class="loading-overlay__buttons">
      <button type="button" @click="pending = !pending">Toggle local loading</button>
      <button type="button" @click="bodyPending = !bodyPending">Toggle body loading</button>
      <button type="button" @click="showFull">Fullscreen for 2 seconds</button>
      <label
        >Animation<select v-model="animation">
          <option value="earth">earth</option>
          <option value="searching">searching</option>
          <option value="solving">solving</option>
        </select></label
      >
    </div>
    <div class="loading-overlay__grid">
      <section v-loading="loading" :aria-busy="pending">
        <strong>Global orders</strong>
        <p>Waiting for new data</p>
      </section>
      <section v-loading.body="bodyLoading" :aria-busy="bodyPending">
        <strong>Background tasks</strong>
        <p>Loading mask attached to body</p>
      </section>
      <section v-loading="pending" element-loading-background="transparent">
        <strong>Default Loading</strong>
        <p>Original Element Plus spinner</p>
      </section>
    </div>
    <span v-loading.fullscreen.lock="fullLoading" />
  </div>
</template>
<script setup lang="ts">
import { onScopeDispose, ref } from 'vue'
import { vLoading } from 'element-plus'
import { useData } from 'vitepress'
import { useFlLoading } from '../../../../packages/components/loading'
import type { FlLoadingAnimation } from '../../../../packages/components/loading'

const { isDark } = useData()
const pending = ref(false),
  bodyPending = ref(false),
  fullPending = ref(false)
const animation = ref<FlLoadingAnimation>('earth')
const loading = useFlLoading(pending, () => ({
  animation: animation.value,
  text: 'Searching…',
  theme: isDark.value ? 'dark' : 'light',
  background: 'transparent'
}))
const bodyLoading = useFlLoading(bodyPending, () => ({
  animation: 'working',
  text: 'Working…',
  theme: isDark.value ? 'dark' : 'light',
  background: 'transparent'
}))
const fullLoading = useFlLoading(fullPending, () => ({
  animation: animation.value,
  text: 'Synchronizing…',
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
