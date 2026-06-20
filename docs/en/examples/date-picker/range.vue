<template>
  <div class="demo-col">
    <FlDatePicker
      v-model="rangeValue"
      type="daterange"
      unlink-panels
      value-format="YYYY-MM-DD"
      start-placeholder="Start date"
      end-placeholder="End date" />
    <div class="demo-result">
      Current value:{{ rangeValue ? rangeValue.join(' ~ ') : '(null)' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const rangeValue = ref<[string, string] | null>(null)
</script>

<style scoped>
.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
