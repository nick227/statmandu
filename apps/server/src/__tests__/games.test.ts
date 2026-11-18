// Generated from openapi.yaml — fill in seeds and assertions.
// Run `pnpm test:generate` to add stubs for new routes.
import { describe, it, expect } from 'vitest'
import { db } from '@statman/db'
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
    expect(res.json().data.leagueId).toBe(homeTeam.leagueId)
  })

  it('rejects scheduling a team against itself', async () => {
    const { sport, homeTeam } = await seedGameFixture()

    const res = await app.inject({
      method: 'POST',
      url: '/games',
      headers: asAuth(testUserId),
      payload: {
        sportSlug: sport.slug,
        scheduledAt: new Date().toISOString(),
        homeTeamId: homeTeam.id,
        awayTeamId: homeTeam.id,
      },
    })
    expect(res.statusCode).toBe(400)
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

describe('recordGameScore', () => {
  it('requires auth', async () => {
    const { game } = await seedGameFixture()
    const res = await app.inject({ method: 'PATCH', url: `/games/${game.id}`, payload: { homeScore: 74, awayScore: 68 } })
    expect(res.statusCode).toBe(401)
  })

  it('records a historical final score', async () => {
    const { game, homeTeam, awayTeam } = await seedGameFixture()
    const res = await app.inject({
      method: 'PATCH',
      url: `/games/${game.id}`,
      headers: asAuth(testUserId),
      payload: { homeScore: 74, awayScore: 68 },
    })

    expect(res.statusCode).toBe(200)
    await validateResponse('recordGameScore', 200, res.json())
    expect(res.json().data.status).toBe('FINAL')
    expect(res.json().data.gameTeams.find((team: any) => team.teamId === homeTeam.id).finalScore).toBe(74)
    expect(res.json().data.gameTeams.find((team: any) => team.teamId === awayTeam.id).finalScore).toBe(68)
  })

  it('rejects direct score replacement while a game is live', async () => {
    const { game } = await seedGameFixture()
    await db.game.update({ where: { id: game.id }, data: { status: 'LIVE', startedAt: new Date() } })

    const res = await app.inject({
      method: 'PATCH',
      url: `/games/${game.id}`,
      headers: asAuth(testUserId),
      payload: { homeScore: 74, awayScore: 68 },
    })

    expect(res.statusCode).toBe(409)
  })
})
