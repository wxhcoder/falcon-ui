import type { App, Plugin } from 'vue'
import {
  FlBarcode,
  FlButton,
  FlDatePicker,
  FlDialog,
  FlInput,
  FlInputNumber,
  FlInputSearch,
  FlQrCode,
  FlSelect,
  FlTree,
  FlTable,
  FlTableEditor
} from '@falcon-ui/components'

export * from '@falcon-ui/components'
export * from '@falcon-ui/hooks'
export * from '@falcon-ui/icons'
export * from '@falcon-ui/utils'

const components = [
  FlBarcode,
  FlButton,
  FlDialog,
  FlDatePicker,
  FlInput,
  FlInputSearch,
  FlInputNumber,
  FlQrCode,
  FlSelect,
  FlTree,
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
