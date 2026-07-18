import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { defineConfig, postcssIsolateStyles } from 'vitepress'
import { useDemoContainer } from './plugins/demo-container'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const docsRoot = path.resolve(currentDir, '..')
const repoRoot = path.resolve(docsRoot, '..')

const socialLinks = [{ icon: 'github' as const, link: 'https://github.com/wxhcoder/falcon-ui' }]

const rootComponentSidebar = [
  { text: '总览', link: '/components/index' },
  { text: 'Button 按钮', link: '/components/button' },
  { text: 'Dialog 对话框', link: '/components/dialog' },
  { text: 'Date Picker 日期选择器', link: '/components/date-picker' },
  { text: 'Input 输入框', link: '/components/input' },
  { text: 'QR Code 二维码', link: '/components/qr-code' },
  { text: 'Barcode 条码', link: '/components/barcode' },
  { text: 'Select 选择器', link: '/components/select' },
  { text: 'FlTreeSelect', link: '/components/tree-select' },
  { text: 'Input Search 业务搜索输入框', link: '/components/input-search' },
  { text: 'Input Number 数字输入框', link: '/components/input-number' },
  { text: 'Tree 树', link: '/components/tree' },
  { text: 'Table 表格', link: '/components/table' },
  { text: 'Radial Menu 径向菜单', link: '/components/radial-menu' }
]

const englishComponentSidebar = [
  { text: 'Overview', link: '/en/components/index' },
  { text: 'Button', link: '/en/components/button' },
  { text: 'Dialog', link: '/en/components/dialog' },
  { text: 'Date Picker', link: '/en/components/date-picker' },
  { text: 'Input', link: '/en/components/input' },
  { text: 'QR Code', link: '/en/components/qr-code' },
  { text: 'Barcode', link: '/en/components/barcode' },
  { text: 'Select', link: '/en/components/select' },
  { text: 'Input Search', link: '/en/components/input-search' },
  { text: 'Input Number', link: '/en/components/input-number' },
  { text: 'Tree', link: '/en/components/tree' },
  { text: 'Table', link: '/en/components/table' },
  { text: 'Radial Menu', link: '/en/components/radial-menu' }
]

const rootSearchOptions = {
  translations: {
    button: {
      buttonText: '搜索文档',
      buttonAriaLabel: '搜索文档'
    },
    modal: {
      noResultsText: '没有找到结果',
      resetButtonTitle: '清除搜索',
      backButtonTitle: '关闭搜索',
      displayDetails: '显示详细列表',
      footer: {
        selectText: '选择',
        selectKeyAriaLabel: '回车',
        navigateText: '切换',
        navigateUpKeyAriaLabel: '上箭头',
        navigateDownKeyAriaLabel: '下箭头',
        closeText: '关闭',
        closeKeyAriaLabel: 'Esc'
      }
    }
  }
}

const englishSearchOptions = {
  translations: {
    button: {
      buttonText: 'Search',
      buttonAriaLabel: 'Search documentation'
    },
    modal: {
      noResultsText: 'No results found',
      resetButtonTitle: 'Clear search',
      backButtonTitle: 'Close search',
      displayDetails: 'Display detailed list',
      footer: {
        selectText: 'Select',
        selectKeyAriaLabel: 'Enter',
        navigateText: 'Navigate',
        navigateUpKeyAriaLabel: 'Up arrow',
        navigateDownKeyAriaLabel: 'Down arrow',
        closeText: 'Close',
        closeKeyAriaLabel: 'Esc'
      }
    }
  }
}

const rootThemeConfig = {
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
        items: rootComponentSidebar
      }
    ],
    '/': [
      {
        text: '指南',
        items: [{ text: '安装与使用', link: '/guide/getting-started' }]
      },
      {
        text: '组件',
        items: rootComponentSidebar
      }
    ]
  },
  outline: {
    level: [2, 3] as [2, 3],
    label: '目录'
  },
  langMenuLabel: '切换语言',
  sidebarMenuLabel: '菜单',
  returnToTopLabel: '返回顶部',
  darkModeSwitchLabel: '外观',
  lightModeSwitchTitle: '切换到浅色模式',
  darkModeSwitchTitle: '切换到深色模式',
  socialLinks,
  search: {
    provider: 'local' as const,
    options: rootSearchOptions
  }
}

const englishThemeConfig = {
  logo: '/favicon.ico',
  nav: [
    { text: 'Guide', link: '/en/guide/getting-started' },
    { text: 'Components', link: '/en/components/index' }
  ],
  sidebar: {
    '/en/guide/': [
      {
        text: 'Getting Started',
        items: [{ text: 'Installation and Usage', link: '/en/guide/getting-started' }]
      }
    ],
    '/en/components/': [
      {
        text: 'Components',
        items: englishComponentSidebar
      }
    ],
    '/en/': [
      {
        text: 'Guide',
        items: [{ text: 'Installation and Usage', link: '/en/guide/getting-started' }]
      },
      {
        text: 'Components',
        items: englishComponentSidebar
      }
    ]
  },
  outline: {
    level: [2, 3] as [2, 3],
    label: 'Contents'
  },
  langMenuLabel: 'Change language',
  sidebarMenuLabel: 'Menu',
  returnToTopLabel: 'Return to top',
  darkModeSwitchLabel: 'Appearance',
  lightModeSwitchTitle: 'Switch to light theme',
  darkModeSwitchTitle: 'Switch to dark theme',
  socialLinks,
  search: {
    provider: 'local' as const,
    options: englishSearchOptions
  }
}

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
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/',
      description: '基于 Element Plus 的二次封装组件库',
      themeConfig: rootThemeConfig
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      description: 'A second-layer component library based on Element Plus',
      themeConfig: englishThemeConfig
    }
  },
  themeConfig: rootThemeConfig,
  vite: {
    build: {
      cssCodeSplit: true
    },
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
