<template>
  <section class="vp-api-table">
    <div v-if="loading" class="vp-api-table__status">API 加载中...</div>
    <div v-else-if="errorMessage" class="vp-api-table__status vp-api-table__status--error">
      {{ errorMessage }}
    </div>
    <template v-else-if="meta">
      <table v-if="section === 'props'">
        <thead>
          <tr>
            <th>名称</th>
            <th>类型</th>
            <th>默认值</th>
            <th>必填</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in meta.props" :key="item.name">
            <td><code>{{ item.name }}</code></td>
            <td><code>{{ item.type }}</code></td>
            <td><code>{{ item.default }}</code></td>
            <td>{{ item.required ? '是' : '否' }}</td>
            <td>{{ item.description || '-' }}</td>
          </tr>
        </tbody>
      </table>

      <table v-else-if="section === 'events'">
        <thead>
          <tr>
            <th>名称</th>
            <th>签名</th>
            <th>类型</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in meta.events" :key="item.name">
            <td><code>{{ item.name }}</code></td>
            <td><code>{{ item.signature }}</code></td>
            <td><code>{{ item.type }}</code></td>
            <td>{{ item.description || '-' }}</td>
          </tr>
        </tbody>
      </table>

      <table v-else-if="section === 'slots'">
        <thead>
          <tr>
            <th>名称</th>
            <th>类型</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in meta.slots" :key="item.name">
            <td><code>{{ item.name }}</code></td>
            <td><code>{{ item.type }}</code></td>
            <td>{{ item.description || '-' }}</td>
          </tr>
        </tbody>
      </table>

      <table v-else>
        <thead>
          <tr>
            <th>名称</th>
            <th>类型</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="meta.exposes.length === 0">
            <td colspan="3">-</td>
          </tr>
          <tr v-for="item in meta.exposes" :key="item.name">
            <td><code>{{ item.name }}</code></td>
            <td><code>{{ item.type }}</code></td>
            <td>{{ item.description || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </template>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

type ApiMeta = {
  component: string
  description: string
  events: Array<{
    description: string
    name: string
    signature: string
    type: string
  }>
  exposes: Array<{
    description: string
    name: string
    type: string
  }>
  props: Array<{
    default: string
    description: string
    name: string
    required: boolean
    type: string
  }>
  slots: Array<{
    description: string
    name: string
    type: string
  }>
}

const props = withDefaults(
  defineProps<{
    section?: 'events' | 'exposes' | 'props' | 'slots'
    source: string
  }>(),
  {
    section: 'props'
  }
)

const loading = ref(false)
const errorMessage = ref('')
const meta = ref<ApiMeta | null>(null)

const loadMeta = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await fetch(props.source)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    meta.value = (await response.json()) as ApiMeta
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知错误'
    errorMessage.value = `API 数据读取失败：${message}`
    meta.value = null
  } finally {
    loading.value = false
  }
}

watch(
  () => props.source,
  () => {
    void loadMeta()
  }
)

onMounted(() => {
  void loadMeta()
})
</script>

<style scoped>
.vp-api-table {
  margin-top: 18px;
}

.vp-api-table__status {
  margin: 8px 0;
  color: var(--vp-c-text-2);
}

.vp-api-table__status--error {
  color: #d03050;
}

table code {
  white-space: pre-wrap;
}
</style>
