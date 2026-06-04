<template>
  <div class="radial-menu-demo-stage">
    <FlRadialMenu :items="items" center-label="Menu" more-mode="text-ellipsis" />
  </div>
</template>

<script setup lang="ts">
import { FlRadialMenu, type FlRadialMenuItem } from '../../../packages/components/radial-menu'

const items: FlRadialMenuItem[] = [
  { key: 'move', label: 'Move' },
  { key: 'frame', label: 'Frame' },
  { key: 'pen', label: 'Pen' },
  { key: 'text', label: 'Text' },
  { key: 'comment', label: 'Comment' },
  { key: 'objects', label: 'Objects' },
  { key: 'actions', label: 'Actions' },
  { key: 'settings', label: 'Settings' }
]
</script>
