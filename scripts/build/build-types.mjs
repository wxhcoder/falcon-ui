import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { spawn } from 'node:child_process'
import { distPackageDir, rootDir } from './constants.mjs'
import { logInfo } from './logger.mjs'

const run = (command, args) =>
  new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      shell: true,
      stdio: 'inherit'
    })

    child.on('exit', (code) => {
      if (code === 0) {
        resolvePromise()
        return
      }

      rejectPromise(new Error(`${command} ${args.join(' ')} exited with code ${code}`))
    })

    child.on('error', (error) => {
      rejectPromise(error)
    })
  })

const typeImportRewrites = new Map([
  ['@falcon-ui/falcon-ui', 'falcon-ui'],
  ['@falcon-ui/components', 'falcon-ui/components'],
  ['@falcon-ui/hooks', 'falcon-ui/hooks'],
  ['@falcon-ui/icons', 'falcon-ui/icons'],
  ['@falcon-ui/utils', 'falcon-ui/utils']
])

const rewriteTypeImportSpecifiers = (content) => {
  let rewritten = content

  for (const [from, to] of typeImportRewrites.entries()) {
    rewritten = rewritten.replaceAll(`'${from}'`, `'${to}'`).replaceAll(`"${from}"`, `"${to}"`)
  }

  return rewritten
}

const collectDtsFiles = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const filePath = resolve(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...(await collectDtsFiles(filePath)))
      continue
    }

    if (entry.isFile() && filePath.endsWith('.d.ts')) {
      files.push(filePath)
    }
  }

  return files
}

const rewriteTypeImports = async (filePaths) => {
  let rewriteCount = 0

  for (const filePath of filePaths) {
    const source = await readFile(filePath, 'utf8')
    const rewritten = rewriteTypeImportSpecifiers(source)

    if (rewritten === source) {
      continue
    }

    await writeFile(filePath, rewritten)
    rewriteCount += 1
  }

  return rewriteCount
}

const buildTypes = async () => {
  await logInfo(`run command: pnpm exec vue-tsc -p tsconfig.build.json`, { stage: 'types' })
  await logInfo(`cwd=${rootDir}`, { stage: 'types' })
  await run('pnpm', ['exec', 'vue-tsc', '-p', 'tsconfig.build.json'])

  await mkdir(distPackageDir, { recursive: true })

  const sourceGlobalDts = resolve(rootDir, 'packages/falcon-ui/global.d.ts')
  const targetGlobalDts = resolve(distPackageDir, 'global.d.ts')

  await logInfo(`copy ${sourceGlobalDts} -> ${targetGlobalDts}`, { stage: 'types' })
  await cp(sourceGlobalDts, targetGlobalDts)

  const distTypesDir = resolve(distPackageDir, 'types')
  const distTypeFiles = await collectDtsFiles(distTypesDir)
  const rewritableFiles = [targetGlobalDts, ...distTypeFiles]
  const rewriteCount = await rewriteTypeImports(rewritableFiles)

  await logInfo(`rewrite type import specifiers in ${rewriteCount} file(s)`, { stage: 'types' })
}

export { buildTypes }
