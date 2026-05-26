import type {
  FlBarcode,
  FlButton,
  FlDatePicker,
  FlDialog,
  FlInput,
  FlInputNumber,
  FlInputSearch,
  FlQrCode,
  FlRadialMenu,
  FlSelect,
  FlTree,
  FlTable,
  FlTableEditor
} from '@falcon-ui/components'

declare module 'vue' {
  interface GlobalComponents {
    FlBarcode: typeof FlBarcode
    FlButton: typeof FlButton
    FlDatePicker: typeof FlDatePicker
    FlDialog: typeof FlDialog
    FlInput: typeof FlInput
    FlInputSearch: typeof FlInputSearch
    FlInputNumber: typeof FlInputNumber
    FlQrCode: typeof FlQrCode
    FlRadialMenu: typeof FlRadialMenu
    FlSelect: typeof FlSelect
    FlTree: typeof FlTree
    FlTable: typeof FlTable
    FlTableEditor: typeof FlTableEditor
  }
}

export {}
