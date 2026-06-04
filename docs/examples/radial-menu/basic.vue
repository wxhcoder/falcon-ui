<template>
  <div class="radial-menu-demo-stage">
    <FlRadialMenu :items="items" center-label="Tools" @select="handleSelect" />
  </div>
</template>

<script setup lang="ts">
import { FlRadialMenu, type FlRadialMenuItem } from '../../../packages/components/radial-menu'

const items: FlRadialMenuItem[] = [
  { key: 'move', label: 'Move', icon: 'V', shortcut: 'V' },
  { key: 'frame', label: 'Frame', icon: '#', shortcut: 'F' },
  { key: 'pen', label: 'Pen', icon: 'P', shortcut: 'P' },
  { key: 'text', label: 'Text', icon: 'T', shortcut: 'T' }
]

const handleSelect = (item: FlRadialMenuItem) => {
  console.info('[radial-menu] selected', item.key)
}
</script>
