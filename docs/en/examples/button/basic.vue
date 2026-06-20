<template>
  <div class="demo-row">
    <FlButton>Default Button</FlButton>
    <FlButton type="primary">Primary Button</FlButton>
    <FlButton type="success" plain>Plain Success</FlButton>
    <FlButton type="warning" round>Rounded Warning</FlButton>
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
