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

describe('getGameStats', () => {
  it('GET /games/{gameId}/stats', async () => {
    const { game, homePlayer } = await seedFinalizedGame()

    const res = await app.inject({ method: 'GET', url: `/games/${game.id}/stats` })
    expect(res.statusCode).toBe(200)
    await validateResponse('getGameStats', 200, res.json())
    expect(res.json().data.some((l: any) => l.playerId === homePlayer.id)).toBe(true)
  })
})
