import { watch } from 'vue'
import { invokeListener } from '@falcon-ui/utils'

export type ClearValueResolver = () => unknown

export interface UseClearableStateOptions {
  attrs: Record<string, unknown>
  isError: () => boolean
  resolveClearValue?: ClearValueResolver
}

export const useClearableState = ({
  attrs,
  isError,
  resolveClearValue = () => undefined
}: UseClearableStateOptions) => {
  const resolveClearable = (): boolean => {
    const candidate = attrs.clearable
    if (typeof candidate === 'boolean') {
      return candidate
    }

    return true
  }

  const clearModelValue = () => {
    invokeListener(attrs['onUpdate:modelValue'], resolveClearValue())
  }

  watch(
    isError,
    (active, previousActive) => {
      if (active && previousActive !== true) {
        clearModelValue()
      }
    },
    { immediate: true }
  )

  return {
    clearModelValue,
    resolveClearable
  }
}
