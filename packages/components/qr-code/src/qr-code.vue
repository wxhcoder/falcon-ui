<template>
  <div class="fl-qr-code" v-bind="attrs" :style="rootStyle" role="img">
    <div ref="renderRef" class="fl-qr-code__render" :style="renderStyle" />
    <div v-if="shouldShowIcon" class="fl-qr-code__icon" :style="iconWrapStyle">
      <img :src="props.iconSrc" alt="" class="fl-qr-code__icon-image" :style="iconImageStyle" />
    </div>
  </div>
</template>

<script setup lang="ts">
import * as QRCode from 'qrcode'
import type { QRCodeRenderersOptions } from 'qrcode'
import type { CSSProperties } from 'vue'
import { computed, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue'
import { flQrCodeProps } from './qr-code'

defineOptions({
  name: 'FlQrCode',
  inheritAttrs: false
})

const props = defineProps(flQrCodeProps)
const attrs = useAttrs()

const renderRef = ref<HTMLDivElement | null>(null)
const isMounted = ref(false)
const hasRendered = ref(false)
let renderToken = 0

const resolvedSize = computed(() =>
  Number.isFinite(props.size) && props.size > 0 ? Math.trunc(props.size) : 0
)
const resolvedPadding = computed(() =>
  Number.isFinite(props.padding) && props.padding >= 0 ? Math.trunc(props.padding) : -1
)
const resolvedRenderSize = computed(() => resolvedSize.value - resolvedPadding.value * 2)
const resolvedIconSize = computed(() =>
  Number.isFinite(props.iconSize) && props.iconSize > 0 ? Math.trunc(props.iconSize) : 0
)

const rootStyle = computed<CSSProperties>(() => ({
  width: `${resolvedSize.value}px`,
  height: `${resolvedSize.value}px`,
  position: 'relative',
  display: 'inline-block',
  overflow: 'hidden',
  backgroundColor: props.backgroundColor
}))

const renderStyle = computed<CSSProperties>(() => ({
  position: 'absolute',
  inset: `${resolvedPadding.value}px`,
  width: 'auto',
  height: 'auto'
}))

const shouldShowIcon = computed(() => hasRendered.value && Boolean(props.iconSrc))

const iconWrapStyle = computed<CSSProperties>(() => ({
  position: 'absolute',
  left: '50%',
  top: '50%',
  width: `${resolvedIconSize.value}px`,
  height: `${resolvedIconSize.value}px`,
  transform: 'translate(-50%, -50%)',
  overflow: 'hidden',
  borderRadius: `${props.iconBorderRadius}px`,
  backgroundColor: props.iconBackgroundColor,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none'
}))

const iconImageStyle = computed<CSSProperties>(() => ({
  width: '100%',
  height: '100%',
  display: 'block',
  objectFit: 'cover'
}))

const clearRender = () => {
  const container = renderRef.value
  if (!container) return

  container.innerHTML = ''
  hasRendered.value = false
}

const buildRenderOptions = (): QRCodeRenderersOptions => ({
  width: resolvedRenderSize.value,
  margin: 0,
  errorCorrectionLevel: props.errorCorrectionLevel,
  color: {
    dark: props.color,
    light: props.backgroundColor
  }
})

const renderCanvas = async (token: number) => {
  const container = renderRef.value
  if (!container) return

  container.innerHTML = ''
  const canvas = document.createElement('canvas')
  container.appendChild(canvas)

  await QRCode.toCanvas(canvas, props.value, buildRenderOptions())
  if (token !== renderToken) {
    return
  }

  hasRendered.value = true
}

const renderSvg = async (token: number) => {
  const container = renderRef.value
  if (!container) return

  const svg = await QRCode.toString(props.value, {
    ...buildRenderOptions(),
    type: 'svg'
  })
  if (token !== renderToken) {
    return
  }

  container.innerHTML = svg
  hasRendered.value = true
}

const renderCurrent = async () => {
  if (!isMounted.value) return

  const token = ++renderToken
  const container = renderRef.value
  if (!container) return

  clearRender()

  if (!props.value) return
  if (resolvedSize.value <= 0) {
    throw new RangeError('Invalid size')
  }
  if (resolvedPadding.value < 0) {
    throw new RangeError('Invalid padding')
  }
  if (resolvedPadding.value * 2 >= resolvedSize.value) {
    throw new RangeError('Padding is too large')
  }

  if (props.type === 'canvas') {
    await renderCanvas(token)
  } else {
    await renderSvg(token)
  }
}

watch(
  () => [
    props.value,
    props.size,
    props.color,
    props.backgroundColor,
    props.padding,
    props.errorCorrectionLevel,
    props.type
  ],
  () => {
    if (!isMounted.value) return
    void renderCurrent()
  },
  { flush: 'post' }
)

onMounted(() => {
  isMounted.value = true
  void renderCurrent()
})

onBeforeUnmount(() => {
  renderToken += 1
  clearRender()
})
</script>
