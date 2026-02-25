import type { App, Plugin } from 'vue'
import { FlButton, FlDialog, FlInput } from '@falcon-ui/components'

export * from '@falcon-ui/components'
export * from '@falcon-ui/hooks'
export * from '@falcon-ui/icons'
export * from '@falcon-ui/utils'

const components = [FlButton, FlDialog, FlInput] as const

export const install = (app: App) => {
  for (const component of components) {
    app.use(component)
  }
}

const FalconUI: Plugin = {
  install
}

export default FalconUI
