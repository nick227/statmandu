import { db } from '../../src/client'
import { seedDemo } from '../seed'
import { loadSeedConfig } from './config'
import { seedCards } from './seedCards'
import { seedAdditionalGames } from './seedGames'
import { seedMinimal } from './seedMinimal'
import { seedVerificationAndAdmin } from './seedWorkflows'
import { collectSeedCounts, validateSeed } from './validateSeed'

function totalCounts(counts: object) {
  return Object.values(counts as Record<string, number>).reduce((total, count) => total + count, 0)
}

async function main() {
  const config = loadSeedConfig()
  console.log('Statman deterministic seed')
  console.log(`  environment: ${config.nodeEnv}${config.allowUnsafe ? ' (unsafe override enabled)' : ''}`)
  console.log(`  target:      ${config.target.host}/${config.target.database}`)
  console.log(`  scenario:    ${config.scenario}`)
  console.log(`  reference:   ${config.referenceDate.toISOString()}`)
  const before = await collectSeedCounts()

  if (process.env.SEED_VALIDATE_ONLY !== 'true') {
    if (config.scenario === 'minimal') {
      await seedMinimal(config)
    } else {
      await seedDemo(config)
      if (config.scenario === 'full') await seedAdditionalGames(config.referenceDate)
      if (config.scenario === 'full' || config.scenario === 'cards') await seedCards(config.referenceDate)
      if (config.scenario === 'full' || config.scenario === 'verification' || config.scenario === 'live-game') {
        await seedVerificationAndAdmin(config.referenceDate)
      }
    }
  }

  const after = await validateSeed(config.scenario)
  const created = Object.keys(after).reduce((total, key) => total + Math.max(0, after[key as keyof typeof after] - before[key as keyof typeof before]), 0)
  const preserved = Object.keys(after).reduce((total, key) => total + Math.min(after[key as keyof typeof after], before[key as keyof typeof before]), 0)
  const validateOnly = process.env.SEED_VALIDATE_ONLY === 'true'
  console.log(`✓ Reconciliation: created=${validateOnly ? 0 : created}, updated=${validateOnly ? 0 : preserved}, preserved=${preserved}, skipped=${validateOnly ? totalCounts(after) : 0}, deleted=0`)
  console.log('Seed complete.')
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
