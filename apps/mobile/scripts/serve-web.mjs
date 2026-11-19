import http from 'node:http'
import https from 'node:https'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import handler from 'serve-handler'

export function createWebServer({ upstream, publicDirectory }) {
  const target = new URL(upstream)
  if (!['http:', 'https:'].includes(target.protocol)) throw new Error('Invalid API_UPSTREAM protocol')
  return http.createServer((request, response) => {
    const url = request.url ?? '/'
    if (url === '/health') {
      response.writeHead(200, { 'content-type': 'application/json' })
      response.end('{"status":"ok"}')
      return
    }
    if (url === '/api' || url.startsWith('/api/') || url.startsWith('/api?')) {
      const transport = target.protocol === 'https:' ? https : http
      const proxy = transport.request({
        protocol: target.protocol,
        hostname: target.hostname,
        port: target.port,
        method: request.method,
        // Pass only the path to the configured origin; never resolve a client URL.
        path: url.slice(4) || '/',
        headers: { ...request.headers, host: target.host },
      }, upstreamResponse => {
        response.writeHead(upstreamResponse.statusCode ?? 502, upstreamResponse.headers)
        upstreamResponse.pipe(response)
        upstreamResponse.on('error', () => response.destroy())
      })
      proxy.setTimeout(120_000, () => proxy.destroy(new Error('API timeout')))
      proxy.on('error', () => {
        if (response.headersSent) return response.destroy()
        response.writeHead(502, { 'content-type': 'application/json' })
        response.end('{"error":"API unavailable"}')
      })
      request.on('aborted', () => proxy.destroy())
      response.on('close', () => { if (!response.writableEnded) proxy.destroy() })
      request.pipe(proxy)
      return
    }
    handler(request, response, {
      public: publicDirectory,
      rewrites: [{ source: '**', destination: '/index.html' }],
      headers: [{ source: '**', headers: [{ key: 'Cache-Control', value: 'no-cache' }] }],
    }).catch(() => {
      if (response.headersSent) return response.destroy()
      response.writeHead(500)
      response.end('Unable to serve application')
    })
  })
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.env.API_UPSTREAM) throw new Error('API_UPSTREAM is required')
  const server = createWebServer({
    upstream: process.env.API_UPSTREAM,
    publicDirectory: fileURLToPath(new URL('../dist/', import.meta.url)),
  })
  server.listen(Number(process.env.PORT ?? 3001), '0.0.0.0', () => console.log('Web server listening'))
  for (const signal of ['SIGTERM', 'SIGINT']) process.once(signal, () => server.close())
}
