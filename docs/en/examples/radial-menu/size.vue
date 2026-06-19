<template>
  <div class="radial-menu-demo-stage radial-menu-size-demo">
    <FlRadialMenu size="large">
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
      </FlRadialMenuItem>
    </FlRadialMenu>

    <FlRadialMenu size="medium">
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
      </FlRadialMenuItem>
    </FlRadialMenu>

    <FlRadialMenu size="small" :center-icon="Tools">
      <FlRadialMenuItem
        v-for="item in items"
        :key="item.index"
        :index="item.index"
        :icon="item.icon"
        :label="item.label" />
    </FlRadialMenu>
  </div>
</template>

<script setup lang="ts">
import { ElIcon } from 'element-plus'
import { Crop, EditPen, Eleme, Rank, Tickets, Tools } from '@element-plus/icons-vue'
import { FlRadialMenu, FlRadialMenuItem } from '../../../../packages/components/radial-menu'
import type { FlRadialMenuItemData as RadialMenuItem } from '../../../../packages/components/radial-menu'

const items: RadialMenuItem[] = [
  { index: 'move', label: 'Move', icon: Rank },
  { index: 'frame', label: 'Frame', icon: Crop },
  { index: 'pen', label: 'Pen', icon: EditPen },
  { index: 'text', label: 'Text', icon: Tickets }
]
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
