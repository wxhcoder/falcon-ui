import { computed, getCurrentInstance } from 'vue'
import { invokeListener, mergeComponentExpose, useNamespace } from '@falcon-ui/utils'

type UseMergedAttrsOptions = {
  attrs: Record<string, unknown>
  block: string
  listenerName: string
  onListener?: (...args: unknown[]) => void
}

export const useMergedAttrs = ({
  attrs,
  block,
  listenerName,
  onListener
}: UseMergedAttrsOptions) => {
  const ns = useNamespace(block)
  const className = ns.b()

  const mergedAttrs = computed(() => {
    const next = { ...attrs }
    const originalListener = next[listenerName]
    next.class = [className, next.class]

    next[listenerName] = (...args: unknown[]) => {
      onListener?.(...args)
      invokeListener(originalListener, ...args)
    }

    return next
  })

  return {
    mergedAttrs
  }
}

export const useMergedExpose = <TExpose extends Record<string, unknown>>(extras: TExpose) => {
  const vm = getCurrentInstance()

  const changeRef = (exposed: unknown) => {
    mergeComponentExpose(vm, exposed, extras)
  }

  return {
    changeRef
  }
}
