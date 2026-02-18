import fs from 'node:fs'
import path from 'node:path'
import type MarkdownIt from 'markdown-it'
import container from 'markdown-it-container'
import { highlightSourceCode } from './shiki'

const demoInfoRE = /^demo\s+(.+)$/
const examplesDir = 'examples'
const encodeBase64 = (value: string) => Buffer.from(value, 'utf8').toString('base64')

const normalizeDemoPath = (rawPath: string) => {
  const cleanedPath = rawPath.trim().replace(/^['"]|['"]$/g, '')
  if (!cleanedPath) return ''
  return cleanedPath.endsWith('.vue') ? cleanedPath : `${cleanedPath}.vue`
}

const toComponentName = (demoPath: string) => {
  const safeName = demoPath
    .replaceAll('.vue', '')
    .split(/[\\/.-]/g)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('')

  return `DocsDemo${safeName}`
}

const isWithinDirectory = (targetPath: string, rootPath: string) => {
  const relativePath = path.relative(rootPath, targetPath)
  return relativePath && !relativePath.startsWith('..') && !path.isAbsolute(relativePath)
}

export const useDemoContainer = (md: MarkdownIt, docsRoot: string) => {
  const demosRoot = path.resolve(docsRoot, examplesDir)

  md.use(container, 'demo', {
    validate(params) {
      return demoInfoRE.test(params.trim())
    },
    render(tokens, index) {
      const token = tokens[index]
      if (token.nesting === -1) {
        return ''
      }

      const match = token.info.trim().match(demoInfoRE)
      if (!match) return ''

      const demoPath = normalizeDemoPath(match[1])
      if (!demoPath) {
        throw new Error('[docs:demo] Missing demo path.')
      }

      const demoFilePath = path.resolve(demosRoot, demoPath)
      if (!isWithinDirectory(demoFilePath, demosRoot)) {
        throw new Error(`[docs:demo] Invalid demo path: ${demoPath}`)
      }
      if (!fs.existsSync(demoFilePath)) {
        throw new Error(`[docs:demo] Demo file not found: ${demoPath}`)
      }

      const code = fs.readFileSync(demoFilePath, 'utf8')
      const highlightedCode = highlightSourceCode(md, code, 'vue')
      const componentName = toComponentName(demoPath)
      const normalizedPath = demoPath.replaceAll('\\', '/')

      return `<vp-demo demo-component="${componentName}" source-path="docs/${examplesDir}/${normalizedPath}" source-code="${encodeBase64(
        code
      )}" highlighted-code="${encodeBase64(highlightedCode)}" />`
    }
  })
}
