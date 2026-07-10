import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(testDir, '..')
const clientRoot = path.resolve(repoRoot, 'dist/client')
const workerUrl = pathToFileURL(path.resolve(repoRoot, 'dist/server/index.js'))
workerUrl.searchParams.set('test', `${process.pid}-${Date.now()}`)

const { default: worker } = await import(workerUrl.href)

const contentType = (filePath) => {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8'
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8'
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8'
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8'
  if (filePath.endsWith('.svg')) return 'image/svg+xml'

  return 'application/octet-stream'
}

const assets = {
  async fetch(request) {
    const pathname = decodeURIComponent(new URL(request.url).pathname)
    const relativePath = pathname.replace(/^\/+/, '')
    const filePath = path.resolve(clientRoot, relativePath)

    if (!filePath.startsWith(`${clientRoot}${path.sep}`)) {
      return new Response('Not Found', { status: 404 })
    }

    try {
      const body = await readFile(filePath)
      return new Response(body, {
        status: 200,
        headers: { 'content-type': contentType(filePath) }
      })
    } catch (error) {
      if (error?.code === 'ENOENT' || error?.code === 'EISDIR') {
        return new Response('Not Found', { status: 404 })
      }

      throw error
    }
  }
}

const render = (pathname) =>
  worker.fetch(new Request(`https://falcon-ui.test${pathname}`), { ASSETS: assets })

test('serves the VitePress homepage from the Sites worker', async () => {
  const response = await render('/')
  const html = await response.text()

  assert.equal(response.status, 200)
  assert.match(response.headers.get('content-type') ?? '', /^text\/html\b/i)
  assert.match(html, /<title>Falcon UI<\/title>/)
  assert.match(html, /class="falcon-homepage"/)
})

test('maps VitePress clean routes to generated HTML files', async () => {
  const response = await render('/components/button')
  const html = await response.text()

  assert.equal(response.status, 200)
  assert.match(html, /<title>FlButton 按钮 \| Falcon UI<\/title>/)
  assert.equal(response.headers.get('cache-control'), 'no-cache')
})

test('preserves generated assets and the VitePress 404 page', async () => {
  const assetResponse = await render('/vp-icons.css')
  const notFoundResponse = await render('/missing-doc-page')

  assert.equal(assetResponse.status, 200)
  assert.match(assetResponse.headers.get('content-type') ?? '', /^text\/css\b/i)
  assert.equal(assetResponse.headers.get('cache-control'), 'public, max-age=31536000, immutable')
  assert.equal(notFoundResponse.status, 404)
  assert.match(await notFoundResponse.text(), /<title>404 \| Falcon UI<\/title>/)
})
