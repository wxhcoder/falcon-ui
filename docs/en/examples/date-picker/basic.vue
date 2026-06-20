<template>
  <div class="demo-col">
    <FlDatePicker
      v-model="value"
      type="date"
      value-format="YYYY-MM-DD"
      placeholder="Select a date" />
    <div class="demo-result">Current value:{{ value ?? '(null)' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const value = ref<string | null>(null)
</script>

<style scoped>
.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
