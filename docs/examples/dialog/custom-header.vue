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
.demo-col {
  display: grid;
  gap: 10px;
}

.header-slot {
  align-items: center;
  display: inline-flex;
  gap: 8px;
}

.header-title {
  font-weight: 600;
}

.header-tag {
  background: #eef4ff;
  border-radius: 999px;
  color: #1d4ed8;
  font-size: 12px;
  line-height: 1;
  padding: 4px 8px;
}
</style>
