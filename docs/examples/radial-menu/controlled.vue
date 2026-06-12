<template>
  <div class="radial-menu-demo-stage radial-menu-controlled-demo">
    <button type="button" @click="opened = !opened">Toggle</button>
    <FlRadialMenu v-model="opened" trigger="manual">
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
import { ref } from 'vue'
import { ElIcon } from 'element-plus'
import { Aim, Eleme, Finished, Position } from '@element-plus/icons-vue'
import { FlRadialMenu, FlRadialMenuItem } from '../../../packages/components/radial-menu'
import type { FlRadialMenuItemData as RadialMenuItem } from '../../../packages/components/radial-menu'

const opened = ref(false)
const items: RadialMenuItem[] = [
  { index: 'first', label: 'First', icon: Position },
  { index: 'second', label: 'Second', icon: Aim },
  { index: 'third', label: 'Third', icon: Finished }
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
