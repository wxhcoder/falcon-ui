import { ID_INJECTION_KEY } from 'element-plus/es/hooks/use-id/index'
import { ZINDEX_INJECTION_KEY } from 'element-plus/es/hooks/use-z-index/index'
import { defineAsyncComponent } from 'vue'
import type { App, Component } from 'vue'

type ComponentLoader = () => Promise<Component>

const falconComponentLoaders: Record<string, ComponentLoader> = {
  FlLoading: () =>
    import('../../../packages/components/loading').then((module) => module.FlLoading),
  FlTextShimmer: () =>
    import('../../../packages/components/text-shimmer').then((module) => module.FlTextShimmer),
  FlBarcode: () =>
    import('../../../packages/components/barcode').then((module) => module.FlBarcode),
  FlButton: () => import('../../../packages/components/button').then((module) => module.FlButton),
  FlDatePicker: () =>
    import('../../../packages/components/date-picker').then((module) => module.FlDatePicker),
  FlDialog: () => import('../../../packages/components/dialog').then((module) => module.FlDialog),
  FlInput: () => import('../../../packages/components/input').then((module) => module.FlInput),
  FlInputNumber: () =>
    import('../../../packages/components/input-number').then((module) => module.FlInputNumber),
  FlInputSearch: () =>
    import('../../../packages/components/input-search').then((module) => module.FlInputSearch),
  FlQrCode: () => import('../../../packages/components/qr-code').then((module) => module.FlQrCode),
  FlRadialMenu: () =>
    import('../../../packages/components/radial-menu').then((module) => module.FlRadialMenu),
  FlRadialMenuItem: () =>
    import('../../../packages/components/radial-menu').then((module) => module.FlRadialMenuItem),
  FlSelect: () => import('../../../packages/components/select').then((module) => module.FlSelect),
  FlTable: () => import('../../../packages/components/table').then((module) => module.FlTable),
  FlTableEditor: () =>
    import('../../../packages/components/table').then((module) => module.FlTableEditor),
  FlTree: () => import('../../../packages/components/tree').then((module) => module.FlTree),
  FlTreeSelect: () =>
    import('../../../packages/components/tree-select').then((module) => module.FlTreeSelect)
}

const elementComponentLoaders: Record<string, ComponentLoader> = {
  ElIcon: () => import('element-plus/es/components/icon/index').then((module) => module.ElIcon),
  ElOption: () =>
    import('element-plus/es/components/select/index').then((module) => module.ElOption),
  ElSelect: () =>
    import('element-plus/es/components/select/index').then((module) => module.ElSelect),
  ElSwitch: () =>
    import('element-plus/es/components/switch/index').then((module) => module.ElSwitch),
  ElTable: () => import('element-plus/es/components/table/index').then((module) => module.ElTable),
  ElTableColumn: () =>
    import('element-plus/es/components/table/index').then((module) => module.ElTableColumn),
  ElTag: () => import('element-plus/es/components/tag/index').then((module) => module.ElTag)
}

const demoModules = import.meta.glob(['../../examples/**/*.vue', '../../en/examples/**/*.vue'], {
  import: 'default'
}) as Record<string, ComponentLoader>

let demoStylesPromise: Promise<void> | undefined

/** Load the complete demo visual theme only when a page actually renders an example. */
const loadDemoStyles = () => {
  demoStylesPromise ??= Promise.all([
    import('element-plus/dist/index.css'),
    import('element-plus/theme-chalk/dark/css-vars.css'),
    import('@falcon-ui/theme/index.scss')
  ]).then(() => undefined)

  return demoStylesPromise
}

/** Convert a demo file path into the global name emitted by the Markdown demo container. */
const toDemoComponentName = (demoPath: string, locale: 'en' | 'root') => {
  const safeName = demoPath
    .replace(/\.vue$/u, '')
    .split(/[\\/.-]/g)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('')

  return `${locale === 'en' ? 'DocsEnDemo' : 'DocsDemo'}${safeName}`
}

/** Register a small async wrapper for every component used by documentation examples. */
const registerAsyncComponents = (app: App) => {
  for (const [componentName, loader] of Object.entries({
    ...falconComponentLoaders,
    ...elementComponentLoaders
  })) {
    app.component(componentName, defineAsyncComponent(loader))
  }
}

/** Register every demo name without evaluating its SFC or styles until it is rendered. */
const registerAsyncDemos = (app: App) => {
  for (const [modulePath, loadDemo] of Object.entries(demoModules)) {
    const normalizedModulePath = modulePath.replace(/\\/gu, '/')
    const locale = normalizedModulePath.includes('/en/examples/') ? 'en' : 'root'
    const relativePath = normalizedModulePath.replace(/^.*\/examples\//, '')
    const componentName = toDemoComponentName(relativePath, locale)

    app.component(
      componentName,
      defineAsyncComponent(async () => {
        const [component] = await Promise.all([loadDemo(), loadDemoStyles()])

        return component
      })
    )
  }
}

/** Install the SSR providers and lazy docs-only component boundary. */
export const registerDemoRuntime = (app: App) => {
  app.provide(ID_INJECTION_KEY, {
    prefix: 1024,
    current: 0
  })
  app.provide(ZINDEX_INJECTION_KEY, {
    current: 0
  })
  registerAsyncComponents(app)
  registerAsyncDemos(app)
}
