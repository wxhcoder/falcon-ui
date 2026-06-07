<template>
  <div class="radial-menu-demo-stage radial-menu-size-demo">
    <FlRadialMenu size="large" center-label="Large">
      <FlRadialMenuItem
        v-for="item in items"
        :key="item.index"
        :index="item.index"
        :label="item.label">
        <template #icon>
          <span>{{ iconMap[item.index] }}</span>
        </template>
      </FlRadialMenuItem>
    </FlRadialMenu>

    <FlRadialMenu size="medium" center-label="Medium">
      <FlRadialMenuItem
        v-for="item in items"
        :key="item.index"
        :index="item.index"
        :label="item.label">
        <template #icon>
          <span>{{ iconMap[item.index] }}</span>
        </template>
      </FlRadialMenuItem>
    </FlRadialMenu>

    <FlRadialMenu size="small" center-label="Small">
      <FlRadialMenuItem
        v-for="item in items"
        :key="item.index"
        :index="item.index"
        :label="item.label">
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
  { index: 'move', label: 'Move' },
  { index: 'frame', label: 'Frame' },
  { index: 'pen', label: 'Pen' },
  { index: 'text', label: 'Text' }
]
const iconMap: Record<string, string> = {
  move: 'V',
  frame: '#',
  pen: 'P',
  text: 'T'
}
</script>

<style scoped>
.radial-menu-size-demo {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  column-gap: 200px;
  row-gap: 220px;
}
</style>
