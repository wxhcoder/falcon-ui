import type { App } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { withInstall } from '../src/install'

const createAppMock = (): App => {
  return {
    component: vi.fn()
  } as unknown as App
}

describe('withInstall', () => {
  it('registers named component via install', () => {
    const app = createAppMock()
    const component = {
      name: 'FMock'
    }

    const installable = withInstall(component)
    installable.install(app)

    expect(app.component).toHaveBeenCalledWith('FMock', component)
  })

  it('skips install when component has no name', () => {
    const app = createAppMock()
    const component = {}

    const installable = withInstall(component)
    installable.install(app)

    expect(app.component).not.toHaveBeenCalled()
  })
})
