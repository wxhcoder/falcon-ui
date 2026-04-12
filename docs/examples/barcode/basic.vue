<template>
  <div class="demo-col">
    <FlBarcode value="FALCON-128" />
  </div>
</template>

<script setup lang="ts">
import { FlBarcode } from '../../../packages/components/barcode'
</script>

<style scoped>
.demo-col {
  display: grid;
  gap: 12px;
  justify-items: start;
}
</style>
