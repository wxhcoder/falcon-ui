<template>
  <span v-if="false" />
</template>

<script setup lang="ts">
import { flRadialMenuItemProps } from './radial-menu-item'

defineOptions({
  name: 'FlRadialMenuItem'
})

defineProps(flRadialMenuItemProps)
defineSlots<{
  icon?: () => unknown
  label?: () => unknown
}>()
</script>
