<template>
  <div class="text-shimmer-demo-row">
    <FlTextShimmer :disabled="disabled" text="Generating report" />
    <ElSwitch v-model="disabled" active-text="Static" inactive-text="Shimmer" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const disabled = ref(false)
</script>

<style scoped>
.text-shimmer-demo-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}
</style>
