<template>
  <div class="demo-col">
    <FlInput v-model="smallValue" size="small" placeholder="small size" />
    <FlInput v-model="defaultValue" placeholder="default size" />
    <FlInput v-model="largeValue" size="large" placeholder="large size" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const smallValue = ref('')
const defaultValue = ref('')
const largeValue = ref('')
</script>
