<template>
  <div class="radial-menu-demo-stage">
    <FlRadialMenu more-mode="text-ellipsis">
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
  </div>
</template>

<script setup lang="ts">
import { ElIcon } from 'element-plus'
import {
  Box,
  ChatDotRound,
  Crop,
  EditPen,
  Eleme,
  Operation,
  Rank,
  Setting,
  Tickets
} from '@element-plus/icons-vue'
import { FlRadialMenu, FlRadialMenuItem } from '../../../packages/components/radial-menu'
import type { FlRadialMenuItemData as RadialMenuItem } from '../../../packages/components/radial-menu'

const items: RadialMenuItem[] = [
  { index: 'move', label: 'Move', icon: Rank },
  { index: 'frame', label: 'Frame', icon: Crop },
  { index: 'pen', label: 'Pen', icon: EditPen },
  { index: 'text', label: 'Text', icon: Tickets },
  { index: 'comment', label: 'Comment', icon: ChatDotRound },
  { index: 'objects', label: 'Objects', icon: Box },
  { index: 'actions', label: 'Actions', icon: Operation },
  { index: 'settings', label: 'Settings', icon: Setting }
]
</script>
