import { createHash } from 'crypto'
import { db } from '@statman/db'
import type {
  NormalizedGame,
  NormalizedImportRecord,
  NormalizedStanding,
  NormalizedTeam,
  ProviderImportRequest,
  ProviderCapabilities,
  SportsImportProvider,
} from './types'

const PROVIDER = 'API_SPORTS_BASKETBALL' as const
const BASE_URL = 'https://v1.basketball.api-sports.io'
const DAILY_LIMIT = Number(process.env.API_SPORTS_DAILY_LIMIT ?? 100)
const MINUTE_LIMIT = Number(process.env.API_SPORTS_MINUTE_LIMIT ?? 10)
const TTL = {
  league: 7 * 24 * 60 * 60 * 1000,
  teams: 24 * 60 * 60 * 1000,
  activeSchedule: 2 * 60 * 1000,
  historicalSchedule: 24 * 60 * 60 * 1000,
  standings: 15 * 60 * 1000,
  finalizedStats: 10 * 365 * 24 * 60 * 60 * 1000,
}

function requestKey(endpoint: string, parameters: Record<string, string>) {
  return `${endpoint}?${new URLSearchParams(Object.entries(parameters).sort()).toString()}`
}

function asNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined
  const result = Number(value)
  return Number.isFinite(result) ? result : undefined
}

function apiResponse(payload: any): any[] {
  return Array.isArray(payload?.response) ? payload.response : []
}

export class ApiBasketballProvider implements SportsImportProvider {
  readonly id = PROVIDER
  readonly capabilities: ProviderCapabilities = { teamStats: true, playerBoxScores: true, seasonTotals: false }
  readonly plan = (process.env.API_SPORTS_PLAN ?? 'free').toLowerCase()
  readonly supportsBatchIds = this.plan !== 'free'
  readonly detailBatchSize = this.supportsBatchIds
    ? Math.min(20, Math.max(1, Number(process.env.API_SPORTS_DETAIL_BATCH_SIZE ?? 20)))
    : 1

  private cacheTtl(endpoint: string, payload: any) {
    if (endpoint === '/leagues') return TTL.league
    if (endpoint === '/teams') return TTL.teams
    if (endpoint === '/standings') return TTL.standings
    if (endpoint.includes('/statistics/')) return TTL.finalizedStats
    if (endpoint === '/games') {
      const hasActive = apiResponse(payload).some((game) => {
        const status = String(game.status?.short ?? game.status ?? '').toUpperCase()
        const terminal = ['FT', 'AOT', 'FINAL', 'CANC', 'PST', 'ABD', 'AWD'].some((value) => status.includes(value))
        const scheduledAt = new Date(game.date).getTime()
        const temporallyCurrent = !Number.isFinite(scheduledAt) || scheduledAt >= Date.now() - 6 * 60 * 60 * 1000
        return !terminal && (status.includes('LIVE') || temporallyCurrent)
      })
      return hasActive ? TTL.activeSchedule : TTL.historicalSchedule
    }
    return TTL.activeSchedule
  }

  async quota() {
    const start = new Date()
    start.setUTCHours(0, 0, 0, 0)
    const minuteStart = new Date(Date.now() - 60_000)
    const [usedToday, usedThisMinute, oldestMinuteRequest] = await Promise.all([
      db.importRequestLog.count({ where: { provider: PROVIDER, cacheHit: false, requestedAt: { gte: start } } }),
      db.importRequestLog.count({ where: { provider: PROVIDER, cacheHit: false, requestedAt: { gte: minuteStart } } }),
      db.importRequestLog.findFirst({ where: { provider: PROVIDER, cacheHit: false, requestedAt: { gte: minuteStart } }, orderBy: { requestedAt: 'asc' }, select: { requestedAt: true } }),
    ])
    return {
      usedToday, limit: DAILY_LIMIT, remaining: Math.max(0, DAILY_LIMIT - usedToday),
      usedThisMinute, minuteLimit: MINUTE_LIMIT, minuteRemaining: Math.max(0, MINUTE_LIMIT - usedThisMinute),
      minuteResetsAt: new Date((oldestMinuteRequest?.requestedAt.getTime() ?? Date.now()) + 60_000).toISOString(),
    }
  }

  private async get(runId: string, endpoint: string, parameters: Record<string, string>) {
    const key = requestKey(endpoint, parameters)
    const cached = await db.importRawSnapshot.findFirst({
      where: { provider: PROVIDER, requestKey: key, expiresAt: { gt: new Date() } },
      orderBy: { fetchedAt: 'desc' },
    })

    if (cached) {
      await Promise.all([
        db.importRawSnapshot.upsert({
          where: { importRunId_requestKey: { importRunId: runId, requestKey: key } },
          update: { payload: cached.payload as any, payloadHash: cached.payloadHash, expiresAt: cached.expiresAt },
          create: {
            importRunId: runId, provider: PROVIDER, requestKey: key, endpoint,
            parameters, payload: cached.payload as any, payloadHash: cached.payloadHash,
            fetchedAt: cached.fetchedAt, expiresAt: cached.expiresAt,
          },
        }),
        db.importRequestLog.create({
          data: { provider: PROVIDER, requestKey: key, endpoint, responseStatus: 200, cacheHit: true, durationMs: 0 },
        }),
      ])
      return cached.payload as any
    }

    const quota = await this.quota()
    if (quota.remaining <= 0) throw { statusCode: 429, message: 'API-Sports daily request quota exhausted' }
    if (quota.minuteRemaining <= 0) throw { statusCode: 429, message: `API-Sports minute request quota exhausted; resume after ${quota.minuteResetsAt}` }
    const apiKey = process.env.API_SPORTS_KEY
    if (!apiKey) throw { statusCode: 503, message: 'API_SPORTS_KEY is not configured' }

    const started = Date.now()
    const url = `${BASE_URL}${endpoint}?${new URLSearchParams(parameters)}`
    const response = await fetch(url, {
      headers: { 'x-apisports-key': apiKey, Accept: 'application/json' },
      signal: AbortSignal.timeout(15_000),
    })
    const payload = await response.json() as any
    const remainingHeader = response.headers.get('x-ratelimit-requests-remaining')
    await db.importRequestLog.create({
      data: {
        provider: PROVIDER, requestKey: key, endpoint, responseStatus: response.status,
        durationMs: Date.now() - started, quotaLimit: DAILY_LIMIT,
        quotaRemaining: remainingHeader ? Number(remainingHeader) : quota.remaining - 1,
      },
    })
    if (!response.ok || payload?.errors && Object.keys(payload.errors).length) {
      throw { statusCode: response.status || 502, message: `API-Sports request failed: ${JSON.stringify(payload?.errors ?? payload)}` }
    }

    const serialized = JSON.stringify(payload)
    await db.importRawSnapshot.create({
      data: {
        importRunId: runId, provider: PROVIDER, requestKey: key, endpoint, parameters,
        payload, payloadHash: createHash('sha256').update(serialized).digest('hex'),
        expiresAt: new Date(Date.now() + this.cacheTtl(endpoint, payload)),
      },
    })
    return payload
  }

  async fetchAndNormalize(runId: string, request: ProviderImportRequest): Promise<NormalizedImportRecord[]> {
    const base = { league: request.leagueId, season: request.season }
    const seasonExternalId = `${request.leagueId}:${request.season}`
    const calls: Array<Promise<any>> = [this.get(runId, '/leagues', { id: request.leagueId })]
    const names: string[] = ['league']
    if (request.scopes.includes('teams')) { calls.push(this.get(runId, '/teams', base)); names.push('teams') }
    if (request.scopes.includes('games') || request.scopes.includes('stats')) { calls.push(this.get(runId, '/games', base)); names.push('games') }
    if (request.scopes.includes('standings')) { calls.push(this.get(runId, '/standings', base)); names.push('standings') }
    const payloads = await Promise.all(calls)
    const byName = Object.fromEntries(names.map((name, index) => [name, payloads[index]]))

    const leagueSource = apiResponse(byName.league)[0]
    const league = leagueSource?.league ?? leagueSource
    const selectedSeason = (leagueSource?.seasons ?? league?.seasons ?? []).find((item: any) => item.season === request.season)
    const coverage = selectedSeason?.coverage ?? leagueSource?.coverage ?? league?.coverage
    const coverageFlag = (values: unknown[], fallback: boolean) => {
      const explicit = values.find((value) => typeof value === 'boolean')
      return typeof explicit === 'boolean' ? explicit : fallback
    }
    const leagueCapabilities = coverage ? {
      teamStats: coverageFlag([coverage.games?.statistics?.teams, coverage.statistics?.teams, coverage.team_statistics, coverage.teams_statistics], this.capabilities.teamStats),
      playerBoxScores: coverageFlag([coverage.games?.statistics?.players, coverage.statistics?.players, coverage.player_statistics, coverage.players_statistics], this.capabilities.playerBoxScores),
      seasonTotals: false,
    } : this.capabilities
    const records: NormalizedImportRecord[] = [{
      kind: 'league', externalId: request.leagueId,
      name: league?.name ?? `Basketball league ${request.leagueId}`,
      sportSlug: 'basketball', country: league?.country?.name ?? league?.country,
      capabilities: leagueCapabilities,
    }, {
      kind: 'season', externalId: seasonExternalId, leagueExternalId: request.leagueId, name: request.season,
      startDate: selectedSeason?.start, endDate: selectedSeason?.end,
    }]

    for (const row of apiResponse(byName.teams)) {
      const team = row.team ?? row
      const normalized: NormalizedTeam = {
        kind: 'team', externalId: String(team.id), leagueExternalId: request.leagueId,
        name: team.name, country: team.country?.name ?? team.country, logoUrl: team.logo,
      }
      records.push(normalized)
    }

    for (const row of apiResponse(byName.games)) {
      const statusText = String(row.status?.short ?? row.status ?? '').toUpperCase()
      const normalized: NormalizedGame = {
        kind: 'game', externalId: String(row.id), leagueExternalId: request.leagueId,
        seasonExternalId, scheduledAt: row.date,
        status: statusText.includes('FT') || statusText.includes('FINAL') ? 'FINAL' : statusText.includes('LIVE') ? 'LIVE' : 'SCHEDULED',
        venue: row.venue, homeTeamExternalId: String(row.teams?.home?.id),
        awayTeamExternalId: String(row.teams?.away?.id),
        homeScore: asNumber(row.scores?.home?.total), awayScore: asNumber(row.scores?.away?.total),
      }
      records.push(normalized)
      if (request.scopes.includes('stats') && normalized.status === 'FINAL') {
        records.push({
          kind: 'statLine', externalId: `game:${row.id}`, sportSlug: 'basketball',
          leagueExternalId: request.leagueId, seasonExternalId,
          gameExternalId: String(row.id), stats: {
            homeScore: normalized.homeScore ?? 0, awayScore: normalized.awayScore ?? 0,
          },
        })
      }
    }

    const standings = new Map<string, NormalizedStanding>()
    for (const group of apiResponse(byName.standings)) {
      for (const row of Array.isArray(group) ? group : [group]) {
        const team = row.team ?? {}
        const normalized: NormalizedStanding = {
          kind: 'standing', externalId: `${seasonExternalId}:${team.id}`,
          leagueExternalId: request.leagueId, seasonExternalId,
          teamExternalId: String(team.id), rank: asNumber(row.position ?? row.rank),
          wins: asNumber(row.games?.win?.total ?? row.won) ?? 0,
          losses: asNumber(row.games?.lose?.total ?? row.lost) ?? 0,
          pointsFor: asNumber(row.points?.for), pointsAgainst: asNumber(row.points?.against),
          stats: { played: asNumber(row.games?.played ?? row.played) ?? 0, form: row.form ?? null, group: row.group?.name ?? row.group ?? null },
        }
        // Some competitions return conference/division and overall views for
        // the same team. Statman's season standing is one row per team, so
        // retain one normalized record while preserving its provider group.
        if (!standings.has(normalized.externalId)) standings.set(normalized.externalId, normalized)
      }
    }
    records.push(...standings.values())
    return records
  }

  async fetchDetailedStats(runId: string, gameIds: string[], capabilities: ProviderCapabilities) {
    if (gameIds.length > this.detailBatchSize) throw new Error(`Detailed-stat batches are limited to ${this.detailBatchSize} games for this configuration`)
    const parameters: Record<string, string> = gameIds.length === 1 ? { id: gameIds[0]! } : { ids: gameIds.join('-') }
    const calls: Array<Promise<any>> = []
    const kinds: Array<'team' | 'player'> = []
    if (capabilities.teamStats) { calls.push(this.get(runId, '/games/statistics/teams', parameters)); kinds.push('team') }
    if (capabilities.playerBoxScores) { calls.push(this.get(runId, '/games/statistics/players', parameters)); kinds.push('player') }
    const payloads = await Promise.all(calls)
    const records: any[] = []
    for (let index = 0; index < payloads.length; index++) {
      const kind = kinds[index]!
      for (const row of apiResponse(payloads[index])) {
        const gameId = String(row.game?.id ?? row.game)
        const subject = kind === 'team' ? row.team : row.player
        const subjectId = String(subject?.id ?? subject)
        const { game: _game, team: _team, player: _player, ...stats } = row
        records.push({
          kind: 'statLine', externalId: `${kind}-detail:${gameId}:${subjectId}`,
          sportSlug: 'basketball', leagueExternalId: '', seasonExternalId: '',
          gameExternalId: gameId,
          ...(kind === 'team' ? { teamExternalId: subjectId } : { playerExternalId: subjectId }),
          stats: { ...stats, statKind: kind === 'team' ? 'TEAM_GAME_DETAIL' : 'PLAYER_BOX_SCORE' },
        })
      }
    }
    return records
  }
}
