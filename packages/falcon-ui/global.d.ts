import 'vue'
import type {
  FlBarcode,
  FlLoading,
  FlTextShimmer,
  FlButton,
  FlDatePicker,
  FlDialog,
  FlInput,
  FlInputNumber,
  FlInputSearch,
  FlQrCode,
  FlRadialMenu,
  FlRadialMenuItem,
  FlSelect,
  FlTree,
  FlTreeSelect,
  FlTable,
  FlTableEditor
} from '@falcon-ui/components'

declare module 'vue' {
  interface GlobalComponents {
    FlLoading: typeof FlLoading
    FlTextShimmer: typeof FlTextShimmer
    FlBarcode: typeof FlBarcode
    FlButton: typeof FlButton
    FlDatePicker: typeof FlDatePicker
    FlDialog: typeof FlDialog
    FlInput: typeof FlInput
    FlInputSearch: typeof FlInputSearch
    FlInputNumber: typeof FlInputNumber
    FlQrCode: typeof FlQrCode
    FlRadialMenu: typeof FlRadialMenu
    FlRadialMenuItem: typeof FlRadialMenuItem
    FlSelect: typeof FlSelect
    FlTree: typeof FlTree
    FlTreeSelect: typeof FlTreeSelect
    FlTable: typeof FlTable
    FlTableEditor: typeof FlTableEditor
  }
}

export {}
