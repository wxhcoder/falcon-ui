<template>
  <component :is="h(ElSelect, { ...mergedSelectAttrs, ref: changeRef }, slots)" />
</template>

<script lang="ts" setup>
import { ElSelect } from 'element-plus'
import type { ComponentInstance } from 'vue'
import { computed, h, useAttrs, useSlots } from 'vue'
import { useMergedAttrs, useMergedExpose } from '@falcon-ui/hooks'
import { flSelectEmits, flSelectProps } from './select'

defineOptions({
  name: 'FlSelect',
  inheritAttrs: false
})

const props = defineProps(flSelectProps)
defineEmits(flSelectEmits)
const attrs = useAttrs()
const slots = useSlots()
const rawAttrs = attrs as Record<string, unknown>

const { changeRef } = useMergedExpose({})
const { mergedAttrs } = useMergedAttrs({
  attrs: rawAttrs,
  block: 'select',
  listenerName: 'onChange'
})

const resolveClearable = (): boolean => {
  const candidate = rawAttrs.clearable
  if (typeof candidate === 'boolean') {
    return candidate
  }

  return true
}

const mergedSelectAttrs = computed(() => ({
  ...mergedAttrs.value,
  clearable: resolveClearable(),
  class: [mergedAttrs.value.class, { 'is-error': props.isError, 'is-table': props.isTable }]
}))

defineExpose({} as ComponentInstance<typeof ElSelect>)
</script>
