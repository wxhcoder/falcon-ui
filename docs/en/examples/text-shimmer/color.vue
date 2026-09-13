<template>
  <div class="text-shimmer-color-grid">
    <FlTextShimmer class="inherited-color">Inherited blue text</FlTextShimmer>
    <FlTextShimmer color="#64748b" shimmer-color="#0ea5e9">Custom shimmer colors</FlTextShimmer>
    <div class="dark-surface">
      <FlTextShimmer>Status on a dark surface</FlTextShimmer>
    </div>
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

.dark-surface {
  padding: 14px 18px;
  border-radius: 8px;
  color: #f8fafc;
  background: #0f172a;
}
</style>
