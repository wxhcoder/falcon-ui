<template>
  <div class="demo-col">
    <FlInput v-model="value" clearable placeholder="Type and click the clear button on the right" />
    <div class="demo-result">Current value:{{ value || '(empty)' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const value = ref('')
</script>

<style scoped>
.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
