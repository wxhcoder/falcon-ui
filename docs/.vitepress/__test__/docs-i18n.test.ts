import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const rootDir = path.resolve(__dirname, '../../..')
const docsDir = path.resolve(rootDir, 'docs')

const readText = (relativePath: string) =>
  fs.readFileSync(path.resolve(rootDir, relativePath), 'utf8')

const hasChineseText = (value: string) => /[\u4e00-\u9fff]/u.test(value)

describe('docs i18n structure', () => {
  it('configures VitePress root and English locales', () => {
    const configSource = readText('docs/.vitepress/config.ts')

    expect(configSource).toContain('locales:')
    expect(configSource).toContain('root:')
    expect(configSource).toContain("label: '简体中文'")
    expect(configSource).toContain('en:')
    expect(configSource).toContain("label: 'English'")
    expect(configSource).toContain("link: '/en/'")
  })

  it('uses bilingual Chinese component sidebar labels and pure English labels', () => {
    const configSource = readText('docs/.vitepress/config.ts')

    expect(configSource).toContain("text: 'Button 按钮'")
    expect(configSource).toContain("text: 'Input Number 数字输入框'")
    expect(configSource).toContain("text: 'Radial Menu 径向菜单'")
    expect(configSource).toContain("text: 'Button', link: '/en/components/button'")
    expect(configSource).toContain("text: 'Input Number', link: '/en/components/input-number'")
    expect(configSource).toContain("text: 'Radial Menu', link: '/en/components/radial-menu'")
  })

  it('has English docs and examples without visible Chinese text', () => {
    const requiredFiles = [
      'en/index.md',
      'en/guide/getting-started.md',
      'en/components/button.md',
      'en/components/dialog.md',
      'en/components/input-search.md',
      'en/examples/button/basic.vue',
      'en/examples/input-search/fuzzy-multi-select.vue',
      'en/examples/input-search/is-table.vue',
      'en/examples/table/basic.vue'
    ]

    for (const relativePath of requiredFiles) {
      const filePath = path.resolve(docsDir, relativePath)
      expect(fs.existsSync(filePath), relativePath).toBe(true)
      expect(hasChineseText(fs.readFileSync(filePath, 'utf8')), relativePath).toBe(false)
    }
  })

  it('links interactive bilingual input-search examples with strict single selection', () => {
    const rootPage = readText('docs/components/input-search.md')
    const englishPage = readText('docs/en/components/input-search.md')
    const examplePaths = [
      'docs/examples/input-search/basic.vue',
      'docs/examples/input-search/is-table.vue',
      'docs/examples/input-search/fuzzy-multi-select.vue',
      'docs/examples/input-search/enter-multi-placeholder.vue',
      'docs/en/examples/input-search/basic.vue',
      'docs/en/examples/input-search/is-table.vue',
      'docs/en/examples/input-search/fuzzy-multi-select.vue',
      'docs/en/examples/input-search/enter-multi-placeholder.vue'
    ]

    expect(rootPage).toContain('::: demo input-search/is-table')
    expect(rootPage).toContain('::: demo input-search/fuzzy-multi-select')
    expect(englishPage).toContain('::: demo input-search/is-table')
    expect(englishPage).toContain('::: demo input-search/fuzzy-multi-select')

    for (const relativePath of examplePaths) {
      const source = readText(relativePath)

      expect(source, relativePath).toContain('selectionSingle: true')
    }

    expect(readText('docs/examples/input-search/basic.vue')).toContain(
      '@open-dialog="handleOpenDialog"'
    )
    expect(readText('docs/examples/input-search/is-table.vue')).toContain(
      '@open-dialog="handleOpenDialog(row, $event)"'
    )
    expect(readText('docs/en/examples/input-search/basic.vue')).toContain(
      '@open-dialog="handleOpenDialog"'
    )
    expect(readText('docs/en/examples/input-search/is-table.vue')).toContain(
      '@open-dialog="handleOpenDialog(row, $event)"'
    )
  })

  it('generates English API metadata without Chinese descriptions', () => {
    const englishButtonMeta = path.resolve(docsDir, 'public/en/api-meta/fl-button.json')

    expect(fs.existsSync(englishButtonMeta)).toBe(true)

    const content = fs.readFileSync(englishButtonMeta, 'utf8')
    expect(hasChineseText(content)).toBe(false)
    expect(content).toContain('Button component')
  })
})
