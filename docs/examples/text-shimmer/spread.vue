<template>
  <div class="text-shimmer-demo-column">
    <FlTextShimmer :spread="1">同一段文字，spread 为 1</FlTextShimmer>
    <FlTextShimmer :spread="2">同一段文字，spread 为 2</FlTextShimmer>
    <FlTextShimmer :spread="4">同一段文字，spread 为 4</FlTextShimmer>
  </div>
</template>

<style scoped>
.text-shimmer-demo-column {
  display: grid;
  gap: 12px;
}
</style>
