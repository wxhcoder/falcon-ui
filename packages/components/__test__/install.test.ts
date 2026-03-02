import type { App, Plugin } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { FlButton, FlDialog, FlInput, FlInputNumber, FlInputSearch } from '..'

type AppMock = App & {
  _registered: Record<string, unknown>
}

const createAppMock = (): AppMock => {
  const registered: Record<string, unknown> = {}

  const app = {
    _registered: registered,
    component: vi.fn((name: string, component: unknown) => {
      registered[name] = component
      return app
    }),
    use: vi.fn((plugin: Plugin) => {
      if (typeof plugin === 'function') {
        plugin(app)
      } else {
        plugin.install(app)
      }

      return app
    })
  }

  return app as unknown as AppMock
}

describe('@falcon-ui/components exports', () => {
  it('supports single component install via app.use', () => {
    const app = createAppMock()

    app.use(FlInput)

    expect(app.component).toHaveBeenCalledWith('FlInput', FlInput)
  })

  it('exports installable components', () => {
    const app = createAppMock()

    app.use(FlButton)
    app.use(FlDialog)
    app.use(FlInput)
    app.use(FlInputSearch)
    app.use(FlInputNumber)

    expect(app.component).toHaveBeenCalledWith('FlButton', FlButton)
    expect(app.component).toHaveBeenCalledWith('FlDialog', FlDialog)
    expect(app.component).toHaveBeenCalledWith('FlInput', FlInput)
    expect(app.component).toHaveBeenCalledWith('FlInputSearch', FlInputSearch)
    expect(app.component).toHaveBeenCalledWith('FlInputNumber', FlInputNumber)
  })
})
