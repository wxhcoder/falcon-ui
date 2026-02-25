<template>
  <component :is="ElDialog" v-bind="mergedAttrs" :ref="changeRef">
    <template #header>
      <div :class="headerContentClass">
        <div :class="headerTitleClass">
          <slot v-if="slots.header" name="header" />
          <slot v-else-if="slots.title" name="title" />
          <template v-else>{{ resolvedTitle }}</template>
        </div>
        <div :class="headerActionsClass">
          <ElButton link type="primary" @click="toggleFullscreen">全屏</ElButton>
          <ElButton link type="primary" @click="closeDialog">关闭</ElButton>
        </div>
      </div>
    </template>

    <div :class="bodyInnerClass" :style="bodyStyle">
      <slot />
    </div>

    <template v-if="slots.footer || props.showFooter" #footer>
      <slot v-if="slots.footer" name="footer" />
      <div v-else :class="footerActionsClass">
        <ElButton :disabled="props.cancelDisabled" @click="handleCancel">
          {{ props.cancelText }}
        </ElButton>
        <ElButton :disabled="props.confirmDisabled" type="primary" @click="handleConfirm">
          {{ props.confirmText }}
        </ElButton>
      </div>
    </template>
  </component>
</template>

<script setup lang="ts">
import { ElButton, ElDialog } from 'element-plus'
import type { ComponentInstance, CSSProperties } from 'vue'
import { computed, ref, useAttrs, useSlots } from 'vue'
import { useMergedExpose } from '@falcon-ui/hooks'
import { invokeListener, useNamespace } from '@falcon-ui/utils'
import { flDialogEmits, flDialogProps } from './dialog'

defineOptions({
  name: 'FlDialog',
  inheritAttrs: false
})

type ClassValue = string | Record<string, boolean> | ClassValue[] | null | undefined

const omitAttrKeys = new Set([
  'align-center',
  'alignCenter',
  'body-class',
  'bodyClass',
  'class',
  'destroy-on-close',
  'destroyOnClose',
  'draggable',
  'footer-class',
  'footerClass',
  'fullscreen',
  'header-class',
  'headerClass',
  'show-close',
  'showClose',
  'transition'
])

const props = defineProps(flDialogProps)
const emit = defineEmits(flDialogEmits)
const attrs = useAttrs()
const slots = useSlots()
const ns = useNamespace('dialog')
const isFullscreen = ref(false)

const normalizeClassName = (value: ClassValue): string => {
  if (!value) {
    return ''
  }

  if (typeof value === 'string') {
    return value
      .split(' ')
      .map((item) => item.trim())
      .filter(Boolean)
      .join(' ')
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeClassName(item))
      .filter(Boolean)
      .join(' ')
      .trim()
  }

  return Object.entries(value)
    .filter(([, enabled]) => enabled)
    .map(([className]) => className)
    .join(' ')
}

const mergeClassName = (...values: ClassValue[]): string =>
  values
    .map((item) => normalizeClassName(item))
    .filter(Boolean)
    .join(' ')
    .trim()

const getAttrValue = (kebabCaseName: string, camelCaseName = kebabCaseName): unknown =>
  attrs[kebabCaseName] ?? attrs[camelCaseName]

const resolveBooleanAttr = (value: unknown, fallback: boolean): boolean => {
  if (value === undefined) {
    return fallback
  }

  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    if (!value) {
      return true
    }

    return value !== 'false'
  }

  return Boolean(value)
}

const closeDialog = () => {
  emit('update:modelValue', false)
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

const handleCancel = () => {
  emit('cancel')
  closeDialog()
}

const handleConfirm = () => {
  emit('confirm')
  closeDialog()
}

const handleModelValueUpdate = (value: boolean) => {
  emit('update:modelValue', value)
  invokeListener(attrs['onUpdate:modelValue'], value)
}

const mergedClass = computed(() => mergeClassName(ns.b(), attrs.class as ClassValue))
const mergedHeaderClass = computed(() =>
  mergeClassName(ns.e('header'), getAttrValue('header-class', 'headerClass') as ClassValue)
)
const mergedBodyClass = computed(() =>
  mergeClassName(ns.e('body'), getAttrValue('body-class', 'bodyClass') as ClassValue)
)
const mergedFooterClass = computed(() =>
  mergeClassName(ns.e('footer'), getAttrValue('footer-class', 'footerClass') as ClassValue)
)

const bodyStyle = computed<CSSProperties | undefined>(() => {
  if (props.bodyHeight === undefined || props.bodyHeight === null || props.bodyHeight === '') {
    return undefined
  }

  const height = typeof props.bodyHeight === 'number' ? `${props.bodyHeight}px` : props.bodyHeight
  return {
    height,
    overflowY: 'auto'
  }
})

const resolvedTitle = computed(() => {
  const title = attrs.title
  return typeof title === 'string' ? title : ''
})

const resolvedAlignCenter = computed(() =>
  resolveBooleanAttr(getAttrValue('align-center', 'alignCenter'), true)
)
const resolvedDestroyOnClose = computed(() =>
  resolveBooleanAttr(getAttrValue('destroy-on-close', 'destroyOnClose'), true)
)
const resolvedDraggable = computed(() => resolveBooleanAttr(getAttrValue('draggable'), true))
const resolvedShowClose = computed(() =>
  resolveBooleanAttr(getAttrValue('show-close', 'showClose'), false)
)
const resolvedTransition = computed(() => {
  const transition = getAttrValue('transition')
  return typeof transition === 'string' && transition ? transition : 'fl-dialog-bounce'
})

const forwardedAttrs = computed(() => {
  const next: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(attrs)) {
    if (!omitAttrKeys.has(key)) {
      next[key] = value
    }
  }

  return next
})

const mergedAttrs = computed(() => ({
  ...forwardedAttrs.value,
  alignCenter: resolvedAlignCenter.value,
  bodyClass: mergedBodyClass.value,
  class: mergedClass.value,
  destroyOnClose: resolvedDestroyOnClose.value,
  draggable: resolvedDraggable.value,
  footerClass: mergedFooterClass.value,
  fullscreen: isFullscreen.value,
  headerClass: mergedHeaderClass.value,
  modelValue: props.modelValue,
  showClose: resolvedShowClose.value,
  transition: resolvedTransition.value,
  'onUpdate:modelValue': handleModelValueUpdate
}))

const headerContentClass = ns.e('header-content')
const headerTitleClass = ns.e('header-title')
const headerActionsClass = ns.e('header-actions')
const bodyInnerClass = ns.e('body-inner')
const footerActionsClass = ns.e('footer-actions')

const _myExpose = {
  closeDialog,
  toggleFullscreen
}

const { changeRef } = useMergedExpose(_myExpose)

defineExpose({} as ComponentInstance<typeof ElDialog> & typeof _myExpose)
</script>
