import type { FlButton, FlDialog, FlInput, FlInputNumber, FlInputSearch } from '@falcon-ui/components'

declare module 'vue' {
  interface GlobalComponents {
    FlButton: typeof FlButton
    FlDialog: typeof FlDialog
    FlInput: typeof FlInput
    FlInputSearch: typeof FlInputSearch
    FlInputNumber: typeof FlInputNumber
  }
}

export {}
