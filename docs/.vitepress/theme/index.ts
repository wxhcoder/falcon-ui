import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import Layout from './layout.vue'
import { registerDemoRuntime } from './demo-runtime'
import VpDemo from '../components/vp-demo.vue'
import VpApiTable from '../components/vp-api-table.vue'
import OverviewGrid from '../components/overview-grid.vue'
import HomePage from '../components/HomePage.vue'
import '../styles/vars.css'
import '../styles/custom.css'

const theme: Theme = {
  ...DefaultTheme,
  Layout,
  enhanceApp(context) {
    DefaultTheme.enhanceApp?.(context)
    registerDemoRuntime(context.app)
    context.app.component('VpDemo', VpDemo)
    context.app.component('VpApiTable', VpApiTable)
    context.app.component('OverviewGrid', OverviewGrid)
    context.app.component('HomePage', HomePage)
  }
}

export default theme
