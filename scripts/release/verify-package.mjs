import { readFile, readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const rootDir = resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..')
const packageDir = resolve(rootDir, 'dist', 'falcon-ui')

const requiredFiles = [
  'README.md',
  'LICENSE',
  'THIRD_PARTY_NOTICES.md',
  'global.d.ts',
  'esm/index.mjs',
  'cjs/index.cjs',
  'umd/falcon-ui.umd.js',
  'types/falcon-ui/index.d.ts',
  'types/components/loading/index.d.ts',
  'esm/components/loading/index.mjs',
  'cjs/components/loading/index.cjs',
  'theme/index.css',
  'theme/index.scss'
]

const requiredExports = [
  '.',
  './global',
  './components',
  './components/loading',
  './components/button',
  './components/dialog',
  './components/input',
  './components/input-search',
  './components/input-number',
  './components/date-picker',
  './components/qr-code',
  './components/barcode',
  './components/select',
  './components/tree-select',
  './components/tree',
  './components/table',
  './components/radial-menu',
  './utils',
  './hooks',
  './icons',
  './theme/index.css',
  './theme/index.scss'
]

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))

const collectFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const filePath = resolve(directory, entry.name)

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(filePath)))
    } else {
      files.push(filePath)
    }
  }

  return files
}

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const sourcePackageJson = await readJson(resolve(rootDir, 'packages/falcon-ui/package.json'))
const packageJson = await readJson(resolve(packageDir, 'package.json'))

assert(packageJson.name === '@falcon-ui/falcon-ui', `unexpected package name: ${packageJson.name}`)
assert(
  packageJson.version === sourcePackageJson.version,
  `package version does not match source package: ${packageJson.version} !== ${sourcePackageJson.version}`
)
assert(packageJson.publishConfig?.access === 'public', 'package must be public')
assert(packageJson.peerDependencies?.vue, 'vue peer dependency is missing')
assert(packageJson.peerDependencies?.['element-plus'], 'element-plus peer dependency is missing')
assert(
  packageJson.peerDependencies?.['@element-plus/icons-vue'],
  '@element-plus/icons-vue peer dependency is missing'
)

for (const exportPath of requiredExports) {
  assert(packageJson.exports?.[exportPath], `missing export: ${exportPath}`)
}

const loadingExport = packageJson.exports?.['./components/loading']
assert(
  loadingExport?.types === './types/components/loading/index.d.ts',
  'loading types export is incorrect'
)
assert(
  loadingExport?.import === './esm/components/loading/index.mjs',
  'loading import export is incorrect'
)
assert(
  loadingExport?.require === './cjs/components/loading/index.cjs',
  'loading require export is incorrect'
)

for (const file of requiredFiles) {
  const filePath = resolve(packageDir, file)
  try {
    await readFile(filePath)
  } catch {
    throw new Error(`missing publish file: ${file}`)
  }
}

const publishFiles = await collectFiles(packageDir)
const declarationFiles = publishFiles.filter((filePath) => filePath.endsWith('.d.ts'))
const invalidImportPattern = /['"](?:packages\/|falcon-ui(?:\/|['"]))/
const internalPackagePattern = /['"]@falcon-ui\/(?:components|hooks|icons|utils)(?:\/|['"])/

for (const filePath of declarationFiles) {
  const content = await readFile(filePath, 'utf8')
  assert(!invalidImportPattern.test(content), `invalid declaration import: ${filePath}`)
  assert(!internalPackagePattern.test(content), `internal package import: ${filePath}`)
}

const moduleFiles = publishFiles.filter((filePath) => /\.(mjs|cjs)$/.test(filePath))
for (const filePath of moduleFiles) {
  const content = await readFile(filePath, 'utf8')
  assert(!/['"]packages\//.test(content), `invalid module import: ${filePath}`)
}

process.stdout.write(`publish package verified: ${packageJson.name}@${packageJson.version}\n`)
process.stdout.write(`publish files: ${publishFiles.length}\n`)
