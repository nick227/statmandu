import { db } from '../../src/client'
import { SeedClock } from './helpers'

export async function seedAdditionalGames(referenceDate: Date) {
  const clock = new SeedClock(referenceDate)
  const sport = await db.sport.findUniqueOrThrow({ where: { slug: 'basketball' } })
  const league = await db.league.findUniqueOrThrow({ where: { slug: 'demo-league' } })
  const season = await db.season.findUniqueOrThrow({ where: { slug: '2025-26' } })
  const teams = await db.team.findMany({ where: { leagueId: league.id }, orderBy: { slug: 'asc' }, take: 4 })
  if (teams.length < 4) throw new Error('Full seed requires four basketball teams')

  const fixtures = [
    { offset: -21, home: 0, away: 2, status: 'FINAL' as const, scores: [72, 70] },
    { offset: -17, home: 3, away: 1, status: 'FINAL' as const, scores: [91, 68] },
    { offset: -14, home: 2, away: 3, status: 'FINAL' as const, scores: [64, 64] },
    { offset: -8, home: 1, away: 2, status: 'FINAL' as const, scores: [55, 60] },
    { offset: 2, home: 2, away: 0, status: 'SCHEDULED' as const },
    { offset: 5, home: 1, away: 3, status: 'SCHEDULED' as const },
    { offset: 9, home: 3, away: 0, status: 'SCHEDULED' as const },
    { offset: 12, home: 2, away: 1, status: 'SCHEDULED' as const },
  ]

  for (const [index, fixture] of fixtures.entries()) {
    const id = `seed-schedule-game-${String(index + 1).padStart(2, '0')}`
    const scheduledAt = clock.days(fixture.offset, 7)
    await db.game.upsert({
      where: { id },
      update: { sportId: sport.id, leagueId: league.id, seasonId: season.id, scheduledAt, status: fixture.status, startedAt: fixture.status === 'FINAL' ? scheduledAt : null, finalizedAt: fixture.status === 'FINAL' ? new Date(scheduledAt.getTime() + 7_200_000) : null },
      create: { id, sportId: sport.id, leagueId: league.id, seasonId: season.id, scheduledAt, venue: `${teams[fixture.home]!.name} Gym`, status: fixture.status, startedAt: fixture.status === 'FINAL' ? scheduledAt : null, finalizedAt: fixture.status === 'FINAL' ? new Date(scheduledAt.getTime() + 7_200_000) : null },
    })
    for (const [side, teamIndex] of [fixture.home, fixture.away].entries()) {
      await db.gameTeam.upsert({
        where: { gameId_teamId: { gameId: id, teamId: teams[teamIndex]!.id } },
        update: { isHome: side === 0, finalScore: fixture.scores?.[side] ?? null },
        create: { gameId: id, teamId: teams[teamIndex]!.id, isHome: side === 0, finalScore: fixture.scores?.[side] ?? null },
      })
    }
  }
  console.log(`✓ Games: ${fixtures.length} additional fixed-date basketball fixtures`)
}
