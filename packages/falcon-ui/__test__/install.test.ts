import type { App, Plugin } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import FalconUI, {
  FlButton,
  FlDatePicker,
  FlDialog,
  FlInput,
  FlInputNumber,
  FlInputSearch,
  FlSelect,
  FlTable,
  FlTableEditor,
  MinusSquareOutlined,
  PlusSquareOutlined,
  install
} from '..'

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
    expect(app.component).toHaveBeenCalledWith('FlDatePicker', FlDatePicker)
    expect(app.component).toHaveBeenCalledWith('FlInput', FlInput)
    expect(app.component).toHaveBeenCalledWith('FlInputSearch', FlInputSearch)
    expect(app.component).toHaveBeenCalledWith('FlInputNumber', FlInputNumber)
    expect(app.component).toHaveBeenCalledWith('FlSelect', FlSelect)
    expect(app.component).toHaveBeenCalledWith('FlTable', FlTable)
    expect(app.component).toHaveBeenCalledWith('FlTableEditor', FlTableEditor)
    expect(app.component).not.toHaveBeenCalledWith('PlusSquareOutlined', PlusSquareOutlined)
    expect(app.component).not.toHaveBeenCalledWith('MinusSquareOutlined', MinusSquareOutlined)
  })

  it('registers all components via default plugin', () => {
    const app = createAppMock()

    app.use(FalconUI)

    expect(app.component).toHaveBeenCalledWith('FlButton', FlButton)
    expect(app.component).toHaveBeenCalledWith('FlDialog', FlDialog)
    expect(app.component).toHaveBeenCalledWith('FlDatePicker', FlDatePicker)
    expect(app.component).toHaveBeenCalledWith('FlInput', FlInput)
    expect(app.component).toHaveBeenCalledWith('FlInputSearch', FlInputSearch)
    expect(app.component).toHaveBeenCalledWith('FlInputNumber', FlInputNumber)
    expect(app.component).toHaveBeenCalledWith('FlSelect', FlSelect)
    expect(app.component).toHaveBeenCalledWith('FlTable', FlTable)
    expect(app.component).toHaveBeenCalledWith('FlTableEditor', FlTableEditor)
    expect(app.component).not.toHaveBeenCalledWith('PlusSquareOutlined', PlusSquareOutlined)
    expect(app.component).not.toHaveBeenCalledWith('MinusSquareOutlined', MinusSquareOutlined)
  })

  it('still re-exports icon components from the root entry', () => {
    expect(PlusSquareOutlined).toBeDefined()
    expect(MinusSquareOutlined).toBeDefined()
  })
})
