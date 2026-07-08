import { defineConfig } from 'vitest/config'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Tests run against a dedicated database (never the dev DB) — setup.ts
// truncates every table in beforeEach, which would otherwise wipe out
// `pnpm db:seed` demo data on every `pnpm test` run.
function loadTestEnv(): Record<string, string> {
  const path = resolve(__dirname, '../../.env.test')
  const env: Record<string, string> = {}
  for (const line of readFileSync(path, 'utf-8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
  }
  return env
}

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    env: loadTestEnv(),
    setupFiles: ['./src/__tests__/helpers/setup.ts'],
    testTimeout: 15000,
    // Test files share one real MySQL database (no per-file isolation), and
    // beforeEach truncates every table — running files concurrently causes
    // cross-file unique-constraint collisions and races. Force sequential.
    fileParallelism: false,
  },
})
