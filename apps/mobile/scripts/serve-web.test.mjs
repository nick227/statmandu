import { test } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createWebServer } from './serve-web.mjs'

test('web hosting preserves SPA routes and proxies API bodies, cookies and errors', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'statman-web-'))
  await writeFile(path.join(directory, 'index.html'), '<html>Statman</html>')
  const upstream = http.createServer(async (req, res) => {
    let body = ''
    for await (const chunk of req) body += chunk
    res.writeHead(req.url === '/missing' ? 404 : 200, {
      'content-type': 'application/json',
      'set-cookie': 'token=test; HttpOnly; Secure; Path=/',
    })
    res.end(JSON.stringify({ url: req.url, method: req.method, cookie: req.headers.cookie, body }))
  })
  await new Promise(resolve => upstream.listen(0, '127.0.0.1', resolve))
  const web = createWebServer({ upstream: `http://127.0.0.1:${upstream.address().port}`, publicDirectory: directory })
  await new Promise(resolve => web.listen(0, '127.0.0.1', resolve))
  const base = `http://127.0.0.1:${web.address().port}`
  try {
    assert.equal(await (await fetch(`${base}/players/example`)).text(), '<html>Statman</html>')
    const response = await fetch(`${base}/api/auth/login?test=1`, { method: 'POST', headers: { cookie: 'token=old' }, body: 'credentials' })
    assert.match(response.headers.get('set-cookie'), /token=test/)
    assert.deepEqual(await response.json(), { url: '/auth/login?test=1', method: 'POST', cookie: 'token=old', body: 'credentials' })
    assert.equal((await fetch(`${base}/api/missing`)).status, 404)
    assert.deepEqual(await (await fetch(`${base}/health`)).json(), { status: 'ok' })
  } finally {
    await Promise.all([new Promise(resolve => web.close(resolve)), new Promise(resolve => upstream.close(resolve))])
    await rm(directory, { recursive: true })
  }
})
