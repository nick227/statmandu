import { db } from '@statman/db'
import { ApiBasketballProvider } from '../import/ApiBasketballProvider'
import type { DetailImportFilters, ImportScope, NormalizedImportRecord } from '../import/types'

const provider = new ApiBasketballProvider()
const ENTITY_TYPE = {
  league: 'LEAGUE', season: 'SEASON', team: 'TEAM', game: 'GAME',
  standing: 'STANDING', statLine: 'STAT_LINE',
} as const

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function normalizedName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function editDistance(left: string, right: string) {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index)
  for (let i = 1; i <= left.length; i++) {
    let previous = row[0]!
    row[0] = i
    for (let j = 1; j <= right.length; j++) {
      const old = row[j]!
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, previous + (left[i - 1] === right[j - 1] ? 0 : 1))
      previous = old
    }
  }
  return row[right.length]!
}

function similarity(left: string, right: string) {
  const a = normalizedName(left)
  const b = normalizedName(right)
  return 1 - editDistance(a, b) / Math.max(a.length, b.length, 1)
}

export class SportsImportService {
  providers() {
    return provider.quota().then((quota) => [{
      id: provider.id, name: 'API-Sports · Basketball', sportSlug: 'basketball',
      scopes: ['teams', 'games', 'standings', 'stats'], capabilities: provider.capabilities,
      plan: provider.plan, supportsBatchIds: provider.supportsBatchIds, detailBatchSize: provider.detailBatchSize, quota,
    }])
  }

  async preview(userId: string, input: { leagueId: string; season: string; scopes: ImportScope[]; detailFilters?: DetailImportFilters }) {
    if (!input.leagueId || !input.season) throw { statusCode: 400, message: 'leagueId and season are required' }
    const scopes = [...new Set(input.scopes ?? [])]
    const detailFilters = this.normalizeDetailFilters(input.detailFilters)
    if (!scopes.length) throw { statusCode: 400, message: 'At least one import scope is required' }
    const run = await db.importRun.create({
      data: {
        provider: provider.id, requestedById: userId, leagueExternalId: input.leagueId,
        seasonExternalId: input.season, scopes, options: { detailFilters },
        detailRequestCap: Number(process.env.API_SPORTS_DETAIL_REQUESTS_PER_RUN ?? 10),
      },
    })
    try {
      const normalized = await provider.fetchAndNormalize(run.id, { ...input, scopes })
      const capabilities = (normalized.find((record) => record.kind === 'league') as any)?.capabilities ?? provider.capabilities
      const detailPlan = scopes.includes('stats')
        ? await this.detailPlan(normalized, capabilities, detailFilters)
        : { estimatedRequestCost: 0, missingGameIds: [] }
      const planned = await this.plan(normalized)
      await db.$transaction([
        ...planned.map(({ record, action, localId, differences }) => db.importRecord.create({
          data: {
            importRunId: run.id, entityType: ENTITY_TYPE[record.kind], externalId: record.externalId,
            externalName: 'name' in record ? record.name : undefined, action, localId,
            normalized: record as any, differences: differences as any,
          },
        })),
        db.importRun.update({
          where: { id: run.id },
          data: {
            status: 'READY', requestedCount: planned.length,
            capabilities, estimatedRequestCost: detailPlan.estimatedRequestCost,
            createdCount: planned.filter((item) => item.action === 'CREATE').length,
            updatedCount: planned.filter((item) => item.action === 'UPDATE').length,
            unchangedCount: planned.filter((item) => item.action === 'UNCHANGED').length,
            conflictCount: planned.filter((item) => item.action === 'CONFLICT').length,
          },
        }),
      ])
      return this.getRun(run.id)
    } catch (error: any) {
      await db.importRun.update({ where: { id: run.id }, data: { status: 'FAILED', errorSummary: error?.message ?? 'Preview failed' } })
      throw error
    }
  }

  private normalizeDetailFilters(filters?: DetailImportFilters): DetailImportFilters {
    const result = {
      dateFrom: filters?.dateFrom?.trim() || undefined,
      dateTo: filters?.dateTo?.trim() || undefined,
      teamId: filters?.teamId?.trim() || undefined,
      gameIds: [...new Set((filters?.gameIds ?? []).map((id) => id.trim()).filter(Boolean))],
      recentCompletedGames: Math.min(100, Math.max(1, Number(filters?.recentCompletedGames ?? 20))),
    }
    for (const [label, value] of [['dateFrom', result.dateFrom], ['dateTo', result.dateTo]] as const) {
      if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw { statusCode: 400, message: `${label} must use YYYY-MM-DD` }
    }
    if (result.dateFrom && result.dateTo && result.dateFrom > result.dateTo) throw { statusCode: 400, message: 'dateFrom must be on or before dateTo' }
    return result
  }

  private async detailPlan(records: NormalizedImportRecord[], capabilities: { teamStats: boolean; playerBoxScores: boolean; seasonTotals: boolean }, filters?: DetailImportFilters) {
    const normalizedFilters = this.normalizeDetailFilters(filters)
    let completed = records.filter((record): record is any => record.kind === 'game' && record.status === 'FINAL')
    if (normalizedFilters.dateFrom) completed = completed.filter((game) => game.scheduledAt.slice(0, 10) >= normalizedFilters.dateFrom!)
    if (normalizedFilters.dateTo) completed = completed.filter((game) => game.scheduledAt.slice(0, 10) <= normalizedFilters.dateTo!)
    if (normalizedFilters.teamId) completed = completed.filter((game) => game.homeTeamExternalId === normalizedFilters.teamId || game.awayTeamExternalId === normalizedFilters.teamId)
    if (normalizedFilters.gameIds?.length) {
      const selected = new Set(normalizedFilters.gameIds)
      completed = completed.filter((game) => selected.has(game.externalId))
    } else {
      completed = completed.sort((left, right) => right.scheduledAt.localeCompare(left.scheduledAt)).slice(0, normalizedFilters.recentCompletedGames)
    }
    const existing = await db.importedStatLine.findMany({
      where: { provider: provider.id, gameId: { not: null }, statKind: { in: ['TEAM_GAME_DETAIL', 'PLAYER_BOX_SCORE', 'TEAM_GAME_DETAIL_AVAILABILITY', 'PLAYER_BOX_SCORE_AVAILABILITY'] } },
      select: { externalId: true },
    })
    const hasPrefix = (prefix: string) => existing.some((item) => item.externalId.startsWith(prefix))
    const missingTeam = capabilities.teamStats ? completed.filter((game) => !hasPrefix(`team-detail:${game.externalId}:`)).map((game) => game.externalId) : []
    const missingPlayer = capabilities.playerBoxScores ? completed.filter((game) => !hasPrefix(`player-detail:${game.externalId}:`)).map((game) => game.externalId) : []
    return {
      missingGameIds: [...new Set([...missingTeam, ...missingPlayer])],
      missingTeam, missingPlayer,
      estimatedRequestCost: Math.ceil(missingTeam.length / provider.detailBatchSize) + Math.ceil(missingPlayer.length / provider.detailBatchSize),
    }
  }

  private async plan(records: NormalizedImportRecord[]) {
    const mappings = await db.externalEntityMapping.findMany({ where: { provider: provider.id } })
    const mappingByKey = new Map(mappings.map((item) => [`${item.entityType}:${item.externalId}`, item]))
    const [leagues, seasons, teams] = await Promise.all([
      db.league.findMany(), db.season.findMany(), db.team.findMany(),
    ])
    const planned: Array<{ record: NormalizedImportRecord; action: 'CREATE' | 'UPDATE' | 'UNCHANGED' | 'CONFLICT'; localId?: string; differences?: any }> = []
    for (const record of records) {
      const type = ENTITY_TYPE[record.kind]
      const mapping = mappingByKey.get(`${type}:${record.externalId}`)
      if (mapping) {
        planned.push({ record, action: 'UPDATE', localId: mapping.localId })
        continue
      }
      if (record.kind === 'league') {
        const exact = leagues.find((item) => normalizedName(item.name) === normalizedName(record.name))
        planned.push({ record, action: exact ? 'UPDATE' : 'CREATE', localId: exact?.id })
      } else if (record.kind === 'season') {
        const exact = seasons.find((item) => item.name === record.name)
        planned.push({ record, action: exact ? 'UPDATE' : 'CREATE', localId: exact?.id })
      } else if (record.kind === 'team') {
        const exact = teams.find((item) => normalizedName(item.name) === normalizedName(record.name))
        if (exact) planned.push({ record, action: 'UPDATE', localId: exact.id })
        else {
          const fuzzy = teams.map((item) => ({ item, score: similarity(item.name, record.name) })).sort((a, b) => b.score - a.score)[0]
          planned.push(fuzzy && fuzzy.score >= 0.78
            ? { record, action: 'CONFLICT', localId: fuzzy.item.id, differences: { suggestedName: fuzzy.item.name, confidence: fuzzy.score } }
            : { record, action: 'CREATE' })
        }
      } else planned.push({ record, action: 'CREATE' })
    }
    return planned
  }

  async resolveRecord(runId: string, recordId: string, input: { resolution: 'MATCH' | 'CREATE' | 'SKIP'; localId?: string }) {
    const record = await db.importRecord.findFirst({ where: { id: recordId, importRunId: runId } })
    if (!record) throw { statusCode: 404, message: 'Import record not found' }
    if (input.resolution === 'MATCH' && !input.localId) throw { statusCode: 400, message: 'localId is required for MATCH' }
    return db.importRecord.update({
      where: { id: record.id },
      data: {
        action: input.resolution === 'SKIP' ? 'SKIP' : input.resolution === 'CREATE' ? 'CREATE' : 'UPDATE',
        localId: input.resolution === 'MATCH' ? input.localId : null,
        resolution: input as any,
      },
    })
  }

  async execute(runId: string) {
    const run = await db.importRun.findUnique({ where: { id: runId }, include: { records: { orderBy: { createdAt: 'asc' } } } })
    if (!run) throw { statusCode: 404, message: 'Import run not found' }
    if (!['READY', 'PARTIAL', 'FAILED'].includes(run.status)) throw { statusCode: 409, message: 'This import run cannot be executed or resumed' }
    if (run.records.some((record) => record.action === 'CONFLICT')) throw { statusCode: 409, message: 'Resolve all conflicts before importing' }
    await db.importRun.update({ where: { id: runId }, data: { status: 'RUNNING', startedAt: new Date() } })
    try {
      const priority: Record<string, number> = { LEAGUE: 0, SEASON: 1, TEAM: 2, GAME: 3, STANDING: 4, STAT_LINE: 5 }
      for (const item of [...run.records].sort((left, right) => (priority[left.entityType] ?? 99) - (priority[right.entityType] ?? 99))) {
        if (item.action === 'SKIP' || item.action === 'UNCHANGED') continue
        const record = item.normalized as any
        const localId = await this.importRecord(record, item.localId ?? undefined)
        await db.importRecord.update({ where: { id: item.id }, data: { localId, action: item.localId ? 'UPDATE' : 'CREATE' } })
        if (localId && ['league', 'season', 'team', 'game'].includes(record.kind)) {
          await db.externalEntityMapping.upsert({
            where: { provider_entityType_externalId: { provider: provider.id, entityType: ENTITY_TYPE[record.kind as keyof typeof ENTITY_TYPE], externalId: record.externalId } },
            update: { localId, externalName: record.name },
            create: { provider: provider.id, entityType: ENTITY_TYPE[record.kind as keyof typeof ENTITY_TYPE], externalId: record.externalId, localId, externalName: record.name },
          })
        }
      }
      const hasMoreDetails = (run.scopes as string[]).includes('stats')
        ? await this.importDetailedStats(run.id, run.capabilities as any)
        : false
      await db.importRun.update({
        where: { id: runId },
        data: hasMoreDetails
          ? { status: 'PARTIAL', errorSummary: 'Detailed-stat request cap reached; resume this run to continue.' }
          : { status: 'COMPLETED', completedAt: new Date(), errorSummary: null },
      })
    } catch (error: any) {
      const current = await db.importRun.findUnique({ where: { id: runId }, select: { detailRequestsCompleted: true } })
      await db.importRun.update({ where: { id: runId }, data: { status: current?.detailRequestsCompleted ? 'PARTIAL' : 'FAILED', errorSummary: error?.message ?? 'Import failed' } })
      throw error
    }
    return this.getRun(runId)
  }

  private async importDetailedStats(runId: string, capabilities: { teamStats: boolean; playerBoxScores: boolean; seasonTotals: boolean } | null) {
    const run = await db.importRun.findUnique({ where: { id: runId }, include: { records: true } })
    if (!run) return
    const resolvedCapabilities = capabilities ?? provider.capabilities
    const normalized = run.records.map((record) => record.normalized as any) as NormalizedImportRecord[]
    const detailFilters = ((run.options as any)?.detailFilters ?? {}) as DetailImportFilters
    const plan = await this.detailPlan(normalized, resolvedCapabilities, detailFilters)
    const quota = await provider.quota()
    const cap = Math.min(run.detailRequestCap, quota.remaining, quota.minuteRemaining)
    let totalSpent = run.detailRequestsCompleted
    let attemptSpent = 0
    const queue: Array<{ kind: 'team' | 'player'; ids: string[] }> = []
    const teamBatches: string[][] = []
    const playerBatches: string[][] = []
    for (let index = 0; index < plan.missingTeam.length; index += provider.detailBatchSize) teamBatches.push(plan.missingTeam.slice(index, index + provider.detailBatchSize))
    for (let index = 0; index < plan.missingPlayer.length; index += provider.detailBatchSize) playerBatches.push(plan.missingPlayer.slice(index, index + provider.detailBatchSize))
    for (let index = 0; index < Math.max(teamBatches.length, playerBatches.length); index++) {
      if (teamBatches[index]) queue.push({ kind: 'team', ids: teamBatches[index]! })
      if (playerBatches[index]) queue.push({ kind: 'player', ids: playerBatches[index]! })
    }

    const completedGames = normalized.filter((record): record is any => record.kind === 'game' && record.status === 'FINAL')
    for (const capability of [
      { supported: resolvedCapabilities.teamStats, kind: 'team', statKind: 'TEAM_GAME_DETAIL' },
      { supported: resolvedCapabilities.playerBoxScores, kind: 'player', statKind: 'PLAYER_BOX_SCORE' },
    ] as const) {
      if (capability.supported) continue
      for (const game of completedGames) await this.recordDetailAvailability(game, capability.kind, capability.statKind, 'UNSUPPORTED')
    }

    for (const batch of queue) {
      if (attemptSpent >= cap) break
      const selected = { teamStats: batch.kind === 'team', playerBoxScores: batch.kind === 'player', seasonTotals: false }
      const details = await provider.fetchDetailedStats(runId, batch.ids, selected)
      attemptSpent += 1
      totalSpent += 1
      await db.importRun.update({ where: { id: runId }, data: { detailRequestsCompleted: totalSpent } })
      for (const detail of details) {
        const game = completedGames.find((item) => item.externalId === detail.gameExternalId)
        if (!game) continue
        detail.leagueExternalId = game.leagueExternalId
        detail.seasonExternalId = game.seasonExternalId
        await this.importRecord(detail)
      }
      for (const gameId of batch.ids) {
        if (details.some((detail) => detail.gameExternalId === gameId)) continue
        const game = completedGames.find((item) => item.externalId === gameId)
        if (game) await this.recordDetailAvailability(game, batch.kind, batch.kind === 'team' ? 'TEAM_GAME_DETAIL' : 'PLAYER_BOX_SCORE', 'NOT_AVAILABLE')
      }
    }
    return queue.length > attemptSpent
  }

  private async recordDetailAvailability(game: any, kind: 'team' | 'player', statKind: string, availability: 'UNSUPPORTED' | 'NOT_AVAILABLE') {
    const gameMapping = await this.mapped('GAME', game.externalId)
    await db.importedStatLine.upsert({
      where: { provider_externalId: { provider: provider.id, externalId: `${kind}-detail:${game.externalId}:availability` } },
      update: { availability, importedAt: new Date() },
      create: {
        provider: provider.id, externalId: `${kind}-detail:${game.externalId}:availability`, sportSlug: 'basketball',
        gameId: gameMapping?.localId, subjectType: 'GAME', statKind: `${statKind}_AVAILABILITY`, availability, stats: {},
      },
    })
  }

  private async mapped(type: 'LEAGUE' | 'SEASON' | 'TEAM' | 'GAME', externalId: string) {
    return db.externalEntityMapping.findUnique({ where: { provider_entityType_externalId: { provider: provider.id, entityType: type, externalId } } })
  }

  private async importRecord(record: any, requestedLocalId?: string): Promise<string | undefined> {
    if (record.kind === 'league') {
      const sport = await db.sport.upsert({ where: { slug: 'basketball' }, update: {}, create: { slug: 'basketball', name: 'Basketball' } })
      const slug = `${slugify(record.name)}-${record.externalId}`
      const row = requestedLocalId
        ? await db.league.update({ where: { id: requestedLocalId }, data: { name: record.name } })
        : await db.league.upsert({ where: { slug }, update: { name: record.name }, create: { sportId: sport.id, slug, name: record.name } })
      return row.id
    }
    if (record.kind === 'season') {
      const league = await this.mapped('LEAGUE', record.leagueExternalId)
      if (!league) throw new Error('League must be imported before its season')
      const slug = `${record.leagueExternalId}-${slugify(record.name)}`
      const row = requestedLocalId
        ? await db.season.update({ where: { id: requestedLocalId }, data: { name: record.name } })
        : await db.season.upsert({ where: { slug }, update: { name: record.name }, create: { leagueId: league.localId, slug, name: record.name } })
      return row.id
    }
    if (record.kind === 'team') {
      const [league, sport] = await Promise.all([this.mapped('LEAGUE', record.leagueExternalId), db.sport.findUnique({ where: { slug: 'basketball' } })])
      if (!league || !sport) throw new Error('League and sport must exist before teams')
      const slug = `${slugify(record.name)}-${record.externalId}`
      const row = requestedLocalId
        ? await db.team.update({ where: { id: requestedLocalId }, data: { name: record.name, logoUrl: record.logoUrl } })
        : await db.team.upsert({ where: { slug }, update: { name: record.name, logoUrl: record.logoUrl }, create: { sportId: sport.id, leagueId: league.localId, slug, name: record.name, logoUrl: record.logoUrl } })
      return row.id
    }
    if (record.kind === 'game') {
      const [league, season, home, away, sport] = await Promise.all([
        this.mapped('LEAGUE', record.leagueExternalId), this.mapped('SEASON', record.seasonExternalId),
        this.mapped('TEAM', record.homeTeamExternalId), this.mapped('TEAM', record.awayTeamExternalId),
        db.sport.findUnique({ where: { slug: 'basketball' } }),
      ])
      if (!league || !season || !home || !away || !sport) throw new Error(`Missing mapping required by game ${record.externalId}`)
      const game = requestedLocalId
        ? await db.game.update({ where: { id: requestedLocalId }, data: { scheduledAt: new Date(record.scheduledAt), status: record.status, venue: record.venue } })
        : await db.game.create({ data: { sportId: sport.id, leagueId: league.localId, seasonId: season.localId, scheduledAt: new Date(record.scheduledAt), status: record.status, venue: record.venue } })
      await Promise.all([
        db.gameTeam.upsert({ where: { gameId_teamId: { gameId: game.id, teamId: home.localId } }, update: { finalScore: record.homeScore }, create: { gameId: game.id, teamId: home.localId, isHome: true, finalScore: record.homeScore } }),
        db.gameTeam.upsert({ where: { gameId_teamId: { gameId: game.id, teamId: away.localId } }, update: { finalScore: record.awayScore }, create: { gameId: game.id, teamId: away.localId, isHome: false, finalScore: record.awayScore } }),
      ])
      return game.id
    }
    if (record.kind === 'standing') {
      const [season, team] = await Promise.all([this.mapped('SEASON', record.seasonExternalId), this.mapped('TEAM', record.teamExternalId)])
      if (!season || !team) throw new Error('Standing requires mapped team and season')
      const row = await db.teamSeasonStat.upsert({
        where: { teamId_seasonId: { teamId: team.localId, seasonId: season.localId } },
        update: { wins: record.wins, losses: record.losses, pointsFor: record.pointsFor ?? 0, pointsAgainst: record.pointsAgainst ?? 0, stats: record.stats },
        create: { teamId: team.localId, seasonId: season.localId, wins: record.wins, losses: record.losses, pointsFor: record.pointsFor ?? 0, pointsAgainst: record.pointsAgainst ?? 0, stats: record.stats },
      })
      return row.id
    }
    if (record.kind === 'statLine') {
      const [league, season, game, team] = await Promise.all([
        this.mapped('LEAGUE', record.leagueExternalId), this.mapped('SEASON', record.seasonExternalId),
        record.gameExternalId ? this.mapped('GAME', record.gameExternalId) : null,
        record.teamExternalId ? this.mapped('TEAM', record.teamExternalId) : null,
      ])
      const row = await db.importedStatLine.upsert({
        where: { provider_externalId: { provider: provider.id, externalId: record.externalId } },
        update: { stats: record.stats, statKind: record.stats?.statKind ?? 'GAME_SUMMARY', availability: 'AVAILABLE', leagueId: league?.localId, seasonId: season?.localId, gameId: game?.localId, teamId: team?.localId, importedAt: new Date() },
        create: { provider: provider.id, externalId: record.externalId, sportSlug: record.sportSlug, subjectType: record.playerExternalId ? 'PLAYER' : record.teamExternalId ? 'TEAM' : 'GAME', statKind: record.stats?.statKind ?? 'GAME_SUMMARY', availability: 'AVAILABLE', stats: record.stats, leagueId: league?.localId, seasonId: season?.localId, gameId: game?.localId, teamId: team?.localId },
      })
      return row.id
    }
    return undefined
  }

  async getRun(runId: string) {
    const run = await db.importRun.findUnique({ where: { id: runId }, include: { records: { orderBy: [{ action: 'asc' }, { createdAt: 'asc' }] } } })
    if (!run) throw { statusCode: 404, message: 'Import run not found' }
    return { ...run, quota: await provider.quota() }
  }
}
