<template>
  <div class="radial-menu-controlled-demo">
    <button type="button" @click="opened = !opened">Toggle</button>
    <FlRadialMenu v-model="opened" trigger="manual" :items="items" center-label="Manual" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FlRadialMenu, type FlRadialMenuItem } from '../../../packages/components/radial-menu'

const opened = ref(false)
const items: FlRadialMenuItem[] = [
  { key: 'first', label: 'First' },
  { key: 'second', label: 'Second' },
  { key: 'third', label: 'Third' }
]
</script>

<style scoped>
.radial-menu-controlled-demo {
  display: flex;
  align-items: center;
  gap: 24px;
}
</style>
