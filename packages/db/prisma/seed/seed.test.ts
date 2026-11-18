import assert from 'node:assert/strict'
import test from 'node:test'
import { DEFAULT_SEED_REFERENCE_DATE, inspectDatabaseUrl, loadSeedConfig, parseSeedReferenceDate, parseSeedScenario } from './config'
import { assertSeed, SeedClock } from './helpers'
import { isSeedOwnedId, numberedSeedId, seedIds } from './ids'

test('scenario selection is explicit and defaults to full', () => {
  assert.equal(parseSeedScenario(undefined), 'full')
  assert.equal(parseSeedScenario('minimal'), 'minimal')
  assert.throws(() => parseSeedScenario('everything'), /Unknown seed scenario/)
})

test('seed clock is stable and uses UTC noon for date-only input', () => {
  const date = parseSeedReferenceDate('2026-07-01')
  assert.equal(date.toISOString(), DEFAULT_SEED_REFERENCE_DATE)
  const clock = new SeedClock(date)
  assert.equal(clock.days(-2).toISOString(), '2026-06-29T12:00:00.000Z')
  assert.equal(clock.minutes(30).toISOString(), '2026-07-01T12:30:00.000Z')
})

test('production and unrecognized targets fail closed', () => {
  const base = { DATABASE_URL: 'mysql://user:secret@localhost/statman_test', NODE_ENV: 'development' }
  assert.equal(loadSeedConfig(base).target.database, 'statman_test')
  assert.throws(() => loadSeedConfig({ ...base, NODE_ENV: 'production' }), /NODE_ENV=production/)
  assert.throws(() => loadSeedConfig({ ...base, DATABASE_URL: 'mysql://user:secret@db.example.com/statman' }), /not recognizably/)
  assert.equal(loadSeedConfig({ ...base, NODE_ENV: 'production', ALLOW_UNSAFE_SEED: 'true' }).allowUnsafe, true)
})

test('database URL inspection never includes credentials', () => {
  assert.deepEqual(inspectDatabaseUrl('mysql://user:secret@127.0.0.1:3306/statman_dev'), { host: '127.0.0.1', database: 'statman_dev', safeByConvention: true })
})

test('manifest IDs are stable and seed-owned', () => {
  assert.equal(seedIds.users.admin.id, 'seed-user-admin')
  assert.equal(numberedSeedId('seed-card-', 0), 'seed-card-01')
  assert.equal(isSeedOwnedId(seedIds.games.live), true)
  assert.equal(isSeedOwnedId('local-user-record'), false)
})

test('validation assertions fail loudly', () => {
  assert.throws(() => assertSeed(false, 'expected fixture'), /Seed validation failed: expected fixture/)
})
