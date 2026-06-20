<template>
  <div class="demo-col">
    <FlSelect v-model="value" placeholder="Select city">
      <ElOption v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
    </FlSelect>
    <div class="demo-result">Current value:{{ value || '(empty)' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const value = ref('')
const options = [
  { label: 'Shanghai', value: 'shanghai' },
  { label: 'Beijing', value: 'beijing' },
  { label: 'Shenzhen', value: 'shenzhen' }
]
</script>

<style scoped>
.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
