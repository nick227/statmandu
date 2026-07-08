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

async function joinAsContributor(gameId: string, userId: string) {
  return app.inject({
    method: 'POST',
    url: `/games/${gameId}/reporters`,
    headers: asAuth(userId),
    payload: { role: 'CONTRIBUTOR' },
  })
}

async function inviteReporter(gameId: string, managerUserId: string, invitedUserId: string, role = 'CONTRIBUTOR', teamId?: string) {
  return app.inject({
    method: 'POST',
    url: `/games/${gameId}/reporters/invite`,
    headers: asAuth(managerUserId),
    payload: { userId: invitedUserId, role, ...(teamId ? { teamId } : {}) },
  })
}

async function startGame(gameId: string, userId = testUserId) {
  return app.inject({
    method: 'POST',
    url: `/games/${gameId}/start-live`,
    headers: asAuth(userId),
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

  it('rejects self-assigning privileged roles after the first reporter joins', async () => {
    const { game } = await seedGameFixture()
    await joinAsOfficialScorer(game.id, testUserId)

    const res = await joinAsOfficialScorer(game.id, testOtherUserId)
    expect(res.statusCode).toBe(403)
  })

  it('rejects changing an existing reporter role through join', async () => {
    const { game } = await seedGameFixture()
    await joinAsOfficialScorer(game.id, testUserId)

    const res = await app.inject({
      method: 'POST',
      url: `/games/${game.id}/reporters`,
      headers: asAuth(testUserId),
      payload: { role: 'CONTRIBUTOR' },
    })
    expect(res.statusCode).toBe(409)
  })
})

describe('manageGameReporters', () => {
  it('lets a game manager invite, update, and remove a reporter', async () => {
    const { game, homeTeam } = await seedGameFixture()
    await joinAsOfficialScorer(game.id, testUserId)

    const invited = await inviteReporter(game.id, testUserId, testOtherUserId)
    expect(invited.statusCode).toBe(201)
    await validateResponse('inviteGameReporter', 201, invited.json())
    expect(invited.json().data.role).toBe('CONTRIBUTOR')

    const updated = await app.inject({
      method: 'PATCH',
      url: `/games/${game.id}/reporters/${invited.json().data.id}`,
      headers: asAuth(testUserId),
      payload: { role: 'TEAM_SCORER', teamId: homeTeam.id },
    })
    expect(updated.statusCode).toBe(200)
    await validateResponse('updateGameReporter', 200, updated.json())
    expect(updated.json().data.role).toBe('TEAM_SCORER')
    expect(updated.json().data.teamId).toBe(homeTeam.id)

    const removed = await app.inject({
      method: 'DELETE',
      url: `/games/${game.id}/reporters/${invited.json().data.id}`,
      headers: asAuth(testUserId),
    })
    expect(removed.statusCode).toBe(200)
    await validateResponse('removeGameReporter', 200, removed.json())
    expect(await db.gameReporter.findUnique({ where: { id: invited.json().data.id } })).toBeNull()
  })

  it('forbids non-managers from inviting reporters', async () => {
    const { game } = await seedGameFixture()
    await joinAsOfficialScorer(game.id, testUserId)
    await joinAsContributor(game.id, testOtherUserId)

    const res = await inviteReporter(game.id, testOtherUserId, testOtherUserId)
    expect(res.statusCode).toBe(403)
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

  it('does not start an already live game again', async () => {
    const { game } = await seedGameFixture()
    await joinAsOfficialScorer(game.id, testUserId)
    await startGame(game.id)

    const res = await startGame(game.id)
    expect(res.statusCode).toBe(409)
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
    await startGame(game.id)

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
    await joinAsContributor(game.id, testOtherUserId)
    await startGame(game.id)

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

  it('rejects events before the game is live', async () => {
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
    expect(res.statusCode).toBe(409)
  })

  it('rejects events for a player who is not on the submitted team roster', async () => {
    const { game, homePlayer, awayTeam } = await seedGameFixture()
    await joinAsOfficialScorer(game.id, testUserId)
    await startGame(game.id)

    const res = await app.inject({
      method: 'POST',
      url: `/games/${game.id}/events`,
      headers: asAuth(testUserId),
      payload: {
        type: 'FG2_MADE',
        playerId: homePlayer.id,
        teamId: awayTeam.id,
        clientTimestamp: new Date().toISOString(),
      },
    })
    expect(res.statusCode).toBe(400)
  })

  it('rejects event types that do not belong to the game sport definition', async () => {
    const { game, homePlayer, homeTeam } = await seedGameFixture()
    await joinAsOfficialScorer(game.id, testUserId)
    await startGame(game.id)

    const res = await app.inject({
      method: 'POST',
      url: `/games/${game.id}/events`,
      headers: asAuth(testUserId),
      payload: {
        type: 'SOCCER_GOAL',
        playerId: homePlayer.id,
        teamId: homeTeam.id,
        clientTimestamp: new Date().toISOString(),
      },
    })
    expect(res.statusCode).toBe(400)
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
    await startGame(game.id)

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
    await joinAsContributor(game.id, testOtherUserId)
    await startGame(game.id)

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

describe('listGameEvents', () => {
  it('is public and works without joining as a reporter', async () => {
    const { game } = await seedGameFixture()
    const res = await app.inject({ method: 'GET', url: `/games/${game.id}/events` })
    expect(res.statusCode).toBe(200)
    await validateResponse('listGameEvents', 200, res.json())
    expect(res.json().data).toEqual([])
  })

  it('returns accepted events ascending by time and excludes an undone one', async () => {
    const { game, homePlayer, homeTeam } = await seedGameFixture()
    await joinAsOfficialScorer(game.id, testUserId)
    await startGame(game.id)

    const kept = await app.inject({
      method: 'POST',
      url: `/games/${game.id}/events`,
      headers: asAuth(testUserId),
      payload: { type: 'FG2_MADE', playerId: homePlayer.id, teamId: homeTeam.id, clientTimestamp: new Date(Date.now() - 1000).toISOString() },
    })
    const undone = await app.inject({
      method: 'POST',
      url: `/games/${game.id}/events`,
      headers: asAuth(testUserId),
      payload: { type: 'TURNOVER', playerId: homePlayer.id, teamId: homeTeam.id, clientTimestamp: new Date().toISOString() },
    })
    await app.inject({
      method: 'DELETE',
      url: `/games/${game.id}/events/${undone.json().data.id}`,
      headers: asAuth(testUserId),
    })

    const res = await app.inject({ method: 'GET', url: `/games/${game.id}/events` })
    expect(res.statusCode).toBe(200)
    const ids = res.json().data.map((e: any) => e.id)
    expect(ids).toEqual([kept.json().data.id])
  })
})

describe('getGameSnapshot', () => {
  it('GET /games/{gameId}/snapshot reflects accepted event points', async () => {
    const { game, homePlayer, homeTeam } = await seedGameFixture()
    await joinAsOfficialScorer(game.id, testUserId)
    await startGame(game.id)

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

describe('createGameReaction', () => {
  it('records an ephemeral spectator reaction and includes it in the snapshot', async () => {
    const { game } = await seedGameFixture()

    const created = await app.inject({
      method: 'POST',
      url: `/games/${game.id}/reactions`,
      payload: { deviceId: 'device-1', type: 'FIRE' },
    })

    expect(created.statusCode).toBe(201)
    await validateResponse('createGameReaction', 201, created.json())

    const snapshot = await app.inject({ method: 'GET', url: `/games/${game.id}/snapshot` })
    expect(snapshot.statusCode).toBe(200)
    expect(snapshot.json().data.recentReactions[0]).toMatchObject({
      deviceId: 'device-1',
      type: 'FIRE',
    })
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
    await startGame(game.id)

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
    expect(statLine?.stats).toMatchObject({ points: 2, assists: 1 })

    const seasonStat = await db.playerSeasonStat.findUnique({ where: { playerId_seasonId: { playerId: homePlayer.id, seasonId: season.id } } })
    expect(seasonStat?.gamesPlayed).toBe(1)
    expect(seasonStat?.points).toBe(2)

    const updatedGame = await db.game.findUnique({ where: { id: game.id }, include: { gameTeams: true } })
    const homeGameTeam = updatedGame?.gameTeams.find((gt) => gt.teamId === homeTeam.id)
    expect(homeGameTeam?.finalScore).toBe(2)
  })

  it('does not double-count season stats when finalized twice', async () => {
    const { game, homePlayer, homeTeam, season } = await seedGameFixture()
    await joinAsOfficialScorer(game.id, testUserId)
    await startGame(game.id)

    await app.inject({
      method: 'POST',
      url: `/games/${game.id}/events`,
      headers: asAuth(testUserId),
      payload: { type: 'FG3_MADE', playerId: homePlayer.id, teamId: homeTeam.id, clientTimestamp: new Date().toISOString() },
    })

    const first = await app.inject({
      method: 'POST',
      url: `/games/${game.id}/finalize`,
      headers: asAuth(testUserId),
    })
    const second = await app.inject({
      method: 'POST',
      url: `/games/${game.id}/finalize`,
      headers: asAuth(testUserId),
    })

    expect(first.statusCode).toBe(200)
    expect(second.statusCode).toBe(200)
    const seasonStat = await db.playerSeasonStat.findUnique({ where: { playerId_seasonId: { playerId: homePlayer.id, seasonId: season.id } } })
    expect(seasonStat?.gamesPlayed).toBe(1)
    expect(seasonStat?.points).toBe(3)
  })
})

describe('gameConflicts', () => {
  async function seedConflict() {
    const fixture = await seedGameFixture()
    await joinAsOfficialScorer(fixture.game.id, testUserId)
    await inviteReporter(fixture.game.id, testUserId, testOtherUserId)
    await startGame(fixture.game.id)

    const clientTimestamp = new Date().toISOString()
    const first = await app.inject({
      method: 'POST',
      url: `/games/${fixture.game.id}/events`,
      headers: asAuth(testUserId),
      payload: { type: 'FG2_MADE', playerId: fixture.homePlayer.id, teamId: fixture.homeTeam.id, clientTimestamp },
    })
    const second = await app.inject({
      method: 'POST',
      url: `/games/${fixture.game.id}/events`,
      headers: asAuth(testOtherUserId),
      payload: { type: 'FG3_MADE', playerId: fixture.homePlayer.id, teamId: fixture.homeTeam.id, clientTimestamp },
    })

    const conflictId = second.json().data.consensusGroupId
    return { ...fixture, firstEventId: first.json().data.id, secondEventId: second.json().data.id, conflictId }
  }

  it('queues conflicting reporter events for manager review', async () => {
    const { game, conflictId } = await seedConflict()

    const res = await app.inject({
      method: 'GET',
      url: `/games/${game.id}/conflicts`,
      headers: asAuth(testUserId),
    })
    expect(res.statusCode).toBe(200)
    await validateResponse('listGameConflicts', 200, res.json())
    expect(res.json().data).toHaveLength(1)
    expect(res.json().data[0].id).toBe(conflictId)
    expect(res.json().data[0].events).toHaveLength(2)
  })

  it('forbids contributors from listing conflicts', async () => {
    const { game } = await seedConflict()

    const res = await app.inject({
      method: 'GET',
      url: `/games/${game.id}/conflicts`,
      headers: asAuth(testOtherUserId),
    })
    expect(res.statusCode).toBe(403)
  })

  it('resolves a conflict by accepting the selected event and rejecting the other events', async () => {
    const { game, conflictId, firstEventId, secondEventId } = await seedConflict()

    const res = await app.inject({
      method: 'POST',
      url: `/games/${game.id}/conflicts/${conflictId}/resolve`,
      headers: asAuth(testUserId),
      payload: { resolvedEventId: secondEventId },
    })
    expect(res.statusCode).toBe(200)
    await validateResponse('resolveGameConflict', 200, res.json())
    expect(res.json().data.status).toBe('RESOLVED')
    expect(res.json().data.resolvedEventId).toBe(secondEventId)

    const first = await db.gameEvent.findUnique({ where: { id: firstEventId } })
    const second = await db.gameEvent.findUnique({ where: { id: secondEventId } })
    expect(first?.status).toBe('REJECTED')
    expect(second?.status).toBe('ACCEPTED')
  })

  it('marks unresolved conflicts disputed and finalizes with a stat-line footnote', async () => {
    const { game, conflictId, homePlayer } = await seedConflict()

    const disputed = await app.inject({
      method: 'POST',
      url: `/games/${game.id}/conflicts/${conflictId}/mark-disputed`,
      headers: asAuth(testUserId),
    })
    expect(disputed.statusCode).toBe(200)
    await validateResponse('markGameConflictDisputed', 200, disputed.json())

    const finalized = await app.inject({
      method: 'POST',
      url: `/games/${game.id}/finalize`,
      headers: asAuth(testUserId),
    })
    expect(finalized.statusCode).toBe(200)
    expect(finalized.json().data.status).toBe('DISPUTED')

    const statLine = await db.gameStatLine.findUnique({ where: { gameId_playerId: { gameId: game.id, playerId: homePlayer.id } } })
    expect(statLine?.sourceStatus).toBe('IN_DISPUTE')
    expect(statLine?.disputeNote).toContain('reporter logs')

    const disputes = await db.dispute.findMany({ where: { targetType: 'GAME_EVENT' } })
    expect(disputes).toHaveLength(1)
  })
})
