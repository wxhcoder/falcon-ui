<template>
  <div class="radial-menu-demo-stage">
    <FlRadialMenu center-label="Menu" more-mode="text-ellipsis">
      <FlRadialMenuItem
        v-for="item in items"
        :key="item.index"
        :index="item.index"
        :label="item.label" />
    </FlRadialMenu>
  </div>
</template>

<script setup lang="ts">
import { FlRadialMenu, FlRadialMenuItem } from '../../../packages/components/radial-menu'
import type { FlRadialMenuItemData as RadialMenuItem } from '../../../packages/components/radial-menu'

const items: RadialMenuItem[] = [
  { index: 'move', label: 'Move' },
  { index: 'frame', label: 'Frame' },
  { index: 'pen', label: 'Pen' },
  { index: 'text', label: 'Text' },
  { index: 'comment', label: 'Comment' },
  { index: 'objects', label: 'Objects' },
  { index: 'actions', label: 'Actions' },
  { index: 'settings', label: 'Settings' }
]
</script>
