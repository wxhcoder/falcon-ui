import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const rootDir = path.resolve(__dirname, '../../..')

const readText = (relativePath: string) =>
  fs.readFileSync(path.resolve(rootDir, relativePath), 'utf8')

describe('docs homepage', () => {
  it('registers the shared homepage component in the VitePress theme', () => {
    const themeSource = readText('docs/.vitepress/theme/index.ts')

    expect(themeSource).toContain("import HomePage from '../components/HomePage.vue'")
    expect(themeSource).toContain("app.component('HomePage', HomePage)")
  })

  it('mounts the shared homepage without docs navigation chrome in both locales', () => {
    const rootHomeSource = readText('docs/index.md')
    const englishHomeSource = readText('docs/en/index.md')

    for (const source of [rootHomeSource, englishHomeSource]) {
      expect(source).toContain('homepage: true')
      expect(source).toContain('sidebar: false')
      expect(source).toContain('outline: false')
      expect(source).toContain('<HomePage />')
    }

    const layoutSource = readText('docs/.vitepress/theme/layout.vue')

    expect(layoutSource).toContain('isHomepage')
    expect(layoutSource).toContain('v-if="!isHomepage"')
  })

  it('keeps localized content separate from the illustration structure', () => {
    const homeSource = readText('docs/.vitepress/components/HomePage.vue')

    expect(homeSource).toContain('<HomeExplodedIllustration')
    expect(homeSource).toContain("localeIndex.value === 'en'")
    expect(homeSource).toContain("link: '/guide/getting-started'")
    expect(homeSource).toContain("link: '/en/guide/getting-started'")
  })

  it('keeps the homepage focused on the hero illustration only', () => {
    const homeSource = readText('docs/.vitepress/components/HomePage.vue')

    expect(homeSource).not.toContain('falcon-homepage__benefits')
    expect(homeSource).not.toContain('falcon-homepage__overview')
  })

  it('renders an accessible three-layer HTML/CSS exploded-view illustration', () => {
    const illustrationSource = readText('docs/.vitepress/components/HomeExplodedIllustration.vue')

    expect(illustrationSource).toContain('home-exploded-illustration')
    expect(illustrationSource).toContain('Foundation')
    expect(illustrationSource).toContain('Layout')
    expect(illustrationSource).toContain('Template')
    expect(illustrationSource).toContain('home-exploded-illustration__anchor')
    expect(illustrationSource).toContain('anchor--template')
    expect(illustrationSource).toContain('anchor--layout')
    expect(illustrationSource).toContain('anchor--foundation')
    expect(illustrationSource).toContain('aria-label')
    expect(illustrationSource).not.toContain('<img')
    expect(illustrationSource).toContain('prefers-reduced-motion: reduce')
    expect(illustrationSource).toContain(':global(.dark)')
    expect(illustrationSource).toContain('@media (max-width: 767px)')
  })
})
