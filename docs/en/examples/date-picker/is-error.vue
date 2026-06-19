<template>
  <div class="demo-col">
    <div class="demo-actions">
      <FlButton @click="isError = !isError">
        {{ isError ? 'Disable error state' : 'Enable error state' }}
      </FlButton>
    </div>

    <FlDatePicker
      v-model="value"
      :is-error="isError"
      type="date"
      value-format="YYYY-MM-DD"
      placeholder="TextError state,Text" />

    <div class="demo-result">Error state:{{ isError ? 'On' : 'Off' }}</div>
    <div class="demo-result">Current value:{{ value ?? '(null)' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const value = ref<string | null>(null)
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
