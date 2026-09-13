<template>
  <div class="text-shimmer-color-grid">
    <FlTextShimmer class="inherited-color">Inherited blue text</FlTextShimmer>
    <FlTextShimmer color="#64748b" shimmer-color="#0ea5e9">Custom shimmer colors</FlTextShimmer>
  </div>
</template>

<style scoped>
.text-shimmer-color-grid {
  display: grid;
  gap: 16px;
}

.inherited-color {
  color: #2563eb;
}
</style>
