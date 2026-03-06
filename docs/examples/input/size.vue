<template>
  <div class="demo-col">
    <FlInput v-model="smallValue" size="small" placeholder="small 小尺寸" />
    <FlInput v-model="defaultValue" placeholder="default 默认尺寸" />
    <FlInput v-model="largeValue" size="large" placeholder="large 大尺寸" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const smallValue = ref('')
const defaultValue = ref('')
const largeValue = ref('')
</script>
