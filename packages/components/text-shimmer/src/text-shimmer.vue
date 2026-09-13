<template>
  <component
    :is="resolvedTag"
    v-bind="attrs"
    :class="[ns.b(), ns.is('disabled', props.disabled)]"
    :style="rootStyle">
    <slot v-if="$slots.default" />
    <template v-else>{{ props.text }}</template>
  </component>
</template>

<script setup lang="ts">
import { Comment, Fragment, Text, computed, useAttrs, useSlots } from 'vue'
import type { VNode } from 'vue'
import { useNamespace } from '@falcon-ui/utils'
import {
  flTextShimmerProps,
  flTextShimmerTags,
  normalizeTextShimmerNumber,
  TEXT_SHIMMER_DEFAULT_DURATION,
  TEXT_SHIMMER_DEFAULT_SPREAD
} from './text-shimmer'

defineOptions({
  name: 'FlTextShimmer',
  inheritAttrs: false
})

const props = defineProps(flTextShimmerProps)
defineSlots<{ default?: () => VNode[] }>()

const attrs = useAttrs()
const slots = useSlots()
const ns = useNamespace('text-shimmer')

const readVNodeText = (node: VNode): string => {
  if (node.type === Text) {
    return typeof node.children === 'string' ? node.children : ''
  }

  if (node.type === Fragment && Array.isArray(node.children)) {
    return node.children.map((child) => readVNodeText(child as VNode)).join('')
  }

  if (node.type === Comment || !Array.isArray(node.children)) {
    return ''
  }

  return node.children.map((child) => readVNodeText(child as VNode)).join('')
}

const slotText = computed(() => (slots.default ? slots.default().map(readVNodeText).join('') : ''))
const displayText = computed(() => (slots.default ? slotText.value : props.text))
const resolvedTag = computed(() =>
  flTextShimmerTags.includes(props.as) ? props.as : flTextShimmerTags[0]
)
const resolvedDuration = computed(() =>
  normalizeTextShimmerNumber(props.duration, 'duration', TEXT_SHIMMER_DEFAULT_DURATION)
)
const resolvedSpread = computed(() =>
  normalizeTextShimmerNumber(props.spread, 'spread', TEXT_SHIMMER_DEFAULT_SPREAD)
)
const rootStyle = computed(() => {
  const style: Record<string, string> = {
    '--fl-text-shimmer-duration': `${resolvedDuration.value}s`,
    '--fl-text-shimmer-spread': `${displayText.value.length * resolvedSpread.value}px`
  }

  if (props.color?.trim()) {
    style['--fl-text-shimmer-text-color'] = props.color
  }

  if (props.shimmerColor?.trim()) {
    style['--fl-text-shimmer-highlight-color'] = props.shimmerColor
  }

  return style
})
</script>
