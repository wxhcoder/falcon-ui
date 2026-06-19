<template>
  <div class="demo-col">
    <FlSelect v-model="defaultClearableValue" placeholder="Default clearable=true">
      <ElOption v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
    </FlSelect>

    <FlSelect
      v-model="disabledClearableValue"
      :clearable="false"
      placeholder="Explicitly disable clearable">
      <ElOption v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
    </FlSelect>

    <div class="demo-result">
      Default clearable value:{{ defaultClearableValue || '(empty)' }},Disabled clearable value:
      {{ disabledClearableValue || '(empty)' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const defaultClearableValue = ref('hangzhou')
const disabledClearableValue = ref('nanjing')
const options = [
  { label: 'Hangzhou', value: 'hangzhou' },
  { label: 'Nanjing', value: 'nanjing' },
  { label: 'Suzhou', value: 'suzhou' }
]
</script>

<style scoped>
.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
