import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

function readDotEnv(path) {
  const env = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim().replace(/^"|"$/g, '')
    env[key] = value
  }
  return env
}

const testEnv = readDotEnv(resolve(process.cwd(), '.env.test'))
const databaseUrl = testEnv.DATABASE_URL

if (!databaseUrl || !/statman_test(?:\?|$)/.test(databaseUrl)) {
  throw new Error(`Refusing to push schema to non-test database: ${databaseUrl || '(unset DATABASE_URL)'}`)
}

const result = spawnSync('pnpm', ['--filter', '@statman/db', 'exec', 'prisma', 'db', 'push', '--accept-data-loss'], {
  stdio: 'inherit',
  env: { ...process.env, DATABASE_URL: databaseUrl },
})

process.exit(result.status ?? 1)
