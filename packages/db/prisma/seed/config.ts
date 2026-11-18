export const SEED_SCENARIOS = ['minimal', 'demo', 'full', 'cards', 'live-game', 'verification'] as const

export type SeedScenario = (typeof SEED_SCENARIOS)[number]

export const DEFAULT_SEED_REFERENCE_DATE = '2026-07-01T12:00:00.000Z'

export interface SeedTarget {
  host: string
  database: string
  safeByConvention: boolean
}

export interface SeedConfig {
  scenario: SeedScenario
  referenceDate: Date
  target: SeedTarget
  allowUnsafe: boolean
  nodeEnv: string
}

const SAFE_HOSTS = new Set(['localhost', '127.0.0.1', '::1', 'mysql', 'mariadb', 'database', 'db'])
const SAFE_DATABASE_PATTERN = /(?:^|[_-])(test|testing|dev|development|local|ci)(?:$|[_-])/i
const PRODUCTION_PATTERN = /(^|[._-])(prod|production|live)([._-]|$)/i

export function parseSeedScenario(value: string | undefined): SeedScenario {
  const scenario = value ?? 'full'
  if (!SEED_SCENARIOS.includes(scenario as SeedScenario)) {
    throw new Error(`Unknown seed scenario "${scenario}". Expected one of: ${SEED_SCENARIOS.join(', ')}`)
  }
  return scenario as SeedScenario
}

export function parseSeedReferenceDate(value: string | undefined): Date {
  const raw = value ? (/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00.000Z` : value) : DEFAULT_SEED_REFERENCE_DATE
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid SEED_REFERENCE_DATE: "${value}"`)
  return date
}

export function inspectDatabaseUrl(databaseUrl: string): SeedTarget {
  let parsed: URL
  try {
    parsed = new URL(databaseUrl)
  } catch {
    throw new Error('DATABASE_URL is not a valid URL')
  }

  if (!['mysql:', 'mariadb:'].includes(parsed.protocol)) {
    throw new Error(`Seed supports MySQL/MariaDB URLs, received ${parsed.protocol}`)
  }

  const host = parsed.hostname.toLowerCase()
  const database = decodeURIComponent(parsed.pathname.replace(/^\//, '')).split('?')[0] ?? ''
  if (!host || !database) throw new Error('DATABASE_URL must include a host and database name')

  const explicitlyProductionLike = PRODUCTION_PATTERN.test(host) || PRODUCTION_PATTERN.test(database)
  const safeByConvention = !explicitlyProductionLike && (SAFE_HOSTS.has(host) || SAFE_DATABASE_PATTERN.test(database))
  return { host, database, safeByConvention }
}

export function loadSeedConfig(env: NodeJS.ProcessEnv = process.env): SeedConfig {
  if (!env.DATABASE_URL) throw new Error('DATABASE_URL is required')
  const nodeEnv = env.NODE_ENV ?? 'development'
  const allowUnsafe = env.ALLOW_UNSAFE_SEED === 'true'
  const target = inspectDatabaseUrl(env.DATABASE_URL)

  if (nodeEnv === 'production' && !allowUnsafe) {
    throw new Error('Seed refused: NODE_ENV=production. Set ALLOW_UNSAFE_SEED=true only for an intentional administrative operation.')
  }
  if (!target.safeByConvention && !allowUnsafe) {
    throw new Error(
      `Seed refused: ${target.host}/${target.database} is not recognizably local, development, CI, or test. ` +
      'Set ALLOW_UNSAFE_SEED=true only after verifying the target.',
    )
  }

  return {
    scenario: parseSeedScenario(env.SEED_SCENARIO),
    referenceDate: parseSeedReferenceDate(env.SEED_REFERENCE_DATE),
    target,
    allowUnsafe,
    nodeEnv,
  }
}
