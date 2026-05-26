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
      :disabled="props.disabled"
      :aria-expanded="opened"
      aria-haspopup="menu"
      @click="handleCenterClick">
      <slot name="center">
        <component
          :is="props.centerIcon"
          v-if="props.centerIcon && typeof props.centerIcon !== 'string'" />
        <span v-else-if="props.centerIcon" :class="ns.e('center-icon')">
          {{ props.centerIcon }}
        </span>
        <span v-if="props.centerLabel" :class="ns.e('center-label')">{{ props.centerLabel }}</span>
      </slot>
    </button>

    <div v-if="opened" :class="ns.e('panel')" role="menu" @keydown="handleMenuKeydown">
      <svg v-if="sectorPath" :class="ns.e('sector')" viewBox="-140 -140 280 280" aria-hidden="true">
        <path :class="ns.e('sector-path')" :d="sectorPath" />
      </svg>

      <button
        v-for="(item, index) in ringItems"
        :key="item.key"
        :ref="(element) => setRingButtonRef(element, index)"
        type="button"
        role="menuitem"
        :class="[
          ns.e('item'),
          ns.is('active', activeRingIndex === index),
          ns.is('disabled', item.disabled === true)
        ]"
        :style="getItemStyle(index)"
        :disabled="item.disabled"
        :tabindex="item.disabled ? -1 : 0"
        :aria-disabled="item.disabled === true"
        :data-radial-menu-key="item.key"
        @mouseenter="setActiveRingIndex(index)"
        @focus="setActiveRingIndex(index)"
        @mouseleave="setActiveRingIndex(null)"
        @click="activateItem(item, 'ring', index, $event)"
        @keydown="handleRingKeydown($event, index)">
        <component :is="item.icon" v-if="item.icon && typeof item.icon !== 'string'" />
        <span v-else-if="item.icon" :class="ns.e('item-icon')">{{ item.icon }}</span>
        <span :class="ns.e('item-label')">{{ item.label }}</span>
      </button>

      <button
        v-if="moreItems.length > 0"
        type="button"
        :class="ns.e('more')"
        aria-haspopup="menu"
        :aria-expanded="moreOpened"
        @click="setMoreOpened(!moreOpened)">
        {{ moreLabel }}
      </button>

      <div
        v-if="moreOpened"
        :class="[ns.e('more-dropdown'), ns.m(`more-${props.moreDropdownPlacement}`)]"
        role="menu">
        <button
          v-for="(item, index) in moreItems"
          :key="item.key"
          :ref="(element) => setMoreButtonRef(element, index)"
          type="button"
          role="menuitem"
          :class="[ns.e('more-item'), ns.is('disabled', item.disabled === true)]"
          :disabled="item.disabled"
          :tabindex="item.disabled ? -1 : 0"
          :aria-disabled="item.disabled === true"
          :data-radial-menu-more-key="item.key"
          @click="activateItem(item, 'more', index, $event)"
          @keydown="handleMoreKeydown($event, index)">
          <span :class="ns.e('more-label')">{{ item.label }}</span>
          <span v-if="item.shortcut" :class="ns.e('shortcut')">{{ item.shortcut }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  ref,
  toRef,
  useTemplateRef,
  watch,
  type ComponentPublicInstance
} from 'vue'
import { useNamespace } from '@falcon-ui/utils'
import { flRadialMenuEmits, flRadialMenuProps } from './radial-menu'
import { splitRadialMenuItems } from './use-radial-menu-items'
import { useRadialMenuKeyboard } from './use-radial-menu-keyboard'
import { getRadialMenuItemLayout, getRadialMenuSectorPath } from './use-radial-menu-position'
import { useRadialMenuShortcut } from './use-radial-menu-shortcut'
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
const ringButtonRefs = ref<HTMLButtonElement[]>([])
const moreButtonRefs = ref<HTMLButtonElement[]>([])

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

const { opened, floatingX, floatingY, open, close, toggle } = useRadialMenuState({
  modelValue: toRef(props, 'modelValue'),
  disabled: toRef(props, 'disabled'),
  emitUpdate: (nextOpened) => emit('update:modelValue', nextOpened)
})

useRadialMenuShortcut({
  shortcut: toRef(props, 'shortcut'),
  enabled: computed(() => props.shortcutEnabled && Boolean(props.shortcut)),
  open
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
  '--fl-radial-menu-floating-x': `${floatingX.value ?? (typeof window === 'undefined' ? 0 : window.innerWidth / 2)}px`,
  '--fl-radial-menu-floating-y': `${floatingY.value ?? (typeof window === 'undefined' ? 0 : window.innerHeight / 2)}px`,
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

const setRingButtonRef = (element: Element | ComponentPublicInstance | null, index: number) => {
  if (element instanceof HTMLButtonElement) {
    ringButtonRefs.value[index] = element
  }
}

const setMoreButtonRef = (element: Element | ComponentPublicInstance | null, index: number) => {
  if (element instanceof HTMLButtonElement) {
    moreButtonRefs.value[index] = element
  }
}

const setMoreOpened = (nextOpened: boolean) => {
  moreOpened.value = nextOpened
  if (nextOpened) {
    emit('more-open')
  } else {
    emit('more-close')
  }
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

const activateKeyboardItem = (event: KeyboardEvent) => {
  const target = event.currentTarget
  if (!(target instanceof HTMLElement)) {
    return
  }

  target.click()
}

const { focusFirstAvailableRingItem, handleMenuKeydown, handleRingKeydown, handleMoreKeydown } =
  useRadialMenuKeyboard({
    ringItems,
    moreItems,
    ringRefs: ringButtonRefs,
    moreRefs: moreButtonRefs,
    closeMenu: () => close('escape'),
    closeMore: () => {
      moreOpened.value = false
    },
    activateFocused: activateKeyboardItem
  })

watch(opened, async (nextOpened) => {
  if (!nextOpened) {
    return
  }

  await nextTick()
  focusFirstAvailableRingItem()
})

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
