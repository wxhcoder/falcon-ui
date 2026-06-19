<template>
  <div class="demo-col">
    <FlInput v-model="keyword" :prefix-icon="Search" placeholder="Prefix icon: search keyword" />
    <FlInput v-model="schedule" :suffix-icon="Calendar" placeholder="Suffix icon: enter a date" />
  </div>
</template>

<script setup lang="ts">
import { Calendar, Search } from '@element-plus/icons-vue'
import { ref } from 'vue'

const keyword = ref('')
const schedule = ref('')
</script>
