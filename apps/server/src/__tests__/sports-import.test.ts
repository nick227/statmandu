import { describe, expect, it } from 'vitest'
import { db } from '@statman/db'
import { SportsImportService } from '../services/SportsImportService'

const provider = 'API_SPORTS_BASKETBALL' as const
const leagueId = '12'
const season = '2025-2026'

describe('sports import POC', () => {
  it('targets recent, team-filtered, and explicitly selected completed games', async () => {
    const service = new SportsImportService()
    const records = Array.from({ length: 25 }, (_, index) => ({
      kind: 'game' as const,
      externalId: String(1000 + index),
      leagueExternalId: leagueId,
      seasonExternalId: `${leagueId}:${season}`,
      scheduledAt: new Date(Date.UTC(2024, 0, index + 1)).toISOString(),
      status: 'FINAL' as const,
      homeTeamExternalId: index % 2 ? '101' : '102',
      awayTeamExternalId: index % 2 ? '102' : '103',
    }))
    const capabilities = { teamStats: true, playerBoxScores: true, seasonTotals: false }

    const recent = await (service as any).detailPlan(records, capabilities)
    expect(recent.missingGameIds).toHaveLength(20)
    expect(recent.estimatedRequestCost).toBe(40)

    const team = await (service as any).detailPlan(records, capabilities, { teamId: '103', recentCompletedGames: 5 })
    expect(team.missingGameIds).toHaveLength(5)
    expect(team.estimatedRequestCost).toBe(10)

    const explicit = await (service as any).detailPlan(records, capabilities, { gameIds: ['1001', '1009'] })
    expect(explicit.missingGameIds).toEqual(['1001', '1009'])
    expect(explicit.estimatedRequestCost).toBe(4)
  })

  it('previews, imports, and reruns a cached league without duplicates', async () => {
    const user = await db.user.create({
      data: { email: 'import-admin@test.local', passwordHash: 'x', role: 'ADMIN' },
    })
    const fixtureRun = await db.importRun.create({
      data: {
        provider, requestedById: user.id, leagueExternalId: leagueId,
        seasonExternalId: season, scopes: ['teams', 'games', 'standings', 'stats'], status: 'READY',
      },
    })
    const expiresAt = new Date(Date.now() + 60_000)
    const snapshots = [
      {
        endpoint: '/leagues', requestKey: '/leagues?id=12', parameters: { id: leagueId },
        payload: { response: [{ id: 12, name: 'POC League', country: { name: 'US' } }] },
      },
      {
        endpoint: '/teams', requestKey: '/teams?league=12&season=2025-2026', parameters: { league: leagueId, season },
        payload: { response: [
          { id: 101, name: 'North Stars', country: { name: 'US' }, logo: 'https://example.test/north.png' },
          { id: 102, name: 'South Stars', country: { name: 'US' }, logo: 'https://example.test/south.png' },
        ] },
      },
      {
        endpoint: '/games', requestKey: '/games?league=12&season=2025-2026', parameters: { league: leagueId, season },
        payload: { response: [{
          id: 501, date: '2026-01-12T19:00:00Z', status: { short: 'FT' }, venue: 'POC Arena',
          teams: { home: { id: 101 }, away: { id: 102 } },
          scores: { home: { total: 81 }, away: { total: 76 } },
        }] },
      },
      {
        endpoint: '/standings', requestKey: '/standings?league=12&season=2025-2026', parameters: { league: leagueId, season },
        payload: { response: [
          { position: 1, team: { id: 101 }, games: { played: 1, win: { total: 1 }, lose: { total: 0 } }, points: { for: 81, against: 76 } },
          { position: 2, team: { id: 102 }, games: { played: 1, win: { total: 0 }, lose: { total: 1 } }, points: { for: 76, against: 81 } },
          { position: 1, group: { name: 'Conference' }, team: { id: 101 }, games: { played: 1, win: { total: 1 }, lose: { total: 0 } }, points: { for: 81, against: 76 } },
        ] },
      },
      {
        endpoint: '/games/statistics/teams', requestKey: '/games/statistics/teams?id=501', parameters: { id: '501' },
        payload: { response: [
          { game: { id: 501 }, team: { id: 101 }, field_goals: { total: 30, attempts: 60 }, rebounds: { total: 40 }, assists: 20 },
          { game: { id: 501 }, team: { id: 102 }, field_goals: { total: 28, attempts: 62 }, rebounds: { total: 36 }, assists: 17 },
        ] },
      },
      {
        endpoint: '/games/statistics/players', requestKey: '/games/statistics/players?id=501', parameters: { id: '501' },
        payload: { response: [
          { game: { id: 501 }, player: { id: 901 }, team: { id: 101 }, points: 25, assists: 7, rebounds: 8 },
          { game: { id: 501 }, player: { id: 902 }, team: { id: 102 }, points: 21, assists: 5, rebounds: 6 },
        ] },
      },
    ]
    await db.importRawSnapshot.createMany({
      data: snapshots.map((snapshot) => ({
        importRunId: fixtureRun.id, provider, ...snapshot, payloadHash: snapshot.requestKey,
        expiresAt,
      })),
    })

    const service = new SportsImportService()
    const input = { leagueId, season, scopes: ['teams', 'games', 'standings', 'stats'] as const }
    const firstPreview = await service.preview(user.id, { ...input, scopes: [...input.scopes] })
    expect(firstPreview.status).toBe('READY')
    expect(firstPreview.conflictCount).toBe(0)
    expect(firstPreview.records).toHaveLength(8)
    expect(firstPreview.estimatedRequestCost).toBe(2)
    await service.execute(firstPreview.id)

    expect(await db.team.count()).toBe(2)
    expect(await db.game.count()).toBe(1)
    expect(await db.teamSeasonStat.count()).toBe(2)
    expect(await db.importedStatLine.count()).toBe(5)

    const secondPreview = await service.preview(user.id, { ...input, scopes: [...input.scopes] })
    await service.execute(secondPreview.id)

    expect(await db.team.count()).toBe(2)
    expect(await db.game.count()).toBe(1)
    expect(await db.teamSeasonStat.count()).toBe(2)
    expect(await db.importedStatLine.count()).toBe(5)
    expect(await db.importRequestLog.count({ where: { cacheHit: true } })).toBe(10)
  })
})
