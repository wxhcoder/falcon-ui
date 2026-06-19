import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const rootDir = path.resolve(__dirname, '../../..')

const readText = (relativePath: string) =>
  fs.readFileSync(path.resolve(rootDir, relativePath), 'utf8')

describe('docs Element Plus-style layout', () => {
  it('configures root and locale fallback sidebars without removing section sidebars', () => {
    const configSource = readText('docs/.vitepress/config.ts')

    expect(configSource).toMatch(/['"]\/['"]:\s*\[/u)
    expect(configSource).toMatch(/['"]\/en\/['"]:\s*\[/u)
    expect(configSource).toMatch(/['"]\/guide\/['"]:\s*\[/u)
    expect(configSource).toMatch(/['"]\/components\/['"]:\s*\[/u)
    expect(configSource).toMatch(/['"]\/en\/guide\/['"]:\s*\[/u)
    expect(configSource).toMatch(/['"]\/en\/components\/['"]:\s*\[/u)
  })

  it('uses Element Plus-style outline labels for both locales', () => {
    const configSource = readText('docs/.vitepress/config.ts')

    expect(configSource).toMatch(/label:\s*'\u76ee\u5f55'/u)
    expect(configSource).toContain("label: 'Contents'")
  })

  it('defines Element Plus layout tokens and wide-screen breakpoints', () => {
    const varsSource = readText('docs/.vitepress/styles/vars.css')
    const customStyleSource = readText('docs/.vitepress/styles/custom.css')

    expect(varsSource).toContain('--header-height: 55px;')
    expect(varsSource).toContain('--nav-height: 55px;')
    expect(varsSource).toContain('--vp-nav-height: 55px;')
    expect(varsSource).toContain('--vp-sidebar-width-small: 266px;')
    expect(varsSource).toContain('--vp-layout-max-width: 1362px;')
    expect(varsSource).toContain('--vp-content-width: 800px;')
    expect(customStyleSource).toContain('@media (min-width: 1440px)')
    expect(customStyleSource).toContain('--vp-sidebar-width-small: 234px;')
    expect(customStyleSource).toContain('@media (min-width: 1680px)')
    expect(customStyleSource).toContain('--vp-sidebar-width-small: 290px;')
  })

  it('ports the docs shell to Element Plus-style layout classes', () => {
    const layoutSource = readText('docs/.vitepress/theme/layout.vue')
    const customStyleSource = readText('docs/.vitepress/styles/custom.css')

    expect(layoutSource).not.toContain('DefaultTheme')
    expect(layoutSource).not.toContain('<Layout')
    expect(layoutSource).toContain('falcon-docs-layout')
    expect(layoutSource).toContain('navbar-wrapper')
    expect(layoutSource).toContain('sidebar')
    expect(layoutSource).toContain('page-content')
    expect(layoutSource).toContain('doc-content-wrapper')
    expect(layoutSource).toContain('toc-wrapper')
    expect(customStyleSource).toContain('.doc-content-wrapper')
    expect(customStyleSource).toContain('.toc-wrapper')
  })

  it('keeps the global search button beside the guide nav item', () => {
    const layoutSource = readText('docs/.vitepress/theme/layout.vue')
    const customStyleSource = readText('docs/.vitepress/styles/custom.css')

    const searchIndex = layoutSource.indexOf('<VPNavBarSearch class="search" />')
    const menuIndex = layoutSource.indexOf('<VPNavBarMenu class="menu" />')

    expect(searchIndex).toBeGreaterThan(-1)
    expect(menuIndex).toBeGreaterThan(searchIndex)
    expect(customStyleSource).toMatch(
      /\.navbar-wrapper \.search\s*\{[^}]*flex:\s*0 0 auto;/u
    )
  })

  it('does not render a blank wide-screen toc when a page has no outline', () => {
    const layoutSource = readText('docs/.vitepress/theme/layout.vue')
    const customStyleSource = readText('docs/.vitepress/styles/custom.css')

    expect(layoutSource).toContain('hasOutline')
    expect(layoutSource).toContain('frontmatter.value.outline !== false')
    expect(layoutSource).toContain('v-if="hasOutline"')
    expect(customStyleSource).toContain('.toc-wrapper:has(.VPDocAsideOutline.has-outline)')
  })
})
