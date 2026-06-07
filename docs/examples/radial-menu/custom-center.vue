<template>
  <div class="radial-menu-demo-stage">
    <FlRadialMenu>
      <template #center>
        <span class="radial-menu-custom-center">+</span>
      </template>
      <FlRadialMenuItem
        v-for="item in items"
        :key="item.index"
        :index="item.index"
        :label="item.label"
        :disabled="item.disabled" />
    </FlRadialMenu>
  </div>
</template>

<script setup lang="ts">
import { FlRadialMenu, FlRadialMenuItem } from '../../../packages/components/radial-menu'
import type { FlRadialMenuItemData as RadialMenuItem } from '../../../packages/components/radial-menu'

const items: RadialMenuItem[] = [
  { index: 'copy', label: 'Copy' },
  { index: 'paste', label: 'Paste' },
  { index: 'delete', label: 'Delete', disabled: true }
]
</script>

<style scoped>
.radial-menu-custom-center {
  font-size: 20px;
}
</style>
