import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { defineConfig } from 'vitepress'
import { useDemoContainer } from './plugins/demo-container'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const docsRoot = path.resolve(currentDir, '..')

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
            { text: 'FlInput', link: '/components/input' }
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
    resolve: {
      alias: {
        '@docs': docsRoot
      }
    }
  }
})
