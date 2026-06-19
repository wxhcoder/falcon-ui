<template>
  <div class="demo-col">
    <div class="demo-actions">
      <FlButton @click="isError = !isError">
        {{ isError ? 'Disable error state' : 'Enable error state' }}
      </FlButton>
    </div>

    <FlSelect v-model="value" :is-error="isError" placeholder="Select approval status">
      <ElOption v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
    </FlSelect>

    <div class="demo-result">Error state:{{ isError ? 'On' : 'Off' }}</div>
    <div class="demo-result">Current value:{{ value || '(empty)' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isError = ref(false)
const value = ref('')
const options = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' }
]
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
