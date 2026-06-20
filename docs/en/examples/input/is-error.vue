<template>
  <div class="demo-col">
    <div class="demo-actions">
      <FlButton @click="isError = !isError">
        {{ isError ? 'Disable error state' : 'Enable error state' }}
      </FlButton>
    </div>

    <FlInput
      v-model="value"
      :is-error="isError"
      placeholder="Type content and toggle error state; the value will be cleared" />

    <div class="demo-result">Error state:{{ isError ? 'On' : 'Off' }}</div>
    <div class="demo-result">Current value:{{ value || '(empty)' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const value = ref('')
const isError = ref(false)
</script>

<style scoped>
.demo-actions {
  display: flex;
}

.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
