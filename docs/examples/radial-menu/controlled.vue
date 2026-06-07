<template>
  <div class="radial-menu-demo-stage radial-menu-controlled-demo">
    <button type="button" @click="opened = !opened">Toggle</button>
    <FlRadialMenu v-model="opened" trigger="manual" center-label="Manual">
      <FlRadialMenuItem
        v-for="item in items"
        :key="item.index"
        :index="item.index"
        :label="item.label" />
    </FlRadialMenu>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FlRadialMenu, FlRadialMenuItem } from '../../../packages/components/radial-menu'
import type { FlRadialMenuItemData as RadialMenuItem } from '../../../packages/components/radial-menu'

const opened = ref(false)
const items: RadialMenuItem[] = [
  { index: 'first', label: 'First' },
  { index: 'second', label: 'Second' },
  { index: 'third', label: 'Third' }
]
</script>

<style scoped>
.radial-menu-controlled-demo {
  position: relative;
}

.radial-menu-controlled-demo button {
  position: absolute;
  top: 16px;
  left: 16px;
}
</style>
