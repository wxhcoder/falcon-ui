<template>
  <div class="radial-menu-demo-stage">
    <FlRadialMenu>
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
        :disabled="item.disabled">
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
import { CopyDocument, Delete, DocumentCopy, Eleme } from '@element-plus/icons-vue'
import { FlRadialMenu, FlRadialMenuItem } from '../../../packages/components/radial-menu'
import type { FlRadialMenuItemData as RadialMenuItem } from '../../../packages/components/radial-menu'

const items: RadialMenuItem[] = [
  { index: 'copy', label: 'Copy', icon: CopyDocument },
  { index: 'paste', label: 'Paste', icon: DocumentCopy },
  { index: 'delete', label: 'Delete', icon: Delete, disabled: true }
]
</script>
