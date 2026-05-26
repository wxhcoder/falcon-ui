<template>
  <div
    :class="rootClass"
    :style="rootStyle"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave">
    <button
      ref="centerRef"
      type="button"
      :class="ns.e('center')"
      :disabled="disabled"
      :aria-expanded="String(opened)"
      aria-haspopup="menu"
      @click="handleCenterClick">
      <slot name="center">
        <component :is="centerIcon" v-if="centerIcon && typeof centerIcon !== 'string'" />
        <span v-else-if="centerIcon" :class="ns.e('center-icon')">{{ centerIcon }}</span>
        <span v-if="centerLabel" :class="ns.e('center-label')">{{ centerLabel }}</span>
      </slot>
    </button>

    <div v-if="opened" :class="ns.e('panel')" role="menu">
      <button
        v-for="(item, index) in ringItems"
        :key="item.key"
        type="button"
        role="menuitem"
        :class="[ns.e('item'), ns.is('disabled', item.disabled)]"
        :style="getItemStyle(index)"
        :disabled="item.disabled"
        :data-radial-menu-key="item.key">
        <component :is="item.icon" v-if="item.icon && typeof item.icon !== 'string'" />
        <span v-else-if="item.icon" :class="ns.e('item-icon')">{{ item.icon }}</span>
        <span :class="ns.e('item-label')">{{ item.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef, useTemplateRef } from 'vue'
import { useNamespace } from '@falcon-ui/utils'
import { flRadialMenuEmits, flRadialMenuProps } from './radial-menu'
import { splitRadialMenuItems } from './use-radial-menu-items'
import { getRadialMenuItemLayout } from './use-radial-menu-position'
import { useRadialMenuState } from './use-radial-menu-state'
import type { FlRadialMenuExpose, FlRadialMenuOpenOptions } from './types'

defineOptions({
  name: 'FlRadialMenu'
})

const props = defineProps(flRadialMenuProps)
const emit = defineEmits(flRadialMenuEmits)
const ns = useNamespace('radial-menu')
const centerRef = useTemplateRef<HTMLButtonElement>('centerRef')

const splitItems = computed(() => splitRadialMenuItems(props.items, props.maxRingItems))
const ringItems = computed(() => splitItems.value.ringItems)

const { opened, open, close, toggle } = useRadialMenuState({
  modelValue: toRef(props, 'modelValue'),
  disabled: toRef(props, 'disabled'),
  emitUpdate: (nextOpened) => emit('update:modelValue', nextOpened)
})

const rootClass = computed(() => [
  ns.b(),
  ns.m(props.mode),
  ns.is('opened', opened.value),
  ns.is('disabled', props.disabled)
])

const rootStyle = computed(() => ({
  '--fl-radial-menu-radius': `${props.radius}px`,
  '--fl-radial-menu-center-size': `${props.centerSize}px`,
  '--fl-radial-menu-item-size': `${props.itemSize}px`,
  '--fl-radial-menu-z-index': String(props.zIndex)
}))

const getItemStyle = (index: number) => {
  const layout = getRadialMenuItemLayout({
    count: ringItems.value.length,
    index,
    radius: props.radius
  })

  return {
    '--fl-radial-menu-item-x': `${layout.x}px`,
    '--fl-radial-menu-item-y': `${layout.y}px`,
    '--fl-radial-menu-item-index': String(index)
  }
}

const handleCenterClick = () => {
  if (props.disabled || props.trigger !== 'click') {
    return
  }

  toggle({ reason: 'click' })
}

const handleMouseEnter = () => {
  if (props.disabled || props.trigger !== 'hover') {
    return
  }

  open({ reason: 'hover' })
}

const handleMouseLeave = () => {
  if (props.trigger !== 'hover') {
    return
  }

  close('hover-leave')
}

const focus = () => {
  centerRef.value?.focus()
}

defineExpose<FlRadialMenuExpose>({
  open: (options?: FlRadialMenuOpenOptions) => open(options),
  close,
  toggle,
  focus
})
</script>
