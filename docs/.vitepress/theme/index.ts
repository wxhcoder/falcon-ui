import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import ElementPlus from 'element-plus'
import FalconUI from '@falcon-ui/falcon-ui'
import type { Component } from 'vue'
import Layout from './layout.vue'
import VpDemo from '../components/vp-demo.vue'
import VpApiTable from '../components/vp-api-table.vue'
import OverviewGrid from '../components/overview-grid.vue'
import '../styles/vars.css'
import '../styles/custom.css'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '@falcon-ui/theme/index.scss'

const toDemoComponentName = (demoPath: string) => {
  const safeName = demoPath
    .replaceAll('.vue', '')
    .split(/[\\/.-]/g)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('')

  return `DocsDemo${safeName}`
}

const theme: Theme = {
  ...DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    DefaultTheme.enhanceApp?.({ app })
    app.use(ElementPlus)
    app.use(FalconUI)
    app.component('VpDemo', VpDemo)
    app.component('VpApiTable', VpApiTable)
    app.component('OverviewGrid', OverviewGrid)

    const demoModules = import.meta.glob('../../examples/**/*.vue', {
      eager: true
    }) as Record<string, { default: Component }>

    for (const [modulePath, mod] of Object.entries(demoModules)) {
      const relativePath = modulePath
        .replace(/^.*\/examples\//, '')
        .replaceAll('\\', '/')
      const componentName = toDemoComponentName(relativePath)
      app.component(componentName, mod.default)
    }
  }
}

export default theme
