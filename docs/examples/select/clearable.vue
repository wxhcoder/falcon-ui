<template>
  <div class="demo-col">
    <FlSelect v-model="defaultClearableValue" placeholder="默认 clearable=true">
      <ElOption v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
    </FlSelect>

    <FlSelect v-model="disabledClearableValue" :clearable="false" placeholder="显式关闭 clearable">
      <ElOption v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
    </FlSelect>

    <div class="demo-result">
      默认可清空值：{{ defaultClearableValue || '(空)' }}，关闭可清空值：
      {{ disabledClearableValue || '(空)' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const defaultClearableValue = ref('hangzhou')
const disabledClearableValue = ref('nanjing')
const options = [
  { label: '杭州', value: 'hangzhou' },
  { label: '南京', value: 'nanjing' },
  { label: '苏州', value: 'suzhou' }
]
</script>

<style scoped>
.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
