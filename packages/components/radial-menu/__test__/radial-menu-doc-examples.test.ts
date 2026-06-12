import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'

const radialMenuExamplesDir = resolve(process.cwd(), 'docs/examples/radial-menu')

const getVueExamples = () =>
  readdirSync(radialMenuExamplesDir)
    .filter((fileName) => fileName.endsWith('.vue'))
    .sort()

const getTagBlocks = (content: string, tagName: string) =>
  [...content.matchAll(new RegExp(`<${tagName}\\b[\\s\\S]*?>`, 'g'))].map(([tag]) => tag)

const radialMenuIconPattern = /<ElIcon :size="16">\s*<component :is="item\.icon" \/>\s*<\/ElIcon>/

const centerElemeIconPattern = /<ElIcon :size="16">\s*<Eleme \/>\s*<\/ElIcon>/

const getSizeExampleSmallMenu = (content: string) => {
  const match = content.match(/<FlRadialMenu size="small"[\s\S]*?<\/FlRadialMenu>/)

  return match?.[0] ?? ''
}

describe('radial-menu docs examples', () => {
  test.each(getVueExamples())('%s uses 16px Element Plus icon wrappers', (fileName) => {
    const content = readFileSync(resolve(radialMenuExamplesDir, fileName), 'utf8')

    expect(content).toContain("import { ElIcon } from 'element-plus'")
    expect(content).toContain("from '@element-plus/icons-vue'")
    expect(content).toContain('Eleme')

    if (fileName === 'size.vue') {
      const smallMenu = getSizeExampleSmallMenu(content)
      const largeAndMediumMenus = content.replace(smallMenu, '')

      expect(largeAndMediumMenus).toMatch(centerElemeIconPattern)
      expect(largeAndMediumMenus).toMatch(radialMenuIconPattern)
      expect(smallMenu).toContain(':center-icon=')
      expect(smallMenu).toContain(':icon="item.icon"')

      return
    }

    expect(content).toMatch(centerElemeIconPattern)
    expect(content).not.toContain(':center-icon=')
    for (const tag of getTagBlocks(content, 'FlRadialMenuItem')) {
      expect(tag).not.toContain(':icon=')
    }
    expect(content).toMatch(radialMenuIconPattern)
  })
})
