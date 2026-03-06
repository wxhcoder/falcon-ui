<template>
  <div class="demo-col">
    <FlInput v-model="keyword" :prefix-icon="Search" placeholder="前缀图标：搜索关键词" />
    <FlInput v-model="schedule" :suffix-icon="Calendar" placeholder="后缀图标：填写日期" />
  </div>
</template>

<script setup lang="ts">
import { Calendar, Search } from '@element-plus/icons-vue'
import { ref } from 'vue'

const keyword = ref('')
const schedule = ref('')
</script>

<style scoped>
.demo-col {
  width: 100%;
  display: grid;
  gap: 10px;
}
</style>
