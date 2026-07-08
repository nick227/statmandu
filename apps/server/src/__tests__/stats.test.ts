// Generated from openapi.yaml — fill in seeds and assertions.
// Run `pnpm test:generate` to add stubs for new routes.
import { describe, it, expect } from 'vitest'
import { buildTestApp, asAuth, validateResponse, testUserId } from './helpers'
import { seedGameFixture } from './helpers/gameFixtures'
import { db } from '@statman/db'

const app = buildTestApp()

async function seedFinalizedGame() {
  const fixture = await seedGameFixture()
  await app.inject({
    method: 'POST',
    url: `/games/${fixture.game.id}/reporters`,
    headers: asAuth(testUserId),
    payload: { role: 'OFFICIAL_SCORER' },
  })
  await app.inject({
    method: 'POST',
    url: `/games/${fixture.game.id}/start-live`,
    headers: asAuth(testUserId),
  })
  await app.inject({
    method: 'POST',
    url: `/games/${fixture.game.id}/events`,
    headers: asAuth(testUserId),
    payload: { type: 'FG3_MADE', playerId: fixture.homePlayer.id, teamId: fixture.homeTeam.id, clientTimestamp: new Date().toISOString() },
  })
  await app.inject({ method: 'POST', url: `/games/${fixture.game.id}/finalize`, headers: asAuth(testUserId) })
  return fixture
}

describe('listPlayerGames', () => {
  it('GET /players/{playerId}/games', async () => {
    const { homePlayer } = await seedFinalizedGame()

    const res = await app.inject({ method: 'GET', url: `/players/${homePlayer.id}/games` })
    expect(res.statusCode).toBe(200)
    await validateResponse('listPlayerGames', 200, res.json())
    expect(res.json().data).toHaveLength(1)
    expect(res.json().data[0].points).toBe(3)
  })
})

describe('getPlayerSeasonStats', () => {
  it('GET /players/{playerId}/stats', async () => {
    const { homePlayer } = await seedFinalizedGame()

    const res = await app.inject({ method: 'GET', url: `/players/${homePlayer.id}/stats` })
    expect(res.statusCode).toBe(200)
    await validateResponse('getPlayerSeasonStats', 200, res.json())
    expect(res.json().data[0].gamesPlayed).toBe(1)
    expect(res.json().data[0].points).toBe(3)
  })
})

describe('getTeamSeasonStats', () => {
  it('GET /teams/{teamSlug}/stats', async () => {
    const { homeTeam } = await seedFinalizedGame()

    const res = await app.inject({ method: 'GET', url: `/teams/${homeTeam.slug}/stats` })
    expect(res.statusCode).toBe(200)
    await validateResponse('getTeamSeasonStats', 200, res.json())
    expect(res.json().data[0].wins).toBe(1)
    expect(res.json().data[0].pointsFor).toBe(3)
  })
})

describe('getPlayerLeaderboard', () => {
  it('GET /leaderboards/players ranks by derived sport stats', async () => {
    const { awayPlayer, homePlayer, season } = await seedGameFixture()
    await db.playerSeasonStat.createMany({
      data: [
        { playerId: homePlayer.id, seasonId: season.id, gamesPlayed: 2, points: 20, stats: { points: 20 } },
        { playerId: awayPlayer.id, seasonId: season.id, gamesPlayed: 3, points: 24, stats: { points: 24 } },
      ],
    })

    const res = await app.inject({ method: 'GET', url: `/leaderboards/players?sportSlug=basketball&seasonId=${season.id}&stat=ppg` })
    expect(res.statusCode).toBe(200)
    await validateResponse('getPlayerLeaderboard', 200, res.json())
    expect(res.json().data.map((entry: any) => entry.player.id)).toEqual([homePlayer.id, awayPlayer.id])
    expect(res.json().data[0].rank).toBe(1)
    expect(res.json().data[0].value).toBe(10)
  })

  it('rejects stats that do not belong to the player sport definition', async () => {
    const res = await app.inject({ method: 'GET', url: '/leaderboards/players?sportSlug=basketball&stat=wins' })
    expect(res.statusCode).toBe(400)
  })
})

describe('getTeamLeaderboard', () => {
  it('GET /leaderboards/teams ranks teams by configured team stats', async () => {
    const { awayTeam, homeTeam, season } = await seedGameFixture()
    await db.teamSeasonStat.createMany({
      data: [
        { teamId: homeTeam.id, seasonId: season.id, wins: 1, losses: 1, pointsFor: 101, pointsAgainst: 99, stats: { pointsFor: 101 } },
        { teamId: awayTeam.id, seasonId: season.id, wins: 2, losses: 0, pointsFor: 118, pointsAgainst: 90, stats: { pointsFor: 118 } },
      ],
    })

    const res = await app.inject({ method: 'GET', url: `/leaderboards/teams?sportSlug=basketball&seasonId=${season.id}&stat=pointsFor` })
    expect(res.statusCode).toBe(200)
    await validateResponse('getTeamLeaderboard', 200, res.json())
    expect(res.json().data.map((entry: any) => entry.team.id)).toEqual([awayTeam.id, homeTeam.id])
    expect(res.json().data[0].value).toBe(118)
  })
})

describe('getGameStats', () => {
  it('GET /games/{gameId}/stats', async () => {
    const { game, homePlayer } = await seedFinalizedGame()

    const res = await app.inject({ method: 'GET', url: `/games/${game.id}/stats` })
    expect(res.statusCode).toBe(200)
    await validateResponse('getGameStats', 200, res.json())
    expect(res.json().data.some((l: any) => l.playerId === homePlayer.id)).toBe(true)
  })
})
