import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const rootDir = path.resolve(__dirname, '../../..')

const readText = (relativePath: string) =>
  fs.readFileSync(path.resolve(rootDir, relativePath), 'utf8').replace(/\r\n/g, '\n')

describe('docs performance boundaries', () => {
  it('keeps demo styles out of the shared docs stylesheet', () => {
    const configSource = readText('docs/.vitepress/config.ts')

    expect(configSource).toMatch(/cssCodeSplit:\s*true/)
  })

  it('keeps full UI plugins and demo styles out of the shared theme entry', () => {
    const themeSource = readText('docs/.vitepress/theme/index.ts')

    expect(themeSource).toContain("import { registerDemoRuntime } from './demo-runtime'")
    expect(themeSource).toContain('registerDemoRuntime(context.app)')
    expect(themeSource).not.toContain("import ElementPlus from 'element-plus'")
    expect(themeSource).not.toContain("import FalconUI from '@falcon-ui/falcon-ui'")
    expect(themeSource).not.toContain('app.use(ElementPlus)')
    expect(themeSource).not.toContain('app.use(FalconUI)')
    expect(themeSource).not.toContain("import 'element-plus/dist/index.css'")
    expect(themeSource).not.toContain("import '@falcon-ui/theme/index.scss'")
  })

  it('registers demos as lazy async components and loads demo styles behind that boundary', () => {
    const runtimeSource = readText('docs/.vitepress/theme/demo-runtime.ts')

    expect(runtimeSource).toContain('defineAsyncComponent')
    expect(runtimeSource).toContain('import.meta.glob(')
    expect(runtimeSource).toContain("import: 'default'")
    expect(runtimeSource).not.toContain('eager: true')
    expect(runtimeSource).toContain("import('element-plus/dist/index.css')")
    expect(runtimeSource).toContain("import('element-plus/theme-chalk/dark/css-vars.css')")
    expect(runtimeSource).toContain("import('@falcon-ui/theme/index.scss')")
  })

  it('registers only the Falcon and Element Plus components used by docs demos', () => {
    const runtimeSource = readText('docs/.vitepress/theme/demo-runtime.ts')
    const falconComponents = [
      'FlBarcode',
      'FlButton',
      'FlDatePicker',
      'FlDialog',
      'FlInput',
      'FlInputNumber',
      'FlInputSearch',
      'FlQrCode',
      'FlTextShimmer',
      'FlRadialMenu',
      'FlRadialMenuItem',
      'FlSelect',
      'FlTable',
      'FlTableEditor',
      'FlTree',
      'FlTreeSelect'
    ]
    const elementComponents = [
      'ElIcon',
      'ElOption',
      'ElSelect',
      'ElSwitch',
      'ElTable',
      'ElTableColumn',
      'ElTag'
    ]

    for (const componentName of [...falconComponents, ...elementComponents]) {
      expect(runtimeSource).toContain(`${componentName}:`)
    }

    expect(runtimeSource).not.toContain("from 'element-plus'")
    expect(runtimeSource).not.toContain("from '@falcon-ui/falcon-ui'")
  })
})
