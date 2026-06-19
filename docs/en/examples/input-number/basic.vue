<template>
  <div class="demo-col">
    <FlInputNumber v-model="value" placeholder="Enter a number" />
    <div class="demo-result">Current value:{{ value ?? '(null)' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const value = ref<number | null>(null)
</script>

<style scoped>
.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
