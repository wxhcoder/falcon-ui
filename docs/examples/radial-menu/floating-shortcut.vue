<template>
  <div class="radial-menu-shortcut-demo">
    <p>Move the mouse inside this area, then press Alt + W.</p>
    <FlRadialMenu mode="floating" shortcut="Alt+W" :items="items" center-label="+" />
  </div>
</template>

<script setup lang="ts">
import { FlRadialMenu, type FlRadialMenuItem } from '../../../packages/components/radial-menu'

const items: FlRadialMenuItem[] = [
  { key: 'move', label: 'Move Tool', shortcut: 'V' },
  { key: 'pen', label: 'Pen Tool', shortcut: 'P' },
  { key: 'text', label: 'Text', shortcut: 'T' }
]
</script>

<style scoped>
.radial-menu-shortcut-demo {
  min-height: 240px;
  padding: 24px;
  border: 1px dashed var(--el-border-color);
}
</style>
