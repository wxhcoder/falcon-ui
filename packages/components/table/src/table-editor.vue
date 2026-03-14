<template>
  <span ref="hostRef" style="display: contents">
    <slot />
  </span>
</template>

<script lang="ts" setup>
import type { ComponentPublicInstance } from 'vue'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import type { TableEditorEndpoint, TableEditorRegistry, TableEditorTarget } from './editor-registry'
import { tableEditorRegistryDomKey } from './editor-registry'
import { tableEditorProps } from './table-editor'

defineOptions({
  name: 'FlTableEditor'
})

const props = defineProps(tableEditorProps)
const hostRef = ref<HTMLElement | null>(null)

const isTextInput = (
  element: Element | null
): element is HTMLInputElement | HTMLTextAreaElement => {
  if (!element) {
    return false
  }

  if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
    return false
  }

  return element.type !== 'hidden' && !element.readOnly && !element.disabled
}

const resolveTargetValue = (): TableEditorTarget => props.targetRef?.value ?? null

const resolveRootFromTarget = (target: TableEditorTarget): HTMLElement | null => {
  if (target instanceof HTMLElement) {
    return target
  }

  const componentTarget = target as (ComponentPublicInstance & { $el?: unknown }) | null
  if (componentTarget?.$el instanceof HTMLElement) {
    return componentTarget.$el
  }

  return null
}

const resolveRootEl = (): HTMLElement | null =>
  resolveRootFromTarget(resolveTargetValue()) ?? hostRef.value

const resolveTextInputFromRoot = (root: HTMLElement | null) => {
  if (!root) {
    return null
  }

  if (isTextInput(root)) {
    return root
  }

  return root.querySelector<HTMLInputElement | HTMLTextAreaElement>(
    'input:not([type="hidden"]):not([readonly]):not([disabled]), textarea:not([readonly]):not([disabled])'
  )
}

const resolveFocusableTarget = (root: HTMLElement | null): HTMLElement | null => {
  if (!root) {
    return null
  }

  if (root.tabIndex >= 0) {
    return root
  }

  return root.querySelector<HTMLElement>(
    [
      '[role="combobox"]',
      '.el-select__wrapper',
      '.el-date-editor .el-input__wrapper',
      '.el-date-editor input',
      'input:not([type="hidden"])',
      'textarea',
      'button',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',')
  )
}

const getInstanceMethod = <TArgs extends unknown[]>(
  name: string
): ((...args: TArgs) => unknown) | null => {
  const target = resolveTargetValue()
  if (!target || target instanceof HTMLElement) {
    return null
  }

  const candidate = (target as ComponentPublicInstance & Record<string, unknown>)[name]
  return typeof candidate === 'function' ? (candidate as (...args: TArgs) => unknown) : null
}

const cloneKeyboardEventInit = (event: KeyboardEvent) => ({
  key: event.key,
  code: event.code,
  location: event.location,
  repeat: event.repeat,
  ctrlKey: event.ctrlKey,
  shiftKey: event.shiftKey,
  altKey: event.altKey,
  metaKey: event.metaKey,
  bubbles: true,
  cancelable: true,
  composed: true
})

const dispatchKeyboardEvent = (target: HTMLElement, event: KeyboardEvent) =>
  target.dispatchEvent(new KeyboardEvent('keydown', cloneKeyboardEventInit(event)))

const waitForNextMacroTask = () =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, 0)
  })

const dispatchInputEvents = (
  target: HTMLInputElement | HTMLTextAreaElement,
  inputType: string,
  data: string | null
) => {
  target.dispatchEvent(
    new InputEvent('input', {
      bubbles: true,
      data,
      inputType
    })
  )
  target.dispatchEvent(new Event('input', { bubbles: true }))
}

const insertText = (target: HTMLInputElement | HTMLTextAreaElement, text: string) => {
  const start = target.selectionStart ?? target.value.length
  const end = target.selectionEnd ?? target.value.length

  target.setRangeText(text, start, end, 'end')
  dispatchInputEvents(target, 'insertText', text)
}

const deleteText = (
  target: HTMLInputElement | HTMLTextAreaElement,
  direction: 'backward' | 'forward'
) => {
  const start = target.selectionStart ?? target.value.length
  const end = target.selectionEnd ?? target.value.length

  if (start !== end) {
    target.setRangeText('', start, end, 'start')
  } else if (direction === 'backward' && start > 0) {
    target.setRangeText('', start - 1, start, 'start')
  } else if (direction === 'forward' && end < target.value.length) {
    target.setRangeText('', start, start + 1, 'start')
  }

  dispatchInputEvents(
    target,
    direction === 'backward' ? 'deleteContentBackward' : 'deleteContentForward',
    null
  )
}

const focusTextTarget = () => {
  const input = resolveTextInputFromRoot(resolveRootEl())
  input?.focus()
  return input
}

const focusControlledTarget = async () => {
  const instanceFocus = getInstanceMethod<[]>('focus')
  if (instanceFocus) {
    await Promise.resolve(instanceFocus())
  }

  const focusTarget = resolveFocusableTarget(resolveRootEl())
  focusTarget?.focus()
  return focusTarget
}

const focusEditor = async () => {
  if (props.mode === 'text') {
    focusTextTarget()
    return
  }

  await focusControlledTarget()
}

const blurEditor = async () => {
  const activeElement = document.activeElement
  const root = resolveRootEl()

  if (activeElement instanceof HTMLElement && root?.contains(activeElement)) {
    activeElement.blur()
  }

  const instanceBlur = getInstanceMethod<[]>('blur')
  if (instanceBlur) {
    await Promise.resolve(instanceBlur())
  }
}

const openEditor = async () => {
  const handleOpen = getInstanceMethod<[]>('handleOpen')
  if (handleOpen) {
    await Promise.resolve(handleOpen())
    return
  }

  const focusTarget = resolveFocusableTarget(resolveRootEl())
  if (!focusTarget) {
    return
  }

  focusTarget.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }))
  focusTarget.click()
}

const closeEditor = async () => {
  const handleClose = getInstanceMethod<[]>('handleClose')
  if (handleClose) {
    await Promise.resolve(handleClose())
    return
  }

  const focusTarget = resolveFocusableTarget(resolveRootEl())
  if (focusTarget) {
    focusTarget.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        code: 'Escape',
        bubbles: true,
        cancelable: true
      })
    )
  }
}

const handoffTextKey = async (event: KeyboardEvent) => {
  const input = focusTextTarget()
  if (!input) {
    return false
  }

  dispatchKeyboardEvent(input, event)

  if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
    insertText(input, event.key)
    return true
  }

  if (event.key === 'Backspace') {
    deleteText(input, 'backward')
    return true
  }

  if (event.key === 'Delete') {
    deleteText(input, 'forward')
    return true
  }

  if (event.key === 'Enter' || event.key === 'F2') {
    return true
  }

  return false
}

const handoffControlledKey = async (event: KeyboardEvent) => {
  const focusTarget = await focusControlledTarget()
  await openEditor()
  await nextTick()
  await waitForNextMacroTask()

  const input = resolveTextInputFromRoot(resolveRootEl())
  if (input) {
    return handoffTextKey(event)
  }

  const target = (document.activeElement as HTMLElement | null) ?? focusTarget
  if (!target) {
    return false
  }

  dispatchKeyboardEvent(target, event)
  return true
}

const endpoint: TableEditorEndpoint = {
  id: Symbol('table-editor'),
  getRootEl: () => resolveRootEl(),
  focus: () => focusEditor(),
  blur: () => blurEditor(),
  handoffFirstKey: (event) =>
    props.mode === 'text' ? handoffTextKey(event) : handoffControlledKey(event),
  open: () => openEditor(),
  close: () => closeEditor(),
  get isFixedClone() {
    return Boolean(resolveRootEl()?.closest('.el-table__fixed, .el-table__fixed-right'))
  },
  priority: props.priority
}

let unregister: (() => void) | null = null

const resolveRegistry = async (): Promise<TableEditorRegistry | null> => {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const tableRoot = resolveRootEl()?.closest('.fl-table') as
      | (HTMLElement & { [tableEditorRegistryDomKey]?: TableEditorRegistry })
      | null

    if (tableRoot?.[tableEditorRegistryDomKey]) {
      return tableRoot[tableEditorRegistryDomKey] ?? null
    }

    await nextTick()
  }

  return null
}

onMounted(() => {
  void (async () => {
    const registry = await resolveRegistry()
    if (!registry) {
      return
    }

    unregister = registry.register(endpoint)
  })()
})

onBeforeUnmount(() => {
  unregister?.()
  unregister = null
})
</script>
