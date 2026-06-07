import type { App, Plugin } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import {
  FlBarcode,
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
  FlTable
} from '..'

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
    app.use(FlDatePicker)
    app.use(FlInput)
    app.use(FlInputSearch)
    app.use(FlInputNumber)
    app.use(FlQrCode)
    app.use(FlBarcode)
    app.use(FlRadialMenu)
    app.use(FlRadialMenuItem)
    app.use(FlSelect)
    app.use(FlTable)

    expect(app.component).toHaveBeenCalledWith('FlBarcode', FlBarcode)
    expect(app.component).toHaveBeenCalledWith('FlButton', FlButton)
    expect(app.component).toHaveBeenCalledWith('FlDialog', FlDialog)
    expect(app.component).toHaveBeenCalledWith('FlDatePicker', FlDatePicker)
    expect(app.component).toHaveBeenCalledWith('FlInput', FlInput)
    expect(app.component).toHaveBeenCalledWith('FlInputSearch', FlInputSearch)
    expect(app.component).toHaveBeenCalledWith('FlInputNumber', FlInputNumber)
    expect(app.component).toHaveBeenCalledWith('FlQrCode', FlQrCode)
    expect(app.component).toHaveBeenCalledWith('FlSelect', FlSelect)
    expect(app.component).toHaveBeenCalledWith('FlRadialMenu', FlRadialMenu)
    expect(app.component).toHaveBeenCalledWith('FlRadialMenuItem', FlRadialMenuItem)
    expect(app.component).toHaveBeenCalledWith('FlTable', FlTable)
  })
})
