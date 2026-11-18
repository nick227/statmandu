export type ImportScope = 'teams' | 'games' | 'standings' | 'stats'

export type ProviderCapabilities = {
  teamStats: boolean
  playerBoxScores: boolean
  seasonTotals: boolean
}

export type DetailImportFilters = {
  dateFrom?: string
  dateTo?: string
  teamId?: string
  gameIds?: string[]
  recentCompletedGames?: number
}

export type NormalizedLeague = {
  kind: 'league'
  externalId: string
  name: string
  sportSlug: string
  country?: string
  capabilities?: ProviderCapabilities
}

export type NormalizedSeason = {
  kind: 'season'
  externalId: string
  leagueExternalId: string
  name: string
  startDate?: string
  endDate?: string
}

export type NormalizedTeam = {
  kind: 'team'
  externalId: string
  leagueExternalId: string
  name: string
  country?: string
  logoUrl?: string
}

export type NormalizedGame = {
  kind: 'game'
  externalId: string
  leagueExternalId: string
  seasonExternalId: string
  scheduledAt: string
  status: 'SCHEDULED' | 'LIVE' | 'FINAL'
  venue?: string
  homeTeamExternalId: string
  awayTeamExternalId: string
  homeScore?: number
  awayScore?: number
}

export type NormalizedStanding = {
  kind: 'standing'
  externalId: string
  leagueExternalId: string
  seasonExternalId: string
  teamExternalId: string
  rank?: number
  wins: number
  losses: number
  pointsFor?: number
  pointsAgainst?: number
  stats: Record<string, number | string | boolean | null>
}

export type NormalizedStatLine = {
  kind: 'statLine'
  externalId: string
  sportSlug: string
  leagueExternalId: string
  seasonExternalId: string
  gameExternalId?: string
  teamExternalId?: string
  playerExternalId?: string
  stats: Record<string, number | string | boolean | null>
}

export type NormalizedImportRecord =
  | NormalizedLeague
  | NormalizedSeason
  | NormalizedTeam
  | NormalizedGame
  | NormalizedStanding
  | NormalizedStatLine

export type ProviderImportRequest = {
  leagueId: string
  season: string
  scopes: ImportScope[]
}

export interface SportsImportProvider {
  readonly id: 'API_SPORTS_BASKETBALL'
  readonly capabilities: ProviderCapabilities
  readonly detailBatchSize: number
  readonly plan: string
  readonly supportsBatchIds: boolean
  fetchAndNormalize(runId: string, request: ProviderImportRequest): Promise<NormalizedImportRecord[]>
  fetchDetailedStats(runId: string, gameIds: string[], capabilities: ProviderCapabilities): Promise<NormalizedStatLine[]>
  quota(): Promise<{
    usedToday: number
    limit: number
    remaining: number
    usedThisMinute: number
    minuteLimit: number
    minuteRemaining: number
    minuteResetsAt: string
  }>
}
