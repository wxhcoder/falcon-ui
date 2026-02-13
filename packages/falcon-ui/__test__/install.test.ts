import type { App, Plugin } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import FalconUI, { FButton, FInput, install } from '..'

const createAppMock = (): App => {
  const app = {
    component: vi.fn(() => app),
    use: vi.fn((plugin: Plugin) => {
      if (typeof plugin === 'function') {
        plugin(app)
      } else {
        plugin.install(app)
      }

      return app
    })
  }

  return app as unknown as App
}

describe('@falcon-ui/falcon-ui install', () => {
  it('registers all components via named install', () => {
    const app = createAppMock()

    install(app)

    expect(app.component).toHaveBeenCalledWith('FButton', FButton)
    expect(app.component).toHaveBeenCalledWith('FInput', FInput)
  })

  it('registers all components via default plugin', () => {
    const app = createAppMock()

    app.use(FalconUI)

    expect(app.component).toHaveBeenCalledWith('FButton', FButton)
    expect(app.component).toHaveBeenCalledWith('FInput', FInput)
  })
})
