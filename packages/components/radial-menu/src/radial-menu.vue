<template>
  <div
    ref="rootRef"
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
      <svg :class="ns.e('sector')" viewBox="-140 -140 280 280" aria-hidden="true">
        <circle :class="ns.e('track')" cx="0" cy="0" :r="resolvedRadius" />
        <path v-if="sectorPath" :class="ns.e('sector-path')" :d="sectorPath" />
        <path v-if="activeTrackPath" :class="ns.e('track-active')" :d="activeTrackPath" />
      </svg>

      <button
        v-for="(item, index) in ringItems"
        :key="item.index"
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
        :aria-label="item.label"
        :data-radial-menu-index="item.index"
        @mouseenter="setActiveRingIndex(index)"
        @focus="setActiveRingIndex(index)"
        @mouseleave="setActiveRingIndex(null)"
        @click="activateItem(item, 'ring', index, $event)"
        @keydown="handleRingKeydown($event, index)">
        <component
          :is="getItemIcon(item)"
          v-if="getItemIcon(item) && typeof getItemIcon(item) !== 'string'" />
        <span v-else-if="getItemIcon(item)" :class="ns.e('item-icon')">
          {{ getItemIcon(item) }}
        </span>
        <span :class="getItemLabelClass(index)">
          <RadialMenuItemLabel :item="item" />
        </span>
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
          :key="item.index"
          :ref="(element) => setMoreButtonRef(element, index)"
          type="button"
          role="menuitem"
          :class="[ns.e('more-item'), ns.is('disabled', item.disabled === true)]"
          :disabled="item.disabled"
          :tabindex="item.disabled ? -1 : 0"
          :aria-disabled="item.disabled === true"
          :aria-label="item.label"
          :data-radial-menu-more-index="item.index"
          @click="activateItem(item, 'more', index, $event)"
          @keydown="handleMoreKeydown($event, index)">
          <span :class="ns.e('more-content')">
            <component
              :is="getItemIcon(item)"
              v-if="getItemIcon(item) && typeof getItemIcon(item) !== 'string'"
              :class="ns.e('more-icon')" />
            <span v-else-if="getItemIcon(item)" :class="ns.e('more-icon')">
              {{ getItemIcon(item) }}
            </span>
            <span :class="ns.e('more-label')">
              <RadialMenuItemLabel :item="item" />
            </span>
          </span>
          <span v-if="item.shortcut" :class="ns.e('shortcut')">{{ item.shortcut }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Fragment,
  computed,
  isVNode,
  nextTick,
  onBeforeUnmount,
  ref,
  toRef,
  useSlots,
  useTemplateRef,
  watch,
  type Component,
  type ComponentPublicInstance,
  type Slot,
  type VNode,
  type VNodeArrayChildren
} from 'vue'
import { useGlobalSize } from 'element-plus'
import { useNamespace } from '@falcon-ui/utils'
import { flRadialMenuEmits, flRadialMenuProps } from './radial-menu'
import { normalizeRadialMenuItems, splitRadialMenuItems } from './use-radial-menu-items'
import { useRadialMenuKeyboard } from './use-radial-menu-keyboard'
import {
  getRadialMenuClockwiseArcPoints,
  getRadialMenuClockwiseEntryOrder,
  getRadialMenuItemLayout,
  getRadialMenuSectorPath,
  getRadialMenuTrackArcPath,
  getRadialMenuTipPlacement,
  normalizeRadialMenuAngle
} from './use-radial-menu-position'
import { useRadialMenuShortcut } from './use-radial-menu-shortcut'
import { useRadialMenuState } from './use-radial-menu-state'
import type {
  FlRadialMenuExpose,
  FlRadialMenuOpenOptions,
  FlRadialMenuResolvableItem,
  FlRadialMenuResolvedItem,
  FlRadialMenuSize
} from './types'

type RadialMenuEntryKeyframe = {
  offset: number
  opacity: number
  transform: string
}

defineOptions({
  name: 'FlRadialMenu'
})

const props = defineProps(flRadialMenuProps)
const emit = defineEmits(flRadialMenuEmits)
defineSlots<{
  default?: () => unknown
  center?: () => unknown
}>()
const ns = useNamespace('radial-menu')
const slots = useSlots()
const rootRef = useTemplateRef<HTMLDivElement>('rootRef')
const centerRef = useTemplateRef<HTMLButtonElement>('centerRef')
const activeRingIndex = ref<number | null>(null)
const moreOpened = ref(false)
const isEntryAnimating = ref(false)
const ringButtonRefs = ref<HTMLButtonElement[]>([])
const moreButtonRefs = ref<HTMLButtonElement[]>([])
const warnedMessages = new Set<string>()
const globalSize = useGlobalSize()
const radialMenuEntryTrackDelay = 120
const radialMenuEntryItemMinDuration = 440
const radialMenuEntryItemMaxDuration = 600
const radialMenuEntryItemStagger = 90
const radialMenuEntryArcSteps = 9
const radialMenuEntryStartAngle = 180
const radialMenuEntryEasing = 'cubic-bezier(0.2, 0, 0, 1)'
const radialMenuGeometryBySize = {
  large: {
    radius: 96,
    centerSize: 56
  },
  medium: {
    radius: 80,
    centerSize: 48
  },
  small: {
    radius: 64,
    centerSize: 40
  }
} satisfies Record<FlRadialMenuSize, { radius: number; centerSize: number }>

const mapGlobalSize = (size: '' | 'default' | 'large' | 'small'): FlRadialMenuSize => {
  if (size === 'large' || size === 'small') {
    return size
  }

  if (size === 'default') {
    return 'medium'
  }

  return 'large'
}

const warnRadialMenu = (message: string) => {
  if (warnedMessages.has(message)) {
    return
  }

  warnedMessages.add(message)
  console.warn(`[FlRadialMenu] ${message}`)
}

const flattenSlotVNodes = (children: VNodeArrayChildren): VNode[] => {
  const vnodes: VNode[] = []

  for (const child of children) {
    if (Array.isArray(child)) {
      vnodes.push(...flattenSlotVNodes(child as VNodeArrayChildren))
      continue
    }

    if (!isVNode(child)) {
      continue
    }

    if (child.type === Fragment && Array.isArray(child.children)) {
      vnodes.push(...flattenSlotVNodes(child.children as VNodeArrayChildren))
      continue
    }

    vnodes.push(child)
  }

  return vnodes
}

const isRadialMenuItemVNode = (vnode: VNode) =>
  typeof vnode.type === 'object' && 'name' in vnode.type && vnode.type.name === 'FlRadialMenuItem'

const readBooleanSlotProp = (value: unknown) => value === true || value === ''

const readOptionalBooleanSlotProp = (value: unknown) =>
  value === undefined ? undefined : readBooleanSlotProp(value)

const readSlotItemSlots = (children: VNode['children']) => {
  if (!children || Array.isArray(children) || typeof children !== 'object') {
    return undefined
  }

  return children as Partial<Record<string, Slot>>
}

const readSlotItemProps = (vnode: VNode): FlRadialMenuResolvableItem => {
  const vnodeProps = (vnode.props ?? {}) as Record<string, unknown>
  const vnodeSlots = readSlotItemSlots(vnode.children)

  return {
    index: typeof vnodeProps.index === 'string' ? vnodeProps.index : undefined,
    label: typeof vnodeProps.label === 'string' ? vnodeProps.label : '',
    icon: vnodeProps.icon as Component | undefined,
    shortcut: typeof vnodeProps.shortcut === 'string' ? vnodeProps.shortcut : undefined,
    disabled: readBooleanSlotProp(vnodeProps.disabled),
    hidden: readBooleanSlotProp(vnodeProps.hidden),
    divided: readBooleanSlotProp(vnodeProps.divided),
    closeOnSelect: readOptionalBooleanSlotProp(vnodeProps.closeOnSelect),
    meta:
      vnodeProps.meta && typeof vnodeProps.meta === 'object'
        ? (vnodeProps.meta as Record<string, unknown>)
        : undefined,
    iconSlot: vnodeSlots?.icon,
    labelSlot: vnodeSlots?.label
  }
}

const slotItems = computed(() =>
  flattenSlotVNodes(slots.default?.() ?? [])
    .filter(isRadialMenuItemVNode)
    .map(readSlotItemProps)
)
const resolvedItems = computed(() =>
  normalizeRadialMenuItems(slotItems.value.length > 0 ? slotItems.value : props.items, {
    warn: warnRadialMenu
  })
)
const splitItems = computed(() => splitRadialMenuItems(resolvedItems.value, props.maxRingItems))
const ringItems = computed(() => splitItems.value.ringItems)
const moreItems = computed(() => splitItems.value.moreItems)
const resolvedSize = computed(() => props.size ?? mapGlobalSize(globalSize.value))
const sizeGeometry = computed(() => radialMenuGeometryBySize[resolvedSize.value])
const resolvedRadius = computed(() => sizeGeometry.value.radius)
const resolvedCenterSize = computed(() => sizeGeometry.value.centerSize)
const activeItem = computed(() =>
  activeRingIndex.value === null ? null : (ringItems.value[activeRingIndex.value] ?? null)
)
const sectorInnerRadius = computed(() => resolvedCenterSize.value / 2 + 8)
const sectorPath = computed(() => {
  if (activeRingIndex.value === null || ringItems.value.length === 0) {
    return ''
  }

  return getRadialMenuSectorPath({
    activeIndex: activeRingIndex.value,
    count: ringItems.value.length,
    innerRadius: sectorInnerRadius.value,
    outerRadius: resolvedRadius.value
  })
})
const activeTrackPath = computed(() => {
  if (activeRingIndex.value === null || ringItems.value.length === 0) {
    return ''
  }

  return getRadialMenuTrackArcPath({
    activeIndex: activeRingIndex.value,
    count: ringItems.value.length,
    radius: resolvedRadius.value,
    innerRadius: sectorInnerRadius.value
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
  ns.m(resolvedSize.value),
  ns.m(`item-${props.itemType}`),
  ns.is('opened', opened.value),
  ns.is('entering', isEntryAnimating.value),
  ns.is('disabled', props.disabled)
])

const rootStyle = computed(() => ({
  '--fl-radial-menu-floating-x': `${floatingX.value ?? (typeof window === 'undefined' ? 0 : window.innerWidth / 2)}px`,
  '--fl-radial-menu-floating-y': `${floatingY.value ?? (typeof window === 'undefined' ? 0 : window.innerHeight / 2)}px`,
  '--fl-radial-menu-z-index': String(props.zIndex),
  '--fl-radial-menu-more-enter-delay': `${radialMenuEntryTrackDelay + Math.max(ringItems.value.length - 1, 0) * radialMenuEntryItemStagger}ms`
}))

const getItemIcon = (item: FlRadialMenuResolvedItem) => item.iconSlot ?? item.icon
const RadialMenuItemLabel = ({ item }: { item: FlRadialMenuResolvedItem }) =>
  item.labelSlot?.() ?? item.label

const getItemLayout = (index: number) =>
  getRadialMenuItemLayout({
    count: ringItems.value.length,
    index,
    radius: resolvedRadius.value
  })

const formatEntryCoordinate = (value: number) => {
  const rounded = Math.abs(value) < 0.001 ? 0 : Number(value.toFixed(3))

  return `${rounded}px`
}

const getEntryTransform = (x: number, y: number, scale = 1) =>
  `translate(calc(-50% + ${formatEntryCoordinate(x)}), calc(-50% + ${formatEntryCoordinate(y)})) scale(${scale})`

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const canUseWebAnimations = () =>
  typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.animate === 'function'

const canAnimateElement = (element: HTMLElement) => typeof element.animate === 'function'

const getItemStyle = (index: number) => {
  const layout = getItemLayout(index)

  return {
    '--fl-radial-menu-item-x': `${layout.x}px`,
    '--fl-radial-menu-item-y': `${layout.y}px`,
    '--fl-radial-menu-item-index': String(index)
  }
}

const getItemLabelClass = (index: number) => {
  const placement = getRadialMenuTipPlacement(getItemLayout(index))

  return [
    ns.e('item-label'),
    ns.em('item-label', `tip-${placement}`),
    moreItems.value.length > 0 && placement === 'bottom'
      ? ns.em('item-label', 'hidden-by-more')
      : ''
  ]
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
  } else {
    delete ringButtonRefs.value[index]
  }
}

const setMoreButtonRef = (element: Element | ComponentPublicInstance | null, index: number) => {
  if (element instanceof HTMLButtonElement) {
    moreButtonRefs.value[index] = element
  } else {
    delete moreButtonRefs.value[index]
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

let isDocumentPointerdownBound = false

const removeDocumentPointerdown = () => {
  if (!isDocumentPointerdownBound || typeof document === 'undefined') {
    return
  }

  document.removeEventListener('pointerdown', handleDocumentPointerdown)
  isDocumentPointerdownBound = false
}

const addDocumentPointerdown = () => {
  if (isDocumentPointerdownBound || typeof document === 'undefined') {
    return
  }

  document.addEventListener('pointerdown', handleDocumentPointerdown)
  isDocumentPointerdownBound = true
}

const handleDocumentPointerdown = (event: PointerEvent) => {
  const { target } = event

  if (!(target instanceof Node)) {
    return
  }

  if (rootRef.value?.contains(target)) {
    return
  }

  moreOpened.value = false
  close('click-outside')
}

const activateItem = (
  item: FlRadialMenuResolvedItem,
  source: 'ring' | 'more',
  index: number,
  event: MouseEvent | KeyboardEvent
) => {
  if (item.disabled) {
    return
  }

  emit('select', item.index, [item.index], item, { source, index, event })

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

let entryAnimations: Animation[] = []
let entryAnimationToken = 0
let entryFinishTimer: ReturnType<typeof setTimeout> | undefined

const clearEntryFinishTimer = () => {
  if (entryFinishTimer === undefined) {
    return
  }

  clearTimeout(entryFinishTimer)
  entryFinishTimer = undefined
}

const cancelEntryAnimations = () => {
  entryAnimationToken += 1
  clearEntryFinishTimer()

  for (const animation of entryAnimations) {
    animation.cancel()
  }

  entryAnimations = []
  isEntryAnimating.value = false
}

const finishEntryAnimations = (token: number) => {
  if (token !== entryAnimationToken) {
    return
  }

  clearEntryFinishTimer()

  for (const animation of entryAnimations) {
    animation.cancel()
  }

  entryAnimations = []
  isEntryAnimating.value = false
}

const getEntryOrderByIndex = () => {
  const layouts = ringItems.value.map((_, index) => getItemLayout(index))
  const entryOrder = getRadialMenuClockwiseEntryOrder(layouts, {
    startAngle: radialMenuEntryStartAngle
  })

  return new Map(entryOrder.map((itemIndex, orderIndex) => [itemIndex, orderIndex]))
}

const getRingItemEntryDistance = (index: number) =>
  normalizeRadialMenuAngle(getItemLayout(index).angle - radialMenuEntryStartAngle)

const getRingItemEntryDuration = (index: number) => {
  const distanceRatio = Math.min(getRingItemEntryDistance(index), 360) / 360

  return (
    radialMenuEntryItemMinDuration +
    (radialMenuEntryItemMaxDuration - radialMenuEntryItemMinDuration) * distanceRatio
  )
}

const getRingItemEntryKeyframes = (index: number): RadialMenuEntryKeyframe[] => {
  const layout = getItemLayout(index)
  const finalOpacity = ringItems.value[index]?.disabled ? 0.5 : 1
  const points = getRadialMenuClockwiseArcPoints({
    radius: resolvedRadius.value,
    startAngle: radialMenuEntryStartAngle,
    targetAngle: layout.angle,
    steps: radialMenuEntryArcSteps
  })

  return points.map((point, pointIndex) => ({
    offset: pointIndex / (points.length - 1),
    opacity: pointIndex === 0 ? 0 : finalOpacity,
    transform: getEntryTransform(point.x, point.y, pointIndex === 0 ? 0.86 : 1)
  }))
}

const playEntryAnimations = () => {
  if (prefersReducedMotion() || ringItems.value.length === 0) {
    isEntryAnimating.value = false
    return
  }

  const ringButtons = ringButtonRefs.value.slice(0, ringItems.value.length)
  const entryOrderByIndex = getEntryOrderByIndex()
  const animations: Animation[] = []
  let maxEntryEndTime = 0

  ringButtons.forEach((button, index) => {
    if (!button || !canAnimateElement(button)) {
      return
    }

    const orderIndex = entryOrderByIndex.get(index) ?? index
    const delay = radialMenuEntryTrackDelay + orderIndex * radialMenuEntryItemStagger
    const duration = getRingItemEntryDuration(index)
    const animation = button.animate(getRingItemEntryKeyframes(index), {
      delay,
      duration,
      easing: radialMenuEntryEasing,
      fill: 'both'
    })

    maxEntryEndTime = Math.max(maxEntryEndTime, delay + duration)
    animations.push(animation)
  })

  if (animations.length === 0) {
    isEntryAnimating.value = false
    return
  }

  entryAnimationToken += 1
  const token = entryAnimationToken

  entryAnimations = animations
  isEntryAnimating.value = true
  entryFinishTimer = setTimeout(() => finishEntryAnimations(token), Math.ceil(maxEntryEndTime) + 40)
}

watch(opened, async (nextOpened) => {
  cancelEntryAnimations()

  if (!nextOpened) {
    return
  }

  isEntryAnimating.value =
    canUseWebAnimations() && !prefersReducedMotion() && ringItems.value.length > 0

  await nextTick()
  if (!opened.value) {
    return
  }

  playEntryAnimations()
  focusFirstAvailableRingItem()
})

watch(
  opened,
  (nextOpened) => {
    if (nextOpened) {
      addDocumentPointerdown()
    } else {
      removeDocumentPointerdown()
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  removeDocumentPointerdown()
  cancelEntryAnimations()
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
