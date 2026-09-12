import type { App, Plugin } from 'vue'
import {
  FlBarcode,
  FlLoading,
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

export * from '@falcon-ui/components'
export * from '@falcon-ui/hooks'
export * from '@falcon-ui/icons'
export * from '@falcon-ui/utils'

const components = [
  FlLoading,
  FlBarcode,
  FlButton,
  FlDialog,
  FlDatePicker,
  FlInput,
  FlInputSearch,
  FlInputNumber,
  FlQrCode,
  FlRadialMenu,
  FlRadialMenuItem,
  FlSelect,
  FlTree,
  FlTreeSelect,
  FlTable,
  FlTableEditor
] as const

export const install = (app: App) => {
  for (const component of components) {
    app.use(component)
  }
}

const FalconUI: Plugin = {
  install
}

export default FalconUI
