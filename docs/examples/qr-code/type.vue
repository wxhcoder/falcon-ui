<template>
  <div class="demo-col demo-row">
    <div class="demo-item">
      <FlQrCode value="https://falcon-ui.dev" type="canvas" />
      <div class="demo-label">canvas</div>
    </div>
    <div class="demo-item">
      <FlQrCode value="https://falcon-ui.dev" type="svg" />
      <div class="demo-label">svg</div>
    </div>
  </div>
</template>

<style scoped>
.demo-col {
  display: flex;
  align-items: center;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 24px;
}

.demo-item {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.demo-label {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
