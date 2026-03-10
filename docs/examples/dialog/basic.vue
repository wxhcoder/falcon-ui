<template>
  <div class="demo-col">
    <FlButton type="primary" @click="open = true">打开弹窗</FlButton>
    <div class="demo-result">确认次数：{{ confirmCount }}</div>
    <div class="demo-result">取消次数：{{ cancelCount }}</div>

    <FlDialog
      v-model="open"
      :body-height="220"
      title="FlDialog 示例"
      @cancel="cancelCount += 1"
      @confirm="confirmCount += 1">
      <p>这是 FlDialog 的默认内容区域。</p>
      <p>关闭时会自动销毁子内容（destroy-on-close）。</p>
    </FlDialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const open = ref(false)
const cancelCount = ref(0)
const confirmCount = ref(0)
</script>

<style scoped>
.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
