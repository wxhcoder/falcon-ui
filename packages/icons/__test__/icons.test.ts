import { mount } from '@vue/test-utils'
import type { App, Plugin } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { HolderOutlined, MinusSquareOutlined, PlusSquareOutlined } from '..'
import {
  HolderOutlined as FalconHolderOutlined,
  MinusSquareOutlined as FalconMinusSquareOutlined,
  PlusSquareOutlined as FalconPlusSquareOutlined
} from '../../falcon-ui'

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

describe('@falcon-ui/icons', () => {
  it('renders PlusSquareOutlined with the Element Plus SVG contract', () => {
    const wrapper = mount(PlusSquareOutlined)
    const svg = wrapper.get('svg')
    const paths = wrapper.findAll('path')

    expect(svg.attributes('viewBox')).toBe('0 0 1024 1024')
    expect(paths).toHaveLength(3)
    expect(paths[0].attributes('fill')).toBe('currentColor')
    expect(paths[0].attributes('fill-rule')).toBe('evenodd')
    expect(paths[0].attributes('clip-rule')).toBe('evenodd')
    expect(paths[1].attributes('d')).toContain('M352 480h320')
    expect(paths[2].attributes('d')).toContain('M480 672V352')
    expect(paths.every((path) => path.attributes('fill') === 'currentColor')).toBe(true)
  })

  it('renders MinusSquareOutlined with the same frame and different inner symbol', () => {
    const plusWrapper = mount(PlusSquareOutlined)
    const minusWrapper = mount(MinusSquareOutlined)
    const plusPaths = plusWrapper.findAll('path')
    const minusPaths = minusWrapper.findAll('path')

    expect(minusWrapper.get('svg').attributes('viewBox')).toBe('0 0 1024 1024')
    expect(minusPaths).toHaveLength(2)
    expect(minusPaths[0].attributes('d')).toBe(plusPaths[0].attributes('d'))
    expect(minusPaths[1].attributes('d')).toBe(plusPaths[1].attributes('d'))
    expect(minusPaths.every((path) => path.attributes('fill') === 'currentColor')).toBe(true)
  })

  it('renders HolderOutlined as a six-dot drag handle with the Element Plus SVG contract', () => {
    const wrapper = mount(HolderOutlined)
    const svg = wrapper.get('svg')
    const paths = wrapper.findAll('path')

    expect(svg.attributes('viewBox')).toBe('0 0 1024 1024')
    expect(paths).toHaveLength(1)
    expect(paths[0].attributes('fill')).toBe('currentColor')
    expect(paths[0].attributes('d')).toContain('M300 276.5')
    expect(paths[0].attributes('d')).toContain('M640 796')
  })

  it('supports single icon installation via app.use', () => {
    const app = createAppMock()

    app.use(PlusSquareOutlined)
    app.use(MinusSquareOutlined)
    app.use(HolderOutlined)

    expect(app.component).toHaveBeenCalledWith('PlusSquareOutlined', PlusSquareOutlined)
    expect(app.component).toHaveBeenCalledWith('MinusSquareOutlined', MinusSquareOutlined)
    expect(app.component).toHaveBeenCalledWith('HolderOutlined', HolderOutlined)
  })

  it('re-exports icons from the falcon-ui root entry without auto-registering them', () => {
    const app = createAppMock()

    expect(FalconPlusSquareOutlined).toBe(PlusSquareOutlined)
    expect(FalconMinusSquareOutlined).toBe(MinusSquareOutlined)
    expect(FalconHolderOutlined).toBe(HolderOutlined)

    app.use({
      install(currentApp) {
        currentApp.use(FalconHolderOutlined)
      }
    })

    expect(app.component).toHaveBeenCalledWith('HolderOutlined', HolderOutlined)
    expect(app.component).not.toHaveBeenCalledWith('PlusSquareOutlined', PlusSquareOutlined)
    expect(app.component).not.toHaveBeenCalledWith('MinusSquareOutlined', MinusSquareOutlined)
  })
})
