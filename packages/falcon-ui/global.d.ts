import type {
  FlButton,
  FlDatePicker,
  FlDialog,
  FlInput,
  FlInputNumber,
  FlInputSearch,
  FlSelect,
  FlTable,
  FlTableEditor
} from '@falcon-ui/components'

declare module 'vue' {
  interface GlobalComponents {
    FlButton: typeof FlButton
    FlDatePicker: typeof FlDatePicker
    FlDialog: typeof FlDialog
    FlInput: typeof FlInput
    FlInputSearch: typeof FlInputSearch
    FlInputNumber: typeof FlInputNumber
    FlSelect: typeof FlSelect
    FlTable: typeof FlTable
    FlTableEditor: typeof FlTableEditor
  }
}

export {}
