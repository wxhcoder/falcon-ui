<template>
  <div class="demo-row">
    <FlButton>默认按钮</FlButton>
    <FlButton type="primary">主要按钮</FlButton>
    <FlButton type="success" plain>成功朴素</FlButton>
    <FlButton type="warning" round>警告圆角</FlButton>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
