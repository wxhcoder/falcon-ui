<template>
  <component :is="h(ElDatePicker, { ...mergedDatePickerAttrs, ref: changeRef }, slots)" />
</template>

<script lang="ts" setup>
import { ElDatePicker } from 'element-plus'
import type { ComponentInstance } from 'vue'
import { computed, h, useAttrs, useSlots, watch } from 'vue'
import { useMergedAttrs, useMergedExpose } from '@falcon-ui/hooks'
import { flDatePickerEmits, flDatePickerProps } from './date-picker'
import type { FlDatePickerValue } from './date-picker'

defineOptions({
  name: 'FlDatePicker',
  inheritAttrs: false
})

const props = defineProps(flDatePickerProps)
const emit = defineEmits(flDatePickerEmits)
const attrs = useAttrs()
const slots = useSlots()
const rawAttrs = attrs as Record<string, unknown>

const { changeRef } = useMergedExpose({})
const { mergedAttrs } = useMergedAttrs({
  attrs: rawAttrs,
  block: 'date-picker',
  listenerName: 'onChange'
})

const updateModelValue = (value: FlDatePickerValue) => {
  if (props.isError) {
    emit('update:modelValue', null)
    return
  }

  emit('update:modelValue', value)
}

const mergedDatePickerAttrs = computed(() => ({
  ...mergedAttrs.value,
  modelValue: props.modelValue,
  'onUpdate:modelValue': updateModelValue,
  class: [mergedAttrs.value.class, { 'is-error': props.isError, 'is-table': props.isTable }]
}))

const clearModelValue = () => {
  emit('update:modelValue', null)
}

watch(
  () => props.isError,
  (isError, previousIsError) => {
    if (isError && previousIsError !== true) {
      clearModelValue()
    }
  },
  { immediate: true }
)

defineExpose({} as ComponentInstance<typeof ElDatePicker>)
</script>
