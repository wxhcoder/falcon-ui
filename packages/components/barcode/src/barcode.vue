<template>
  <svg ref="svgRef" class="fl-barcode" v-bind="attrs"></svg>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue'
import { flBarcodeProps } from './barcode'
import type { FlBarcodeFormat } from './barcode'

defineOptions({
  name: 'FlBarcode',
  inheritAttrs: false
})

type JsBarcodeRenderer = (
  element: SVGSVGElement,
  value: string,
  options: Record<string, unknown>
) => void

type JsBarcodeModule = {
  default: JsBarcodeRenderer
}

const props = defineProps(flBarcodeProps)
const attrs = useAttrs()
const svgRef = ref<SVGSVGElement | null>(null)

let renderVersion = 0
let jsBarcodeModulePromise: Promise<JsBarcodeModule> | null = null

const clearSvg = (svg: SVGSVGElement) => {
  svg.innerHTML = ''
}

const resolveFormat = (format: FlBarcodeFormat): string => {
  const normalized = String(format).toUpperCase()

  if (normalized === 'UPCA') {
    return 'UPC'
  }

  return normalized
}

const buildOptions = (): Record<string, unknown> => {
  const options: Record<string, unknown> = {
    format: resolveFormat(props.format),
    width: props.width,
    height: props.height,
    lineColor: props.color,
    background: props.backgroundColor,
    displayValue: props.displayValue,
    text: props.text === '' ? undefined : props.text,
    font: props.font,
    fontOptions: props.fontOptions,
    fontSize: props.fontSize,
    textAlign: props.textAlign,
    textPosition: props.textPosition,
    textMargin: props.textMargin,
    margin: props.margin
  }

  if (props.marginTop !== undefined) {
    options.marginTop = props.marginTop
  }

  if (props.marginRight !== undefined) {
    options.marginRight = props.marginRight
  }

  if (props.marginBottom !== undefined) {
    options.marginBottom = props.marginBottom
  }

  if (props.marginLeft !== undefined) {
    options.marginLeft = props.marginLeft
  }

  return options
}

const loadJsBarcode = async (): Promise<JsBarcodeRenderer> => {
  if (!jsBarcodeModulePromise) {
    jsBarcodeModulePromise = import('jsbarcode') as Promise<JsBarcodeModule>
  }

  const module = await jsBarcodeModulePromise
  return module.default
}

const renderBarcode = async () => {
  const currentVersion = ++renderVersion
  const svg = svgRef.value

  if (!svg) {
    return
  }

  clearSvg(svg)

  if (props.value === '') {
    return
  }

  const JsBarcode = await loadJsBarcode()
  if (currentVersion !== renderVersion) {
    return
  }

  JsBarcode(svg, props.value, buildOptions())
}

const watchSources = () => [
  props.value,
  props.format,
  props.width,
  props.height,
  props.color,
  props.backgroundColor,
  props.displayValue,
  props.text,
  props.font,
  props.fontOptions,
  props.fontSize,
  props.textAlign,
  props.textPosition,
  props.textMargin,
  props.margin,
  props.marginTop,
  props.marginRight,
  props.marginBottom,
  props.marginLeft
]

onMounted(() => {
  void renderBarcode()
})

watch(
  watchSources,
  () => {
    void renderBarcode()
  },
  { flush: 'post' }
)

onBeforeUnmount(() => {
  renderVersion += 1
})
</script>
