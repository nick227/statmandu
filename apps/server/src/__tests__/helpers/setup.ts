import { db } from '@statman/db'
import { beforeAll, beforeEach } from 'vitest'
import { cardGenerationExecutor } from '../../jobs/GenerationExecutor'

function assertTestDatabase() {
  const databaseUrl = process.env.DATABASE_URL ?? ''
  if (!/statman_test(?:\?|$)/.test(databaseUrl)) {
    throw new Error(
      `Refusing to run server tests against non-test database: ${databaseUrl || '(unset DATABASE_URL)'}`
    )
  }
}

// Clean between tests — order matters for FK constraints (children before parents).
export async function resetTestDatabase() {
  await cardGenerationExecutor.drain()
  await db.adminAuditLog.deleteMany()
  await db.importRecord.deleteMany()
  await db.importRawSnapshot.deleteMany()
  await db.importRun.deleteMany()
  await db.importRequestLog.deleteMany()
  await db.importedStatLine.deleteMany()
  await db.externalEntityMapping.deleteMany()
  await db.feedItem.deleteMany()
  await db.cardDownloadEvent.deleteMany()
  await db.cardSave.deleteMany()
  await db.cardIssue.deleteMany()
  await db.cardGenerationJob.deleteMany()
  await db.cardRelease.deleteMany()
  await db.cardTemplate.deleteMany()
  await db.storefront.deleteMany()
  await db.imageAsset.deleteMany()
  await db.mediaAsset.deleteMany()
  await db.reaction.deleteMany()
  await db.gameReaction.deleteMany()
  await db.follow.deleteMany()
  await db.dispute.deleteMany()
  await db.claim.deleteMany()
  await db.article.deleteMany()
  await db.sourceReference.deleteMany()
  await db.gameStatLine.deleteMany()
  await db.gameEvent.deleteMany()
  await db.gameConsensusGroup.deleteMany()
  await db.gameReporter.deleteMany()
  await db.gameTeam.deleteMany()
  await db.playerSeasonStat.deleteMany()
  await db.teamSeasonStat.deleteMany()
  await db.game.deleteMany()
  await db.rosterMembership.deleteMany()
  await db.player.deleteMany()
  await db.personProfile.deleteMany()
  await db.team.deleteMany()
  await db.season.deleteMany()
  await db.school.deleteMany()
  await db.league.deleteMany()
  await db.sport.deleteMany()
  await db.session.deleteMany()
  await db.profile.deleteMany()
  await db.user.deleteMany()
}

beforeAll(() => {
  assertTestDatabase()
})

beforeEach(async () => {
  await resetTestDatabase()
})
