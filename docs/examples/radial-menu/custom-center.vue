<template>
  <div class="radial-menu-demo-stage">
    <FlRadialMenu :items="items">
      <template #center>
        <span class="radial-menu-custom-center">⌘</span>
      </template>
    </FlRadialMenu>
  </div>
</template>

<script setup lang="ts">
import { FlRadialMenu, type FlRadialMenuItem } from '../../../packages/components/radial-menu'

const items: FlRadialMenuItem[] = [
  { key: 'copy', label: 'Copy' },
  { key: 'paste', label: 'Paste' },
  { key: 'delete', label: 'Delete', disabled: true }
]
</script>

<style scoped>
.radial-menu-custom-center {
  font-size: 20px;
}
</style>
