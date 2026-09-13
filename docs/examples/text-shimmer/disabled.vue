<template>
  <div class="text-shimmer-demo-row">
    <FlTextShimmer :disabled="disabled" text="正在生成报告" />
    <ElSwitch v-model="disabled" active-text="静态" inactive-text="扫光" />
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
