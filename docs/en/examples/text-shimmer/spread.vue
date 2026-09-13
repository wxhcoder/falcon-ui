<template>
  <div class="text-shimmer-demo-column">
    <FlTextShimmer :spread="1">The same text with spread 1</FlTextShimmer>
    <FlTextShimmer :spread="2">The same text with spread 2</FlTextShimmer>
    <FlTextShimmer :spread="4">The same text with spread 4</FlTextShimmer>
  </div>
</template>

<style scoped>
.text-shimmer-demo-column {
  display: grid;
  gap: 12px;
}
</style>
