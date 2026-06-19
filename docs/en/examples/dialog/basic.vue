<template>
  <div class="demo-col">
    <FlButton type="primary" @click="open = true">Open dialog</FlButton>
    <div class="demo-result">Confirm count:{{ confirmCount }}</div>
    <div class="demo-result">Cancel count:{{ cancelCount }}</div>

    <FlDialog
      v-model="open"
      :body-height="220"
      title="FlDialog example"
      @cancel="cancelCount += 1"
      @confirm="confirmCount += 1">
      <p>This is the default content area of FlDialog.</p>
      <p>Child content is destroyed automatically on close (destroy-on-close).</p>
    </FlDialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const open = ref(false)
const cancelCount = ref(0)
const confirmCount = ref(0)
</script>

<style scoped>
.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
