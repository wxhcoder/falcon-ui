<template>
  <section class="vp-api-table">
    <div v-if="loading" class="vp-api-table__status">{{ texts.loading }}</div>
    <div v-else-if="errorMessage" class="vp-api-table__status vp-api-table__status--error">
      {{ errorMessage }}
    </div>
    <template v-else-if="meta">
      <table v-if="section === 'props'">
        <thead>
          <tr>
            <th>{{ texts.name }}</th>
            <th>{{ texts.type }}</th>
            <th>{{ texts.default }}</th>
            <th>{{ texts.required }}</th>
            <th>{{ texts.description }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in meta.props" :key="item.name">
            <td>
              <code>{{ item.name }}</code>
            </td>
            <td>
              <code>{{ item.type }}</code>
            </td>
            <td>
              <code>{{ item.default }}</code>
            </td>
            <td>{{ item.required ? texts.yes : texts.no }}</td>
            <td>{{ item.description || '-' }}</td>
          </tr>
        </tbody>
      </table>

      <table v-else-if="section === 'events'">
        <thead>
          <tr>
            <th>{{ texts.name }}</th>
            <th>{{ texts.signature }}</th>
            <th>{{ texts.type }}</th>
            <th>{{ texts.description }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in meta.events" :key="item.name">
            <td>
              <code>{{ item.name }}</code>
            </td>
            <td>
              <code>{{ item.signature }}</code>
            </td>
            <td>
              <code>{{ item.type }}</code>
            </td>
            <td>{{ item.description || '-' }}</td>
          </tr>
        </tbody>
      </table>

      <table v-else-if="section === 'slots'">
        <thead>
          <tr>
            <th>{{ texts.name }}</th>
            <th>{{ texts.type }}</th>
            <th>{{ texts.description }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in meta.slots" :key="item.name">
            <td>
              <code>{{ item.name }}</code>
            </td>
            <td>
              <code>{{ item.type }}</code>
            </td>
            <td>{{ item.description || '-' }}</td>
          </tr>
        </tbody>
      </table>

      <table v-else>
        <thead>
          <tr>
            <th>{{ texts.name }}</th>
            <th>{{ texts.type }}</th>
            <th>{{ texts.description }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="meta.exposes.length === 0">
            <td colspan="3">-</td>
          </tr>
          <tr v-for="item in meta.exposes" :key="item.name">
            <td>
              <code>{{ item.name }}</code>
            </td>
            <td>
              <code>{{ item.type }}</code>
            </td>
            <td>{{ item.description || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useData, withBase } from 'vitepress'

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
const { localeIndex } = useData()

const isEnglish = computed(() => localeIndex.value === 'en')
const texts = computed(() =>
  isEnglish.value
    ? {
        default: 'Default',
        description: 'Description',
        loading: 'Loading API...',
        name: 'Name',
        no: 'No',
        required: 'Required',
        signature: 'Signature',
        type: 'Type',
        unknownError: 'Unknown error',
        yes: 'Yes'
      }
    : {
        default: '默认值',
        description: '说明',
        loading: 'API 加载中...',
        name: '名称',
        no: '否',
        required: '必填',
        signature: '签名',
        type: '类型',
        unknownError: '未知错误',
        yes: '是'
      }
)

const localizedSource = computed(() => {
  if (!isEnglish.value || !props.source.startsWith('/api-meta/')) {
    return props.source
  }

  return `/en${props.source}`
})

const loadMeta = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await fetch(withBase(localizedSource.value))
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    meta.value = (await response.json()) as ApiMeta
  } catch (error) {
    const message = error instanceof Error ? error.message : texts.value.unknownError
    errorMessage.value = isEnglish.value
      ? `Failed to load API data: ${message}`
      : `API 数据读取失败：${message}`
    meta.value = null
  } finally {
    loading.value = false
  }
}

watch(localizedSource, () => {
  void loadMeta()
})

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
