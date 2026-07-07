// Generated from openapi.yaml — fill in seeds and assertions.
// Run `pnpm test:generate` to add stubs for new routes.
import { describe, it, expect } from 'vitest'
import { buildTestApp, asAuth, validateResponse, testUserId } from './helpers'
import { seedGameFixture } from './helpers/gameFixtures'

const app = buildTestApp()

describe('listGames', () => {
  it('GET /games', async () => {
    await seedGameFixture()

    const res = await app.inject({ method: 'GET', url: '/games' })
    expect(res.statusCode).toBe(200)
    await validateResponse('listGames', 200, res.json())
    expect(res.json().data).toHaveLength(1)
  })
})

describe('createGame', () => {
  it('requires auth', async () => {
    const res = await app.inject({ method: 'POST', url: '/games' })
    expect(res.statusCode).toBe(401)
  })

  it('POST /games', async () => {
    const { sport, homeTeam, awayTeam } = await seedGameFixture()

    const res = await app.inject({
      method: 'POST',
      url: '/games',
      headers: asAuth(testUserId),
      payload: {
        sportSlug: sport.slug,
        scheduledAt: new Date().toISOString(),
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
      },
    })
    expect(res.statusCode).toBe(201)
    await validateResponse('createGame', 201, res.json())
    expect(res.json().data.gameTeams).toHaveLength(2)
  })
})

describe('getGame', () => {
  it('GET /games/{gameId}', async () => {
    const { game } = await seedGameFixture()

    const res = await app.inject({ method: 'GET', url: `/games/${game.id}` })
    expect(res.statusCode).toBe(200)
    await validateResponse('getGame', 200, res.json())
    expect(res.json().data.id).toBe(game.id)
  })

  it('404s for an unknown game', async () => {
    const res = await app.inject({ method: 'GET', url: '/games/00000000-0000-0000-0000-000000000001' })
    expect(res.statusCode).toBe(404)
  })
})
