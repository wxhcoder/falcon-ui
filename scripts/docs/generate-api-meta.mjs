import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createChecker } from 'vue-component-meta'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(currentDir, '../..')
const tsconfigPath = path.resolve(rootDir, 'tsconfig.docs.json')
const outputDir = path.resolve(rootDir, 'docs/public/api-meta')

const targets = [
  {
    id: 'fl-button',
    filePath: path.resolve(rootDir, 'packages/components/button/src/button.vue')
  },
  {
    id: 'fl-input',
    filePath: path.resolve(rootDir, 'packages/components/input/src/input.vue')
  }
]

const normalizeText = (value) => (value ? String(value).trim() : '')

const toApiMeta = (componentId, meta) => ({
  component: meta.name || componentId,
  description: normalizeText(meta.description),
  events: meta.events
    .map((item) => ({
      description: normalizeText(item.description),
      name: item.name,
      signature: item.signature,
      type: item.type
    }))
    .sort((a, b) => a.name.localeCompare(b.name)),
  exposes: meta.exposed
    .map((item) => ({
      description: normalizeText(item.description),
      name: item.name,
      type: item.type
    }))
    .sort((a, b) => a.name.localeCompare(b.name)),
  props: meta.props
    .filter((item) => !item.global)
    .map((item) => ({
      default: item.default ?? '-',
      description: normalizeText(item.description),
      name: item.name,
      required: item.required,
      type: item.type
    }))
    .sort((a, b) => a.name.localeCompare(b.name)),
  slots: meta.slots
    .map((item) => ({
      description: normalizeText(item.description),
      name: item.name,
      type: item.type
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
})

const generate = () => {
  const checker = createChecker(tsconfigPath, {
    forceUseTs: true
  })

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  for (const target of targets) {
    const meta = checker.getComponentMeta(target.filePath)
    const output = toApiMeta(target.id, meta)
    const outputPath = path.resolve(outputDir, `${target.id}.json`)
    fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8')
    process.stdout.write(`[docs:api] generated ${path.relative(rootDir, outputPath)}\n`)
  }
}

generate()
