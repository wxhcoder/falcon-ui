import { resolve } from 'node:path'
import { rm } from 'node:fs/promises'
import { distDir, distPackageDir } from './constants.mjs'
import { logInfo } from './logger.mjs'

const cleanDist = async () => {
  const legacyDistLogsDir = resolve(distDir, 'logs')

  await logInfo(`remove ${distPackageDir}`, { stage: 'clean' })
  await rm(distPackageDir, { force: true, recursive: true })

  await logInfo(`remove legacy ${legacyDistLogsDir}`, { stage: 'clean' })
  await rm(legacyDistLogsDir, { force: true, recursive: true })
}

export { cleanDist }
