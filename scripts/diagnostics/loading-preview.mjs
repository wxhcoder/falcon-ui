import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'

const root = fileURLToPath(new URL('../..', import.meta.url))
const cache = resolve(root, '.cache/loading-preview')
await mkdir(cache, { recursive: true })
await writeFile(
  resolve(cache, 'index.html'),
  `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><title>FlLoading browser acceptance</title></head><body>
<h1>FlLoading browser acceptance</h1><div id="app"></div>
<script type="module" src="/@fs/${root.replaceAll('\\', '/')}/scripts/diagnostics/loading-benchmark.ts"></script>
</body></html>`
)
const server = await createServer({
  configFile: false,
  root: cache,
  plugins: [vue()],
  server: { host: '127.0.0.1', port: 5176, strictPort: true, fs: { allow: [root] } }
})
await server.listen()
server.printUrls()
