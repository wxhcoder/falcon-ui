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
      <svg v-if="sectorPath" :class="ns.e('sector')" viewBox="-140 -140 280 280" aria-hidden="true">
        <path :class="ns.e('sector-path')" :d="sectorPath" />
      </svg>

      <button
        v-for="(item, index) in ringItems"
        :key="item.key"
        type="button"
        role="menuitem"
        :class="[
          ns.e('item'),
          ns.is('active', activeRingIndex === index),
          ns.is('disabled', item.disabled === true)
        ]"
        :style="getItemStyle(index)"
        :disabled="item.disabled"
        :data-radial-menu-key="item.key"
        @mouseenter="setActiveRingIndex(index)"
        @focus="setActiveRingIndex(index)"
        @mouseleave="setActiveRingIndex(null)"
        @click="activateItem(item, 'ring', index, $event)">
        <component :is="item.icon" v-if="item.icon && typeof item.icon !== 'string'" />
        <span v-else-if="item.icon" :class="ns.e('item-icon')">{{ item.icon }}</span>
        <span :class="ns.e('item-label')">{{ item.label }}</span>
      </button>

      <button
        v-if="moreItems.length > 0"
        type="button"
        :class="ns.e('more')"
        aria-haspopup="menu"
        :aria-expanded="String(moreOpened)"
        @click="setMoreOpened(!moreOpened)">
        {{ moreLabel }}
      </button>

      <div
        v-if="moreOpened"
        :class="[ns.e('more-dropdown'), ns.m(`more-${moreDropdownPlacement}`)]"
        role="menu">
        <button
          v-for="(item, index) in moreItems"
          :key="item.key"
          type="button"
          role="menuitem"
          :class="[ns.e('more-item'), ns.is('disabled', item.disabled === true)]"
          :disabled="item.disabled"
          :data-radial-menu-more-key="item.key"
          @click="activateItem(item, 'more', index, $event)">
          <span :class="ns.e('more-label')">{{ item.label }}</span>
          <span v-if="item.shortcut" :class="ns.e('shortcut')">{{ item.shortcut }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRef, useTemplateRef } from 'vue'
import { useNamespace } from '@falcon-ui/utils'
import { flRadialMenuEmits, flRadialMenuProps } from './radial-menu'
import { splitRadialMenuItems } from './use-radial-menu-items'
import { getRadialMenuItemLayout, getRadialMenuSectorPath } from './use-radial-menu-position'
import { useRadialMenuState } from './use-radial-menu-state'
import type { FlRadialMenuExpose, FlRadialMenuItem, FlRadialMenuOpenOptions } from './types'

defineOptions({
  name: 'FlRadialMenu'
})

const props = defineProps(flRadialMenuProps)
const emit = defineEmits(flRadialMenuEmits)
const ns = useNamespace('radial-menu')
const centerRef = useTemplateRef<HTMLButtonElement>('centerRef')
const activeRingIndex = ref<number | null>(null)
const moreOpened = ref(false)

const splitItems = computed(() => splitRadialMenuItems(props.items, props.maxRingItems))
const ringItems = computed(() => splitItems.value.ringItems)
const moreItems = computed(() => splitItems.value.moreItems)
const activeItem = computed(() =>
  activeRingIndex.value === null ? null : (ringItems.value[activeRingIndex.value] ?? null)
)
const sectorPath = computed(() => {
  if (activeRingIndex.value === null || ringItems.value.length === 0) {
    return ''
  }

  return getRadialMenuSectorPath({
    activeIndex: activeRingIndex.value,
    count: ringItems.value.length,
    innerRadius: props.centerSize / 2 + 8,
    outerRadius: props.radius + props.itemSize / 2 + 14
  })
})

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

const moreLabel = computed(() => {
  if (props.moreMode === 'ellipsis') {
    return '...'
  }

  if (props.moreMode === 'text') {
    return props.moreText
  }

  return `${props.moreText} ...`
})

const setActiveRingIndex = (index: number | null) => {
  activeRingIndex.value = index
  emit('active-change', activeItem.value)
}

const setMoreOpened = (nextOpened: boolean) => {
  moreOpened.value = nextOpened
  emit(nextOpened ? 'more-open' : 'more-close')
}

const activateItem = (
  item: FlRadialMenuItem,
  source: 'ring' | 'more',
  index: number,
  event: MouseEvent | KeyboardEvent
) => {
  if (item.disabled) {
    return
  }

  emit('select', item, { source, index, event })

  const shouldClose = item.closeOnSelect ?? props.closeOnSelect
  if (shouldClose) {
    moreOpened.value = false
    close('select')
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
