import type { FButton, FInput } from '@falcon-ui/components'

declare module 'vue' {
  interface GlobalComponents {
    FButton: typeof FButton
    FInput: typeof FInput
  }
}

export {}
