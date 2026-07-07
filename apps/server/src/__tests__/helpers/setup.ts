import { db } from '@statman/db'
import { afterEach } from 'vitest'

// Clean between tests — order matters for FK constraints (children before parents).
// Extend this list as new models are added in later iterations.
afterEach(async () => {
  await db.feedItem.deleteMany()
  await db.mediaAsset.deleteMany()
  await db.reaction.deleteMany()
  await db.follow.deleteMany()
  await db.dispute.deleteMany()
  await db.claim.deleteMany()
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
  await db.athleteProfile.deleteMany()
  await db.team.deleteMany()
  await db.season.deleteMany()
  await db.school.deleteMany()
  await db.league.deleteMany()
  await db.sport.deleteMany()
  await db.session.deleteMany()
  await db.profile.deleteMany()
  await db.user.deleteMany()
})
