import type { FlButton, FlDialog, FlInput } from '@falcon-ui/components'

declare module 'vue' {
  interface GlobalComponents {
    FlButton: typeof FlButton
    FlDialog: typeof FlDialog
    FlInput: typeof FlInput
  }
}

export {}
