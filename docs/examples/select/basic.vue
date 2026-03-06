<template>
  <div class="demo-col">
    <FlSelect v-model="value" placeholder="请选择城市">
      <ElOption
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value" />
    </FlSelect>
    <div class="demo-result">当前值：{{ value || '(空)' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const value = ref('')
const options = [
  { label: '上海', value: 'shanghai' },
  { label: '北京', value: 'beijing' },
  { label: '深圳', value: 'shenzhen' }
]
</script>

<style scoped>
.demo-col {
  display: grid;
  gap: 10px;
  max-width: 360px;
}

.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
