import type { App, Plugin } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import FalconUI, { FlButton, FlDialog, FlInput, install } from '..'

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

    expect(app.component).toHaveBeenCalledWith('FlButton', FlButton)
    expect(app.component).toHaveBeenCalledWith('FlDialog', FlDialog)
    expect(app.component).toHaveBeenCalledWith('FlInput', FlInput)
  })

  it('registers all components via default plugin', () => {
    const app = createAppMock()

    app.use(FalconUI)

    expect(app.component).toHaveBeenCalledWith('FlButton', FlButton)
    expect(app.component).toHaveBeenCalledWith('FlDialog', FlDialog)
    expect(app.component).toHaveBeenCalledWith('FlInput', FlInput)
  })
})
