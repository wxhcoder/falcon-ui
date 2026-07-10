import { access, copyFile, cp, mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '../..')
const docsOutput = path.resolve(repoRoot, 'docs/.vitepress/dist')
const sitesOutput = path.resolve(repoRoot, 'dist')
const clientOutput = path.resolve(sitesOutput, 'client')
const serverOutput = path.resolve(sitesOutput, 'server')
const metadataOutput = path.resolve(sitesOutput, '.openai')
const workerSource = path.resolve(scriptDir, 'sites-worker.mjs')
const hostingSource = path.resolve(repoRoot, '.openai/hosting.json')

await access(path.resolve(docsOutput, 'index.html'))
await access(workerSource)
await access(hostingSource)

await rm(sitesOutput, { recursive: true, force: true })
await Promise.all([
  mkdir(clientOutput, { recursive: true }),
  mkdir(serverOutput, { recursive: true }),
  mkdir(metadataOutput, { recursive: true })
])

await Promise.all([
  cp(docsOutput, clientOutput, { recursive: true }),
  copyFile(workerSource, path.resolve(serverOutput, 'index.js')),
  copyFile(hostingSource, path.resolve(metadataOutput, 'hosting.json'))
])

console.log('Sites build created from the current VitePress output.')
