import type { FlButton, FlInput } from '@falcon-ui/components'

declare module 'vue' {
  interface GlobalComponents {
    FlButton: typeof FlButton
    FlInput: typeof FlInput
  }
}

export {}
