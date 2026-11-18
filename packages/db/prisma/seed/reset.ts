import { db } from '../../src/client'
import { loadSeedConfig } from './config'
import { seedPlayerSlugs, seedUserEmails } from './ids'

async function resetSeedOwnedData() {
  const config = loadSeedConfig()
  if (process.env.CONFIRM_SEED_RESET !== 'seed-owned-data') {
    throw new Error('Reset refused: set CONFIRM_SEED_RESET=seed-owned-data after checking the printed command target.')
  }

  console.log('Statman seed-owned reset')
  console.log(`  environment: ${config.nodeEnv}${config.allowUnsafe ? ' (unsafe override enabled)' : ''}`)
  console.log(`  target:      ${config.target.host}/${config.target.database}`)
  console.log('  ownership:   reserved seed IDs, manifest emails/slugs, and their known relationships')

  const users = await db.user.findMany({ where: { email: { in: seedUserEmails } }, select: { id: true } })
  const userIds = users.map((user) => user.id)
  const athletes = await db.athleteProfile.findMany({ where: { slug: { in: [...seedPlayerSlugs] } }, select: { id: true } })
  const athleteIds = athletes.map((athlete) => athlete.id)
  const players = await db.player.findMany({ where: { athleteProfileId: { in: athleteIds } }, select: { id: true } })
  const playerIds = players.map((player) => player.id)
  const cards = await db.cardTemplate.findMany({ where: { id: { startsWith: 'seed-' } }, select: { id: true } })
  const cardIds = cards.map((card) => card.id)
  const games = await db.game.findMany({ where: { id: { startsWith: 'seed-' } }, select: { id: true } })
  const gameIds = games.map((game) => game.id)
  const issues = await db.cardIssue.findMany({ where: { id: { startsWith: 'seed-' } }, select: { id: true } })
  const issueIds = issues.map((issue) => issue.id)

  await db.$transaction(async (tx) => {
    await tx.cardDownloadEvent.deleteMany({ where: { OR: [{ id: { startsWith: 'seed-' } }, { cardIssueId: { in: issueIds } }] } })
    await tx.cardSave.deleteMany({ where: { cardTemplateId: { in: cardIds }, userId: { in: userIds } } })
    await tx.cardIssue.deleteMany({ where: { id: { startsWith: 'seed-' } } })
    await tx.cardGenerationJob.deleteMany({ where: { id: { startsWith: 'seed-' } } })
    await tx.cardTemplate.deleteMany({ where: { id: { startsWith: 'seed-' } } })
    await tx.imageAsset.deleteMany({ where: { id: { startsWith: 'seed-' } } })
    await tx.mediaAsset.deleteMany({ where: { id: { startsWith: 'seed-' } } })
    await tx.sourceReference.deleteMany({ where: { id: { startsWith: 'seed-' } } })
    await tx.dispute.deleteMany({ where: { id: { startsWith: 'seed-' } } })
    await tx.claim.deleteMany({ where: { id: { startsWith: 'seed-' } } })
    await tx.importRecord.deleteMany({ where: { importRunId: { startsWith: 'seed-' } } })
    await tx.importRun.deleteMany({ where: { id: { startsWith: 'seed-' } } })
    await tx.adminAuditLog.deleteMany({ where: { id: { startsWith: 'seed-' } } })
    await tx.feedItem.deleteMany({ where: { OR: [{ id: { startsWith: 'seed-' } }, { targetId: { in: [...gameIds, ...playerIds, ...cardIds] } }] } })
    await tx.reaction.deleteMany({ where: { userId: { in: userIds }, targetId: { in: [...gameIds, ...playerIds] } } })
    await tx.follow.deleteMany({ where: { followerId: { in: userIds }, targetId: { in: playerIds } } })
    await tx.gameEvent.deleteMany({ where: { gameId: { in: gameIds } } })
    await tx.gameConsensusGroup.deleteMany({ where: { gameId: { in: gameIds } } })
    await tx.gameReporter.deleteMany({ where: { gameId: { in: gameIds } } })
    await tx.gameStatLine.deleteMany({ where: { gameId: { in: gameIds } } })
    await tx.gameReaction.deleteMany({ where: { gameId: { in: gameIds } } })
    await tx.gameTeam.deleteMany({ where: { gameId: { in: gameIds } } })
    await tx.game.deleteMany({ where: { id: { in: gameIds } } })
    await tx.playerSeasonStat.deleteMany({ where: { playerId: { in: playerIds } } })
    await tx.rosterMembership.deleteMany({ where: { playerId: { in: playerIds } } })
    await tx.player.deleteMany({ where: { id: { in: playerIds } } })
    await tx.athleteProfile.deleteMany({ where: { id: { in: athleteIds } } })
  })

  console.log('✓ Seed-owned domain data removed. Demo accounts and shared competition definitions were preserved intentionally.')
}

resetSeedOwnedData()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
