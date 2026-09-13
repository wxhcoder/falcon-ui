<template>
  <div class="text-shimmer-color-grid">
    <FlTextShimmer class="inherited-color">继承父级蓝色</FlTextShimmer>
    <FlTextShimmer color="#64748b" shimmer-color="#0ea5e9">自定义扫光颜色</FlTextShimmer>
    <div class="dark-surface">
      <FlTextShimmer>深色背景中的状态</FlTextShimmer>
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
