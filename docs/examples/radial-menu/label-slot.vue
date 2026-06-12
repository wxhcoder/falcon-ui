<template>
  <div class="radial-menu-demo-stage">
    <FlRadialMenu @select="handleSelect">
      <template #center>
        <ElIcon :size="16">
          <Eleme />
        </ElIcon>
      </template>
      <FlRadialMenuItem
        v-for="item in items"
        :key="item.index"
        :index="item.index"
        :label="item.label">
        <template #icon>
          <ElIcon :size="16">
            <component :is="item.icon" />
          </ElIcon>
        </template>
        <template #label>
          <span class="radial-menu-label-content">
            <span>{{ item.label }}</span>
            <span class="radial-menu-label-badge">{{ item.shortcut }}</span>
          </span>
        </template>
      </FlRadialMenuItem>
    </FlRadialMenu>
  </div>
</template>

<script setup lang="ts">
import { ElIcon } from 'element-plus'
import { Crop, EditPen, Eleme, Rank, Tickets } from '@element-plus/icons-vue'
import { FlRadialMenu, FlRadialMenuItem } from '../../../packages/components/radial-menu'
import type { FlRadialMenuItemData as RadialMenuItem } from '../../../packages/components/radial-menu'

const items: RadialMenuItem[] = [
  { index: 'move', label: 'Move', icon: Rank, shortcut: 'V' },
  { index: 'frame', label: 'Frame', icon: Crop, shortcut: 'F' },
  { index: 'pen', label: 'Pen', icon: EditPen, shortcut: 'P' },
  { index: 'text', label: 'Text', icon: Tickets, shortcut: 'T' }
]

const handleSelect = (index: string) => {
  console.info('[radial-menu] selected', index)
}
</script>

<style scoped>
.radial-menu-label-content {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.radial-menu-label-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--el-fill-color);
  color: var(--el-text-color-secondary);
  font-size: 11px;
  line-height: 1;
}
</style>
