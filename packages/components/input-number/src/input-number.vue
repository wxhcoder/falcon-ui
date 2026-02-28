<template>
  <component :is="ElInput" v-bind="mergedInputAttrs" :ref="changeRef">
    <template v-for="(_, slotName) in slots" :key="String(slotName)" #[slotName]="slotScope">
      <slot :name="slotName" v-bind="slotScope || {}" />
    </template>
  </component>
</template>

<script lang="ts" setup>
import { ElInput } from 'element-plus'
import type { ComponentInstance } from 'vue'
import { computed, ref, useAttrs, useSlots, watch } from 'vue'
import { useMergedExpose } from '@falcon-ui/hooks'
import { invokeListener, useNamespace } from '@falcon-ui/utils'
import type { FlInputNumberPrecisionMode } from './input-number'
import { flInputNumberEmits, flInputNumberProps } from './input-number'

defineOptions({
  name: 'FlInputNumber',
  inheritAttrs: false
})

type NumberLike = number | string | null | undefined
type InputMode = 'text' | 'search' | 'email' | 'tel' | 'url' | 'none' | 'numeric' | 'decimal'
type FormatterFn = (value: string) => string
type ParserFn = (value: string) => string

const props = defineProps(flInputNumberProps)
const emit = defineEmits(flInputNumberEmits)
const attrs = useAttrs()
const slots = useSlots()
const ns = useNamespace('input-number')
const rawAttrs = attrs as Record<string, unknown>

const displayValue = ref('')
const strictErrorActive = ref(false)
const isFocused = ref(false)

const precisionValue = computed(() => {
  if (!Number.isFinite(props.precision) || props.precision < 0) {
    return 0
  }

  return Math.trunc(props.precision)
})

const resolvedPlaceholder = computed(() => {
  if (strictErrorActive.value) {
    return props.strictErrorPlaceholder
  }

  const candidate = rawAttrs.placeholder
  return typeof candidate === 'string' ? candidate : undefined
})

const mergedIsError = computed(() => props.isError || strictErrorActive.value)

const validInputModes = new Set<InputMode>([
  'text',
  'search',
  'email',
  'tel',
  'url',
  'none',
  'numeric',
  'decimal'
])

const defaultNumberFormatter = new Intl.NumberFormat('en-US', {
  useGrouping: true,
  maximumFractionDigits: 20
})

const toNumeric = (value: NumberLike): number | null => {
  if (value === null || value === undefined || value === '') {
    return null
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  if (!/^-?(?:\d+\.?\d*|\.\d+)$/.test(trimmed)) {
    return null
  }

  const next = Number(trimmed)
  return Number.isFinite(next) ? next : null
}

const toRawString = (value: number): string => {
  if (Object.is(value, -0)) {
    return '0'
  }

  return `${value}`
}

const defaultElInputFormatter: FormatterFn = (value) => {
  const numericValue = toNumeric(value)
  if (numericValue === null) {
    return value
  }

  return defaultNumberFormatter.format(numericValue)
}

const defaultElInputParser: ParserFn = (value) => value.replace(/,/g, '').trim()

const sanitizeNumericInput = (value: string): string => {
  if (!value) {
    return ''
  }

  let filtered = value.replace(/[^\d.-]/g, '')
  const isNegative = filtered.startsWith('-')
  filtered = filtered.replace(/-/g, '')

  const dotIndex = filtered.indexOf('.')
  if (dotIndex !== -1) {
    const integerPart = filtered.slice(0, dotIndex)
    const decimalPart = filtered.slice(dotIndex + 1).replace(/\./g, '')
    filtered = `${integerPart}.${decimalPart}`
  }

  return `${isNegative ? '-' : ''}${filtered}`
}

const isPartialNumber = (value: string): boolean => value === '-' || value === '.' || value === '-.'

const countFractionLength = (value: string): number => {
  const dotIndex = value.indexOf('.')
  if (dotIndex < 0) {
    return 0
  }

  return value.slice(dotIndex + 1).length
}

const applyPrecision = (
  value: number,
  mode: FlInputNumberPrecisionMode,
  precision: number
): number => {
  if (precision < 0) {
    return value
  }

  if (mode === 'ROUND') {
    return Number(value.toFixed(precision))
  }

  if (mode === 'FIXED') {
    const factor = 10 ** precision
    return Math.trunc(value * factor) / factor
  }

  return value
}

const emitModelValue = (value: number | null) => {
  emit('update:modelValue', value)
}

const emitStrictErrorState = (active: boolean) => {
  if (strictErrorActive.value === active) {
    return
  }

  strictErrorActive.value = active
  emit('update:isError', active)
}

const clearModelValue = () => {
  emitModelValue(null)
  displayValue.value = ''
}

const syncDisplayFromModel = (value: number | null) => {
  if (value === null) {
    displayValue.value = ''
    return
  }

  displayValue.value = toRawString(value)
}

const handleCustomPayload = (rawValue: string, value: number | null) => {
  emit('custom-input', { rawValue, value })
}

const handleInput = (value: unknown) => {
  const input = typeof value === 'string' ? value : ''
  const sanitized = sanitizeNumericInput(input)
  displayValue.value = sanitized

  if (strictErrorActive.value) {
    emitStrictErrorState(false)
  }

  if (!sanitized || isPartialNumber(sanitized)) {
    emitModelValue(null)
    handleCustomPayload(sanitized, null)
    return
  }

  const numericValue = toNumeric(sanitized)
  if (numericValue === null) {
    clearModelValue()
    handleCustomPayload('', null)
    return
  }

  emitModelValue(numericValue)
  handleCustomPayload(sanitized, numericValue)
}

const handleStrictError = (rawValue: string, actualPrecision: number) => {
  emit('strict-error', {
    rawValue,
    precision: precisionValue.value,
    actualPrecision
  })
  emitStrictErrorState(true)
  clearModelValue()
}

const handleChange = (value: unknown) => {
  const input = typeof value === 'string' ? sanitizeNumericInput(value) : ''

  if (!input || isPartialNumber(input)) {
    clearModelValue()
    return
  }

  const numericValue = toNumeric(input)
  if (numericValue === null) {
    clearModelValue()
    return
  }

  const actualPrecision = countFractionLength(input)
  if (actualPrecision > precisionValue.value && props.precisionMode === 'STRICT') {
    handleStrictError(input, actualPrecision)
    return
  }

  const nextValue = applyPrecision(numericValue, props.precisionMode, precisionValue.value)
  emitModelValue(nextValue)
  emitStrictErrorState(false)
  syncDisplayFromModel(nextValue)
}

const handleFocus = (evt: FocusEvent) => {
  isFocused.value = true

  const current = toNumeric(props.modelValue)
  if (current !== null) {
    displayValue.value = toRawString(current)
  }

  invokeListener(rawAttrs.onFocus, evt)
}

const handleBlur = (evt: FocusEvent) => {
  isFocused.value = false

  const current = toNumeric(props.modelValue)
  syncDisplayFromModel(current)
  invokeListener(rawAttrs.onBlur, evt)
}

const resolveInputMode = (): InputMode => {
  const candidate = rawAttrs.inputmode
  if (typeof candidate === 'string' && validInputModes.has(candidate as InputMode)) {
    return candidate as InputMode
  }

  return 'decimal'
}

const resolveFormatter = (): FormatterFn | undefined => {
  if (!props.isFormat || isFocused.value) {
    return undefined
  }

  const formatter = rawAttrs.formatter
  if (typeof formatter === 'function') {
    return formatter as FormatterFn
  }

  return defaultElInputFormatter
}

const resolveParser = (): ParserFn | undefined => {
  if (!props.isFormat || isFocused.value) {
    return undefined
  }

  const parser = rawAttrs.parser
  if (typeof parser === 'function') {
    return parser as ParserFn
  }

  if (typeof rawAttrs.formatter === 'function') {
    return undefined
  }

  return defaultElInputParser
}

const mergedInputAttrs = computed(() => {
  const originalInputListener = rawAttrs.onInput
  const originalChangeListener = rawAttrs.onChange

  return {
    ...rawAttrs,
    class: [
      ns.b(),
      rawAttrs.class,
      {
        'is-error': mergedIsError.value,
        'is-table': props.isTable
      }
    ],
    modelValue: displayValue.value,
    placeholder: resolvedPlaceholder.value,
    inputmode: resolveInputMode(),
    formatter: resolveFormatter(),
    parser: resolveParser(),
    'onUpdate:modelValue': undefined,
    onInput: (value: string) => {
      handleInput(value)
      invokeListener(originalInputListener, value)
    },
    onChange: (value: string) => {
      handleChange(value)
      invokeListener(originalChangeListener, value)
    },
    onFocus: handleFocus,
    onBlur: handleBlur
  }
})

watch(
  () => props.modelValue,
  (value) => {
    const numericValue = toNumeric(value)

    if (numericValue === null) {
      displayValue.value = ''
      if (value !== null && value !== undefined && value !== '') {
        emitModelValue(null)
      }
      return
    }

    if (typeof value === 'string') {
      emitModelValue(numericValue)
    }

    syncDisplayFromModel(numericValue)
  },
  { immediate: true }
)

watch(
  () => props.isError,
  (isError, previousIsError) => {
    if (isError && previousIsError !== true) {
      clearModelValue()
    }
  },
  { immediate: true }
)

watch(
  () => props.isFormat,
  () => {
    const numericValue = toNumeric(props.modelValue)
    syncDisplayFromModel(numericValue)
  }
)

const _myExpose = {
  /**
   * FlInputNumber 额外暴露的方法，用于联调验证。
   */
  myMethod() {
    console.log('my method!')
  },
  /**
   * FlInputNumber 额外暴露的示例数值。
   */
  myValue: 123
}

const { changeRef } = useMergedExpose(_myExpose)

defineExpose({} as ComponentInstance<typeof ElInput> & typeof _myExpose)
</script>
