const htmlHeaders = {
  'cache-control': 'no-cache',
  'x-content-type-options': 'nosniff'
}

const assetHeaders = {
  'cache-control': 'public, max-age=31536000, immutable',
  'x-content-type-options': 'nosniff'
}

const toAssetRequest = (request, pathname) => {
  const url = new URL(request.url)
  url.pathname = pathname

  return new Request(url, request)
}

const withSiteHeaders = (response, pathname, status = response.status) => {
  const headers = new Headers(response.headers)
  const extraHeaders = pathname.endsWith('.html') ? htmlHeaders : assetHeaders

  for (const [name, value] of Object.entries(extraHeaders)) {
    headers.set(name, value)
  }

  return new Response(response.body, {
    status,
    statusText: status === response.status ? response.statusText : undefined,
    headers
  })
}

const routeCandidates = (pathname) => {
  if (pathname === '/') return ['/index.html']
  if (pathname.endsWith('/')) return [`${pathname}index.html`, pathname]
  if (!pathname.split('/').at(-1)?.includes('.')) return [`${pathname}.html`, pathname]

  return [pathname]
}

const worker = {
  async fetch(request, env) {
    if (!['GET', 'HEAD'].includes(request.method)) {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: { allow: 'GET, HEAD' }
      })
    }

    const { pathname } = new URL(request.url)

    for (const candidate of routeCandidates(pathname)) {
      const response = await env.ASSETS.fetch(toAssetRequest(request, candidate))

      if (response.status !== 404) return withSiteHeaders(response, candidate)
    }

    const notFoundPath = '/404.html'
    const notFound = await env.ASSETS.fetch(toAssetRequest(request, notFoundPath))

    if (notFound.status !== 404) return withSiteHeaders(notFound, notFoundPath, 404)

    return new Response('Not Found', {
      status: 404,
      headers: { 'content-type': 'text/plain; charset=utf-8' }
    })
  }
}

export default worker
