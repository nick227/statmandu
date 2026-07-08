import { db } from '@statman/db'

export async function seedGameFixture() {
  const sport = await db.sport.create({ data: { slug: 'basketball', name: 'Basketball' } })
  const league = await db.league.create({ data: { sportId: sport.id, slug: 'demo-league', name: 'Demo League' } })
  const season = await db.season.create({ data: { leagueId: league.id, slug: '2025-26', name: '2025-26' } })
  const homeTeam = await db.team.create({ data: { sportId: sport.id, leagueId: league.id, slug: 'home-team', name: 'Home Team' } })
  const awayTeam = await db.team.create({ data: { sportId: sport.id, leagueId: league.id, slug: 'away-team', name: 'Away Team' } })

  const homeProfile = await db.athleteProfile.create({
    data: { slug: 'home-player', firstName: 'Home', lastName: 'Player', sourceStatus: 'PLAYER_REPORTED' },
  })
  const homePlayer = await db.player.create({ data: { athleteProfileId: homeProfile.id, sportId: sport.id } })

  const awayProfile = await db.athleteProfile.create({
    data: { slug: 'away-player', firstName: 'Away', lastName: 'Player', sourceStatus: 'PLAYER_REPORTED' },
  })
  const awayPlayer = await db.player.create({ data: { athleteProfileId: awayProfile.id, sportId: sport.id } })

  await db.rosterMembership.create({
    data: { playerId: homePlayer.id, teamId: homeTeam.id, seasonId: season.id, jerseyNumber: 1 },
  })
  await db.rosterMembership.create({
    data: { playerId: awayPlayer.id, teamId: awayTeam.id, seasonId: season.id, jerseyNumber: 2 },
  })

  const game = await db.game.create({
    data: {
      sportId: sport.id,
      seasonId: season.id,
      scheduledAt: new Date(),
      gameTeams: {
        create: [
          { teamId: homeTeam.id, isHome: true },
          { teamId: awayTeam.id, isHome: false },
        ],
      },
    },
  })

  return { sport, league, season, homeTeam, awayTeam, homePlayer, awayPlayer, game }
}
