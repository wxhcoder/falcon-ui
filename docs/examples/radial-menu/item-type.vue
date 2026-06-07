<template>
  <div class="radial-menu-demo-stage">
    <FlRadialMenu center-label="Brush" item-type="circle" @select="handleSelect">
      <FlRadialMenuItem
        v-for="item in items"
        :key="item.index"
        :index="item.index"
        :label="item.label"
        :shortcut="item.shortcut">
        <template #icon>
          <span>{{ iconMap[item.index] }}</span>
        </template>
      </FlRadialMenuItem>
    </FlRadialMenu>
  </div>
</template>

<script setup lang="ts">
import { FlRadialMenu, FlRadialMenuItem } from '../../../packages/components/radial-menu'
import type { FlRadialMenuItemData as RadialMenuItem } from '../../../packages/components/radial-menu'

const items: RadialMenuItem[] = [
  { index: 'brush', label: 'Brush', shortcut: 'B' },
  { index: 'eraser', label: 'Eraser', shortcut: 'E' },
  { index: 'fill', label: 'Fill Color', shortcut: 'F' },
  { index: 'picker', label: 'Color Picker', shortcut: 'I' }
]

const iconMap: Record<string, string> = {
  brush: 'B',
  eraser: 'E',
  fill: 'F',
  picker: 'I'
}

const handleSelect = (index: string) => {
  console.info('[radial-menu] selected', index)
}
</script>
