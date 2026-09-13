<template>
  <div class="text-shimmer-demo-column">
    <FlTextShimmer :duration="1">1 秒扫过</FlTextShimmer>
    <FlTextShimmer :duration="2">2 秒扫过</FlTextShimmer>
    <FlTextShimmer :duration="4">4 秒扫过</FlTextShimmer>
  </div>
</template>

<style scoped>
.text-shimmer-demo-column {
  display: grid;
  gap: 12px;
}
</style>
