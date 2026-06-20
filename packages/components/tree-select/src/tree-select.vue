<template>
  <component :is="h(ElTreeSelect, { ...mergedTreeSelectAttrs, ref: changeRef }, slots)" />
</template>

<script lang="ts" setup>
import { ElTreeSelect } from 'element-plus'
import { computed, h, useAttrs, useSlots } from 'vue'
import { useClearableState, useMergedAttrs, useMergedExpose } from '@falcon-ui/hooks'
import type { TreeSelectExpose } from './tree-select'
import { treeSelectEmits, treeSelectProps } from './tree-select'

defineOptions({
  name: 'FlTreeSelect',
  inheritAttrs: false
})

const props = defineProps(treeSelectProps)
defineEmits(treeSelectEmits)
const attrs = useAttrs()
const slots = useSlots()
const rawAttrs = attrs as Record<string, unknown>

const { changeRef } = useMergedExpose({})
const { mergedAttrs } = useMergedAttrs({
  attrs: rawAttrs,
  block: 'tree-select',
  listenerName: 'onChange'
})

const isMultipleMode = () => rawAttrs.multiple === true || rawAttrs.multiple === ''

const { resolveClearable } = useClearableState({
  attrs: rawAttrs,
  isError: () => props.isError,
  resolveClearValue: () => (isMultipleMode() ? [] : undefined)
})

const mergedTreeSelectAttrs = computed(() => ({
  ...mergedAttrs.value,
  clearable: resolveClearable(),
  class: [mergedAttrs.value.class, { 'is-error': props.isError, 'is-table': props.isTable }]
}))

defineExpose({} as TreeSelectExpose)
</script>
