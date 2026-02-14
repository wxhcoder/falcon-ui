import { cp, mkdir } from 'node:fs/promises'
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

const buildTypes = async () => {
  await logInfo(`run command: pnpm exec vue-tsc -p tsconfig.build.json`, { stage: 'types' })
  await logInfo(`cwd=${rootDir}`, { stage: 'types' })
  await run('pnpm', ['exec', 'vue-tsc', '-p', 'tsconfig.build.json'])

  await mkdir(distPackageDir, { recursive: true })

  const sourceGlobalDts = resolve(rootDir, 'packages/falcon-ui/global.d.ts')
  const targetGlobalDts = resolve(distPackageDir, 'global.d.ts')

  await logInfo(`copy ${sourceGlobalDts} -> ${targetGlobalDts}`, { stage: 'types' })
  await cp(
    sourceGlobalDts,
    targetGlobalDts
  )
}

export { buildTypes }
