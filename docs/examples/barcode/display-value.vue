<template>
  <div class="demo-stack">
    <section class="demo-card">
      <div class="demo-label">displayValue = false</div>
      <FlBarcode :display-value="false" value="590123412345" />
    </section>

    <section class="demo-card">
      <div class="demo-label">custom text</div>
      <FlBarcode text="SKU-0001" value="590123412345" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { FlBarcode } from '../../../packages/components/barcode'
</script>

<style scoped>
.demo-stack {
  display: grid;
  gap: 16px;
}

.demo-card {
  display: grid;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
}

.demo-label {
  color: var(--vp-c-text-2);
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
</style>
