<template>
  <div class="demo-grid">
    <section class="demo-card">
      <div class="demo-label">compact</div>
      <FlBarcode background-color="#ffffff" color="#111827" :height="72" value="FALCON-A" />
    </section>

    <section class="demo-card demo-card--accent">
      <div class="demo-label">accent background</div>
      <FlBarcode
        background-color="#0f172a"
        color="#f8fafc"
        :height="88"
        :width="3"
        value="FALCON-B" />
    </section>

    <section class="demo-card">
      <div class="demo-label">wide barcode</div>
      <FlBarcode
        background-color="#f3f4f6"
        color="#dc2626"
        :height="120"
        :width="4"
        value="FALCON-C" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { FlBarcode } from '../../../../packages/components/barcode'
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
}

.demo-card--accent {
  background: linear-gradient(180deg, #111827 0%, #1f2937 100%);
}

.demo-card--accent .demo-label {
  color: rgba(255, 255, 255, 0.75);
}

.demo-label {
  color: var(--vp-c-text-2);
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
</style>
