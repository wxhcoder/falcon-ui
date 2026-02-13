import type { App, Plugin } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { FButton, FInput } from '..'

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

    app.use(FInput)

    expect(app.component).toHaveBeenCalledWith('FInput', FInput)
  })

  it('exports installable components', () => {
    const app = createAppMock()

    app.use(FButton)
    app.use(FInput)

    expect(app.component).toHaveBeenCalledWith('FButton', FButton)
    expect(app.component).toHaveBeenCalledWith('FInput', FInput)
  })
})
