import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { defineConfig, postcssIsolateStyles } from 'vitepress'
import { useDemoContainer } from './plugins/demo-container'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const docsRoot = path.resolve(currentDir, '..')
const repoRoot = path.resolve(docsRoot, '..')

export default defineConfig({
  title: 'Falcon UI',
  description: '基于 Element Plus 的二次封装组件库',
  lang: 'zh-CN',
  srcDir: docsRoot,
  lastUpdated: true,
  cleanUrls: true,
  markdown: {
    config(md) {
      useDemoContainer(md, docsRoot)
    }
  },
  themeConfig: {
    logo: '/favicon.ico',
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: '组件', link: '/components/index' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [{ text: '安装与使用', link: '/guide/getting-started' }]
        }
      ],
      '/components/': [
        {
          text: '组件',
          items: [
            { text: '总览', link: '/components/index' },
            { text: 'FlButton', link: '/components/button' },
            { text: 'FlDialog', link: '/components/dialog' },
            { text: 'FlDatePicker', link: '/components/date-picker' },
            { text: 'FlInput', link: '/components/input' },
            { text: 'FlQrCode', link: '/components/qr-code' },
            { text: 'FlBarcode', link: '/components/barcode' },
            { text: 'FlSelect', link: '/components/select' },
            { text: 'FlInputSearch', link: '/components/input-search' },
            { text: 'FlInputNumber', link: '/components/input-number' },
            { text: 'FlTree', link: '/components/tree' },
            { text: 'FlTable', link: '/components/table' },
            { text: 'FlRadialMenu', link: '/components/radial-menu' }
          ]
        }
      ]
    },
    outline: {
      level: [2, 3],
      label: '本页导航'
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/wxhcoder/falcon-ui' }],
    search: {
      provider: 'local'
    }
  },
  vite: {
    css: {
      postcss: {
        plugins: [
          postcssIsolateStyles({
            includeFiles: [/base\.css$/, /vp-doc\.css$/]
          })
        ]
      }
    },
    resolve: {
      alias: {
        '@docs': docsRoot,
        '@falcon-ui/falcon-ui': path.resolve(repoRoot, 'packages/falcon-ui/index.ts'),
        '@falcon-ui/components': path.resolve(repoRoot, 'packages/components/index.ts'),
        '@falcon-ui/hooks': path.resolve(repoRoot, 'packages/hooks/index.ts'),
        '@falcon-ui/icons': path.resolve(repoRoot, 'packages/icons/index.ts'),
        '@falcon-ui/utils': path.resolve(repoRoot, 'packages/utils/index.ts'),
        '@falcon-ui/theme': path.resolve(repoRoot, 'packages/theme')
      }
    }
  }
})
