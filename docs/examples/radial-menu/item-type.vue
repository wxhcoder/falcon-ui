<template>
  <div class="radial-menu-demo-stage">
    <FlRadialMenu :items="items" center-label="Brush" item-type="circle" @select="handleSelect" />
  </div>
</template>

<script setup lang="ts">
import { FlRadialMenu, type FlRadialMenuItem } from '../../../packages/components/radial-menu'

const items: FlRadialMenuItem[] = [
  { key: 'brush', label: 'Brush', icon: 'B', shortcut: 'B' },
  { key: 'eraser', label: 'Eraser', icon: 'E', shortcut: 'E' },
  { key: 'fill', label: 'Fill Color', icon: 'F', shortcut: 'F' },
  { key: 'picker', label: 'Color Picker', icon: 'I', shortcut: 'I' }
]

const handleSelect = (item: FlRadialMenuItem) => {
  console.info('[radial-menu] selected', item.key)
}
</script>
