import type { App, Plugin } from 'vue'
import {
  FlButton,
  FlDatePicker,
  FlDialog,
  FlInput,
  FlInputNumber,
  FlInputSearch,
  FlSelect
} from '@falcon-ui/components'

export * from '@falcon-ui/components'
export * from '@falcon-ui/hooks'
export * from '@falcon-ui/icons'
export * from '@falcon-ui/utils'

const components = [
  FlButton,
  FlDialog,
  FlDatePicker,
  FlInput,
  FlInputSearch,
  FlInputNumber,
  FlSelect
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
