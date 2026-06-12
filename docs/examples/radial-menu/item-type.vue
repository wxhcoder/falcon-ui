<template>
  <div class="radial-menu-demo-stage">
    <FlRadialMenu item-type="circle" @select="handleSelect">
      <template #center>
        <ElIcon :size="16">
          <Eleme />
        </ElIcon>
      </template>
      <FlRadialMenuItem
        v-for="item in items"
        :key="item.index"
        :index="item.index"
        :label="item.label"
        :shortcut="item.shortcut">
        <template #icon>
          <ElIcon :size="16">
            <component :is="item.icon" />
          </ElIcon>
        </template>
      </FlRadialMenuItem>
    </FlRadialMenu>
  </div>
</template>

<script setup lang="ts">
import { ElIcon } from 'element-plus'
import { Aim, Brush, EditPen, Eleme, Pouring } from '@element-plus/icons-vue'
import { FlRadialMenu, FlRadialMenuItem } from '../../../packages/components/radial-menu'
import type { FlRadialMenuItemData as RadialMenuItem } from '../../../packages/components/radial-menu'

const items: RadialMenuItem[] = [
  { index: 'brush', label: 'Brush', icon: Brush, shortcut: 'B' },
  { index: 'eraser', label: 'Eraser', icon: EditPen, shortcut: 'E' },
  { index: 'fill', label: 'Fill Color', icon: Pouring, shortcut: 'F' },
  { index: 'picker', label: 'Color Picker', icon: Aim, shortcut: 'I' }
]

const handleSelect = (index: string) => {
  console.info('[radial-menu] selected', index)
}
</script>
