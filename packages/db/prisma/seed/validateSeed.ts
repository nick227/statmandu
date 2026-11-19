import { db } from '../../src/client'
import type { SeedScenario } from './config'
import { assertSeed } from './helpers'
import { seedPlayerSlugs, seedUserEmails } from './ids'

export interface SeedCounts {
  users: number
  teams: number
  athletes: number
  games: number
  gameEvents: number
  cards: number
  generationJobs: number
  follows: number
  saves: number
  claims: number
  disputes: number
}

export async function collectSeedCounts(): Promise<SeedCounts> {
  const seedUsers = await db.user.findMany({ where: { email: { in: seedUserEmails } }, select: { id: true } })
  const seedUserIds = seedUsers.map((user) => user.id)
  const seedAthletes = await db.personProfile.findMany({ where: { slug: { in: [...seedPlayerSlugs] } }, select: { id: true } })
  const seedAthleteIds = seedAthletes.map((athlete) => athlete.id)
  const seedCards = await db.cardTemplate.findMany({ where: { id: { startsWith: 'seed-' } }, select: { id: true } })
  const seedCardIds = seedCards.map((card) => card.id)
  const [teams, games, gameEvents, generationJobs, follows, saves, claims, disputes] = await Promise.all([
    db.team.count({ where: { league: { slug: 'demo-league' } } }),
    db.game.count({ where: { id: { startsWith: 'seed-' }, sport: { slug: 'basketball' } } }),
    db.gameEvent.count({ where: { gameId: { startsWith: 'seed-' } } }),
    db.cardGenerationJob.count({ where: { id: { startsWith: 'seed-' } } }),
    db.follow.count({ where: { followerId: { in: seedUserIds } } }),
    db.cardSave.count({ where: { userId: { in: seedUserIds }, cardTemplateId: { in: seedCardIds } } }),
    db.claim.count({ where: { id: { startsWith: 'seed-' } } }),
    db.dispute.count({ where: { id: { startsWith: 'seed-' } } }),
  ])
  return { users: seedUsers.length, teams, athletes: seedAthleteIds.length, games, gameEvents, cards: seedCards.length, generationJobs, follows, saves, claims, disputes }
}

export async function validateSeed(scenario: SeedScenario) {
  const counts = await collectSeedCounts()
  assertSeed(counts.users >= 2, 'minimal accounts are missing')
  assertSeed(counts.teams >= 2, 'minimal teams are missing')

  if (scenario !== 'minimal') {
    assertSeed(counts.users >= 7, 'demo role accounts are incomplete')
    assertSeed(counts.teams >= 4, 'four basketball teams are required')
    assertSeed(counts.athletes >= 20, 'discovery requires at least 20 seeded athletes')
    assertSeed(counts.games >= 6, 'game discovery requires scheduled, live, final, and disputed fixtures')

    const athletes = await db.personProfile.findMany({
      where: { slug: { in: [...seedPlayerSlugs] } },
      include: { players: { include: { sport: true, rosterMemberships: true } }, claimedByUser: true },
    })
    for (const athlete of athletes) {
      assertSeed(athlete.players.length === 1, `${athlete.slug} must have exactly one seeded sport attachment`)
      assertSeed(athlete.players[0]!.sport.slug === 'basketball', `${athlete.slug} is attached to the wrong sport`)
      const activeBySeason = new Set<string>()
      for (const membership of athlete.players[0]!.rosterMemberships.filter((item) => item.isActive)) {
        assertSeed(!activeBySeason.has(membership.seasonId), `${athlete.slug} has duplicate active roster memberships in one season`)
        activeBySeason.add(membership.seasonId)
      }
      if (athlete.claimedByUserId) assertSeed(Boolean(athlete.claimedByUser), `${athlete.slug} has an invalid claim owner`)
    }

    const scoredGames = await db.game.findMany({
      where: { id: { startsWith: 'seed-' }, status: { in: ['FINAL', 'DISPUTED'] }, statLines: { some: {} } },
      include: { gameTeams: true, statLines: true },
    })
    for (const game of scoredGames) {
      for (const team of game.gameTeams) {
        const points = game.statLines.filter((line) => line.teamId === team.teamId).reduce((sum, line) => sum + line.points, 0)
        assertSeed(team.finalScore === points, `${game.id} score does not match its player stat lines`)
      }
      const participatingTeams = new Set(game.gameTeams.map((team) => team.teamId))
      assertSeed(game.statLines.every((line) => participatingTeams.has(line.teamId)), `${game.id} contains a stat line for a non-participant`)
    }

    const featured = await db.cardTemplate.count({ where: { id: { startsWith: 'seed-' }, visibility: 'PUBLIC', status: 'PUBLISHED' } })
    const live = await db.game.count({ where: { id: { startsWith: 'seed-' }, status: 'LIVE' } })
    const scheduled = await db.game.count({ where: { id: { startsWith: 'seed-' }, status: 'SCHEDULED' } })
    const leaderboard = await db.playerSeasonStat.count({ where: { player: { athleteProfile: { slug: { in: [...seedPlayerSlugs] } } } } })
    assertSeed(featured >= 1, 'home/card discovery has no published public card')
    assertSeed(live >= 1 && scheduled >= 1, 'home discovery lacks live or upcoming games')
    assertSeed(leaderboard >= 1, 'Explore has no leaderboard data')
    assertSeed(counts.follows >= 1, 'social discovery has no seeded follows')
    assertSeed(counts.claims >= 1 && counts.disputes >= 1, 'verification states are not represented')
  }

  if (scenario === 'full' || scenario === 'cards') {
    assertSeed(counts.cards >= 24, 'card discovery requires at least 24 seed-owned cards')
    assertSeed(counts.generationJobs >= 6, 'card generation lifecycle fixtures are incomplete')
    assertSeed(counts.saves >= 10, 'the fan collection needs meaningful saved-card data')

    const activeJobs = await db.cardGenerationJob.findMany({
      where: { id: { startsWith: 'seed-' }, status: { in: ['QUEUED', 'PROCESSING'] }, cardTemplate: { batchRequestId: { not: null } } },
      include: { cardTemplate: true },
    })
    const activeAthletes = new Set<string>()
    for (const job of activeJobs) {
      assertSeed(!activeAthletes.has(job.cardTemplate.athleteProfileId), `multiple active generation batches exist for athlete ${job.cardTemplate.athleteProfileId}`)
      activeAthletes.add(job.cardTemplate.athleteProfileId)
    }
  }

  if (scenario === 'full' || scenario === 'verification' || scenario === 'live-game') {
    const [claimStates, disputeStates, resolvedConsensus] = await Promise.all([
      db.claim.groupBy({ by: ['status'], where: { id: { startsWith: 'seed-' } }, _count: true }),
      db.dispute.groupBy({ by: ['status'], where: { id: { startsWith: 'seed-' } }, _count: true }),
      db.gameConsensusGroup.count({ where: { id: 'seed-live-consensus-resolved', status: 'RESOLVED' } }),
    ])
    const claims = new Set(claimStates.map((state) => state.status))
    const disputes = new Set(disputeStates.map((state) => state.status))
    assertSeed(['PENDING', 'APPROVED', 'REJECTED'].every((status) => claims.has(status as never)), 'claim review states are incomplete')
    assertSeed(disputes.has('OPEN') && disputes.has('RESOLVED'), 'open and resolved disputes are required')
    assertSeed(resolvedConsensus === 1, 'resolved live-game conflict is missing')
  }

  console.log(`✓ Validation passed: ${Object.entries(counts).map(([name, count]) => `${name}=${count}`).join(', ')}`)
  return counts
}
