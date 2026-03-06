<template>
  <div class="demo-col">
    <FlDatePicker v-model="value" type="date" value-format="YYYY-MM-DD" placeholder="请选择日期" />
    <div class="demo-result">当前值：{{ value ?? '(null)' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const value = ref<string | null>(null)
</script>

<style scoped>
.demo-col {
  width: 100%;
  display: grid;
  gap: 10px;
}

.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
