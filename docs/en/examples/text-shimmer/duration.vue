<template>
  <div class="text-shimmer-demo-column">
    <FlTextShimmer :duration="1">One-second pass</FlTextShimmer>
    <FlTextShimmer :duration="2">Two-second pass</FlTextShimmer>
    <FlTextShimmer :duration="4">Four-second pass</FlTextShimmer>
  </div>
</template>

<style scoped>
.text-shimmer-demo-column {
  display: grid;
  gap: 12px;
}
</style>
