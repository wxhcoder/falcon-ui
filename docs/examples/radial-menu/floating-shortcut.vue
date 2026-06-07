<template>
  <div class="radial-menu-demo-stage radial-menu-shortcut-demo">
    <p>Press Alt + W.</p>
    <FlRadialMenu mode="floating" shortcut="Alt+W" center-label="+">
      <FlRadialMenuItem
        v-for="item in items"
        :key="item.index"
        :index="item.index"
        :label="item.label"
        :shortcut="item.shortcut" />
    </FlRadialMenu>
  </div>
</template>

<script setup lang="ts">
import { FlRadialMenu, FlRadialMenuItem } from '../../../packages/components/radial-menu'
import type { FlRadialMenuItemData as RadialMenuItem } from '../../../packages/components/radial-menu'

const items: RadialMenuItem[] = [
  { index: 'move', label: 'Move Tool', shortcut: 'V' },
  { index: 'pen', label: 'Pen Tool', shortcut: 'P' },
  { index: 'text', label: 'Text', shortcut: 'T' }
]
</script>

<style scoped>
.radial-menu-shortcut-demo {
  position: relative;
  border: 1px dashed var(--el-border-color);
}

.radial-menu-shortcut-demo p {
  position: absolute;
  top: 16px;
  left: 16px;
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.radial-menu-shortcut-demo :deep(.fl-radial-menu--floating) {
  position: relative;
  top: auto;
  left: auto;
  transform: none;
}
</style>
