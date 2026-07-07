// Generated from openapi.yaml — fill in seeds and assertions.
// Run `pnpm test:generate` to add stubs for new routes.
import { describe, it, expect } from 'vitest'
import { buildTestApp, asAuth, validateResponse, testUserId, testOtherUserId } from './helpers'
import { seedGameFixture } from './helpers/gameFixtures'
import { db } from '@statman/db'

const app = buildTestApp()

async function joinAsOfficialScorer(gameId: string, userId: string) {
  return app.inject({
    method: 'POST',
    url: `/games/${gameId}/reporters`,
    headers: asAuth(userId),
    payload: { role: 'OFFICIAL_SCORER' },
  })
}

describe('joinGameAsReporter', () => {
  it('requires auth', async () => {
    const res = await app.inject({ method: 'POST', url: '/games/00000000-0000-0000-0000-000000000001/reporters' })
    expect(res.statusCode).toBe(401)
  })

  it('POST /games/{gameId}/reporters', async () => {
    const { game } = await seedGameFixture()

    const res = await joinAsOfficialScorer(game.id, testUserId)
    expect(res.statusCode).toBe(201)
    await validateResponse('joinGameAsReporter', 201, res.json())
    expect(res.json().data.role).toBe('OFFICIAL_SCORER')
  })
})

describe('startLiveGame', () => {
  it('requires auth', async () => {
    const res = await app.inject({ method: 'POST', url: '/games/00000000-0000-0000-0000-000000000001/start-live' })
    expect(res.statusCode).toBe(401)
  })

  it('forbids a user who has not joined as a privileged reporter', async () => {
    const { game } = await seedGameFixture()

    const res = await app.inject({
      method: 'POST',
      url: `/games/${game.id}/start-live`,
      headers: asAuth(testUserId),
    })
    expect(res.statusCode).toBe(403)
  })

  it('POST /games/{gameId}/start-live', async () => {
    const { game } = await seedGameFixture()
    await joinAsOfficialScorer(game.id, testUserId)

    const res = await app.inject({
      method: 'POST',
      url: `/games/${game.id}/start-live`,
      headers: asAuth(testUserId),
    })
    expect(res.statusCode).toBe(200)
    await validateResponse('startLiveGame', 200, res.json())
    expect(res.json().data.status).toBe('LIVE')
  })
})

describe('submitGameEvent', () => {
  it('requires auth', async () => {
    const res = await app.inject({ method: 'POST', url: '/games/00000000-0000-0000-0000-000000000001/events' })
    expect(res.statusCode).toBe(401)
  })

  it('rejects a non-reporter', async () => {
    const { game, homePlayer, homeTeam } = await seedGameFixture()

    const res = await app.inject({
      method: 'POST',
      url: `/games/${game.id}/events`,
      headers: asAuth(testUserId),
      payload: {
        type: 'FG2_MADE',
        playerId: homePlayer.id,
        teamId: homeTeam.id,
        clientTimestamp: new Date().toISOString(),
      },
    })
    expect(res.statusCode).toBe(403)
  })

  it('auto-accepts a single reporter\'s event', async () => {
    const { game, homePlayer, homeTeam } = await seedGameFixture()
    await joinAsOfficialScorer(game.id, testUserId)

    const res = await app.inject({
      method: 'POST',
      url: `/games/${game.id}/events`,
      headers: asAuth(testUserId),
      payload: {
        type: 'FG2_MADE',
        playerId: homePlayer.id,
        teamId: homeTeam.id,
        clientTimestamp: new Date().toISOString(),
      },
    })
    expect(res.statusCode).toBe(201)
    await validateResponse('submitGameEvent', 201, res.json())
    expect(res.json().data.status).toBe('ACCEPTED')
  })

  it('leaves a two-reporter event PENDING until corroborated, then ACCEPTs both', async () => {
    const { game, homePlayer, homeTeam } = await seedGameFixture()
    await joinAsOfficialScorer(game.id, testUserId)
    await joinAsOfficialScorer(game.id, testOtherUserId)

    const clientTimestamp = new Date().toISOString()

    const first = await app.inject({
      method: 'POST',
      url: `/games/${game.id}/events`,
      headers: asAuth(testUserId),
      payload: { type: 'FG3_MADE', playerId: homePlayer.id, teamId: homeTeam.id, clientTimestamp },
    })
    expect(first.json().data.status).toBe('PENDING')

    const second = await app.inject({
      method: 'POST',
      url: `/games/${game.id}/events`,
      headers: asAuth(testOtherUserId),
      payload: { type: 'FG3_MADE', playerId: homePlayer.id, teamId: homeTeam.id, clientTimestamp },
    })
    expect(second.statusCode).toBe(201)
    expect(second.json().data.status).toBe('ACCEPTED')

    const refetchedFirst = await db.gameEvent.findUnique({ where: { id: first.json().data.id } })
    expect(refetchedFirst?.status).toBe('ACCEPTED')
    expect(refetchedFirst?.consensusGroupId).not.toBeNull()
  })
})

describe('undoGameEvent', () => {
  it('requires auth', async () => {
    const res = await app.inject({ method: 'DELETE', url: '/games/00000000-0000-0000-0000-000000000001/events/00000000-0000-0000-0000-000000000001' })
    expect(res.statusCode).toBe(401)
  })

  it('lets the original reporter undo their own event', async () => {
    const { game, homePlayer, homeTeam } = await seedGameFixture()
    await joinAsOfficialScorer(game.id, testUserId)

    const submitted = await app.inject({
      method: 'POST',
      url: `/games/${game.id}/events`,
      headers: asAuth(testUserId),
      payload: { type: 'TURNOVER', playerId: homePlayer.id, teamId: homeTeam.id, clientTimestamp: new Date().toISOString() },
    })
    const eventId = submitted.json().data.id

    const res = await app.inject({
      method: 'DELETE',
      url: `/games/${game.id}/events/${eventId}`,
      headers: asAuth(testUserId),
    })
    expect(res.statusCode).toBe(200)
    await validateResponse('undoGameEvent', 200, res.json())
    expect(res.json().data.status).toBe('REJECTED')
  })

  it('forbids a different reporter from undoing the event', async () => {
    const { game, homePlayer, homeTeam } = await seedGameFixture()
    await joinAsOfficialScorer(game.id, testUserId)
    await joinAsOfficialScorer(game.id, testOtherUserId)

    const submitted = await app.inject({
      method: 'POST',
      url: `/games/${game.id}/events`,
      headers: asAuth(testUserId),
      payload: { type: 'TURNOVER', playerId: homePlayer.id, teamId: homeTeam.id, clientTimestamp: new Date().toISOString() },
    })
    const eventId = submitted.json().data.id

    const res = await app.inject({
      method: 'DELETE',
      url: `/games/${game.id}/events/${eventId}`,
      headers: asAuth(testOtherUserId),
    })
    expect(res.statusCode).toBe(403)
  })
})

describe('getGameSnapshot', () => {
  it('GET /games/{gameId}/snapshot reflects accepted event points', async () => {
    const { game, homePlayer, homeTeam } = await seedGameFixture()
    await joinAsOfficialScorer(game.id, testUserId)

    await app.inject({
      method: 'POST',
      url: `/games/${game.id}/events`,
      headers: asAuth(testUserId),
      payload: { type: 'FG3_MADE', playerId: homePlayer.id, teamId: homeTeam.id, clientTimestamp: new Date().toISOString() },
    })

    const res = await app.inject({ method: 'GET', url: `/games/${game.id}/snapshot` })
    expect(res.statusCode).toBe(200)
    await validateResponse('getGameSnapshot', 200, res.json())
    const homeScore = res.json().data.score.find((s: any) => s.teamId === homeTeam.id)
    expect(homeScore.points).toBe(3)
  })
})

describe('finalizeGame', () => {
  it('requires auth', async () => {
    const res = await app.inject({ method: 'POST', url: '/games/00000000-0000-0000-0000-000000000001/finalize' })
    expect(res.statusCode).toBe(401)
  })

  it('produces a box score and season stat totals', async () => {
    const { game, homePlayer, homeTeam, season } = await seedGameFixture()
    await joinAsOfficialScorer(game.id, testUserId)

    await app.inject({
      method: 'POST',
      url: `/games/${game.id}/events`,
      headers: asAuth(testUserId),
      payload: { type: 'FG2_MADE', playerId: homePlayer.id, teamId: homeTeam.id, clientTimestamp: new Date().toISOString() },
    })
    await app.inject({
      method: 'POST',
      url: `/games/${game.id}/events`,
      headers: asAuth(testUserId),
      payload: { type: 'ASSIST', playerId: homePlayer.id, teamId: homeTeam.id, clientTimestamp: new Date().toISOString() },
    })

    const res = await app.inject({
      method: 'POST',
      url: `/games/${game.id}/finalize`,
      headers: asAuth(testUserId),
    })
    expect(res.statusCode).toBe(200)
    await validateResponse('finalizeGame', 200, res.json())
    expect(res.json().data.status).toBe('FINAL')

    const statLine = await db.gameStatLine.findUnique({ where: { gameId_playerId: { gameId: game.id, playerId: homePlayer.id } } })
    expect(statLine?.points).toBe(2)
    expect(statLine?.assists).toBe(1)

    const seasonStat = await db.playerSeasonStat.findUnique({ where: { playerId_seasonId: { playerId: homePlayer.id, seasonId: season.id } } })
    expect(seasonStat?.gamesPlayed).toBe(1)
    expect(seasonStat?.points).toBe(2)

    const updatedGame = await db.game.findUnique({ where: { id: game.id }, include: { gameTeams: true } })
    const homeGameTeam = updatedGame?.gameTeams.find((gt) => gt.teamId === homeTeam.id)
    expect(homeGameTeam?.finalScore).toBe(2)
  })
})
