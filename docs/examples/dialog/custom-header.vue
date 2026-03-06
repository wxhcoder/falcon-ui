<template>
  <div class="demo-col">
    <FlButton type="primary" @click="open = true">Open with custom header</FlButton>

    <FlDialog v-model="open" :body-height="220" @confirm="open = false">
      <template #header>
        <div class="header-slot">
          <span class="header-title">Order Review</span>
          <span class="header-tag">Draft</span>
        </div>
      </template>

      <p>Header content is provided by the `header` slot.</p>
      <p>Built-in fullscreen and close actions remain on the right side.</p>
    </FlDialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const open = ref(false)
</script>

<style scoped>

.header-slot {
  align-items: center;
  display: inline-flex;
  gap: 8px;
}

.header-title {
  font-weight: 600;
}

.header-tag {
  background: #f4d9a3;
  border-radius: 999px;
  color: #df4e04;
  font-size: 12px;
  line-height: 1;
  padding: 4px 8px;
}
</style>
