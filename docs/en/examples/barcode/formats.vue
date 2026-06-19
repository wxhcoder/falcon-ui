<template>
  <div class="demo-grid">
    <section v-for="item in items" :key="item.label" class="demo-card">
      <div class="demo-label">{{ item.label }}</div>
      <FlBarcode :value="item.value" :format="item.format" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { FlBarcode } from '../../../../packages/components/barcode'

const items = [
  { label: 'CODE128', value: 'FALCON-128', format: 'CODE128' as const },
  { label: 'CODE39', value: 'FALCON-39', format: 'CODE39' as const },
  { label: 'EAN13', value: '590123412345', format: 'EAN13' as const },
  { label: 'EAN8', value: '9638507', format: 'EAN8' as const },
  { label: 'UPCA', value: '04210000526', format: 'UPCA' as const },
  { label: 'UPCE', value: '123456', format: 'UPCE' as const }
]
</script>

<style scoped>
.demo-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.demo-card {
  display: grid;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
}

.demo-label {
  color: var(--vp-c-text-2);
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
</style>
