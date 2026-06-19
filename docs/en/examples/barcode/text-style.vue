<template>
  <div class="demo-stack">
    <section class="demo-card">
      <div class="demo-label">textPosition = top, textAlign = left</div>
      <FlBarcode
        text-align="left"
        text-position="top"
        :font-size="14"
        :text-margin="6"
        value="FALCON-STYLE-01" />
    </section>

    <section class="demo-card">
      <div class="demo-label">textPosition = bottom, textAlign = center</div>
      <FlBarcode
        font-options="bold"
        text-align="center"
        text-position="bottom"
        :font-size="18"
        :text-margin="4"
        value="FALCON-STYLE-02" />
    </section>

    <section class="demo-card">
      <div class="demo-label">textPosition = bottom, textAlign = right</div>
      <FlBarcode
        text-align="right"
        text-position="bottom"
        :font-size="16"
        :text-margin="8"
        value="FALCON-STYLE-03" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { FlBarcode } from '../../../../packages/components/barcode'
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
