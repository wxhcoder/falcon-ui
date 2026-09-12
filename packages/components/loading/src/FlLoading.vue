<template>
  <span
    ref="root"
    :class="[ns.b(), ns.m(layout), ns.is('inactive', !active)]"
    :style="{ '--fl-loading-size': `${resolvedSize}px` }"
    :role="active ? 'status' : undefined"
    :aria-live="active ? 'polite' : 'off'"
    :aria-hidden="!active || undefined"
    :aria-label="!text && !$slots.text ? ariaLabel : undefined">
    <span :class="ns.e('visual')" aria-hidden="true">
      <canvas
        v-show="available"
        ref="canvas"
        :class="ns.e('canvas')"
        :style="{ width: `${resolvedSize}px`, height: `${resolvedSize}px` }" />
      <span v-if="!available" :class="ns.e('fallback')" :style="{ color: resolvedColor }">●</span>
    </span>
    <span v-if="text || $slots.text" :class="ns.e('text')"
      ><slot name="text">{{ text }}</slot></span
    >
  </span>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useNamespace } from '@falcon-ui/utils'
import { flLoadingProps, normalizeSize } from './loading'
import { useLoadingColor } from './use-loading-color'
import { useLoadingAnimation } from './use-loading-animation'

defineOptions({ name: 'FlLoading' })
const props = defineProps(flLoadingProps)
defineSlots<{ text?: () => unknown }>()
const ns = useNamespace('loading')
const root = ref<HTMLSpanElement>()
const canvas = ref<HTMLCanvasElement>()
const resolvedSize = computed(() => normalizeSize(props.size))
const resolvedColor = useLoadingColor(
  () => root.value,
  () => props
)
const { available } = useLoadingAnimation(canvas, () => props, resolvedColor)
</script>
