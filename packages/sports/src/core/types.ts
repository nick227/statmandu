export type StatValue = number | string | boolean | null
export type StatMap = Record<string, StatValue>

export type StatFieldDefinition = {
  label: string
  fullLabel?: string
  type: 'integer' | 'decimal' | 'string' | 'boolean'
  format?: 'integer' | 'decimal1' | 'decimal2' | 'percent' | 'record' | 'duration'
  group?: string
  aggregate?: 'sum' | 'average' | 'latest' | 'none'
  derived?:
    | { type: 'sum'; stats: string[] }
    | { type: 'perGame'; stat: string }
}

export type EventFlow = {
  // Event types to visually promote as the likely next tap.
  suggestsEvents?: string[]
  // Auto-swap the selected team to the other side after this event.
  flipsPossession?: boolean
  // Default true — false clears the sticky selected player (the next actor
  // is very likely someone else, e.g. a rebounder after a miss).
  keepsPlayer?: boolean
}

export type EventDefinition = {
  label: string
  shortLabel?: string
  group?: string
  points?: number
  requiresPlayer?: boolean
  requiresTeam?: boolean
  requiresSecondaryPlayer?: boolean
  confirmationMode?: 'instant' | 'confirm' | 'detail'
  quickAdjust?: boolean
  statDeltas?: Record<string, number>
  flow?: EventFlow
}

export type DisciplineConfig = {
  // Event types that count toward foul/discipline totals.
  foulEventTypes: string[]
  // Team fouls at which the fouled team goes into a bonus free-throw
  // situation. Deliberately a single running-game threshold, not
  // reset-per-period — GameEvent has no period column yet (see CLAUDE.md's
  // "Period/game-clock tracking" deferred item), so this is a documented
  // simplification, not the real by-half rule.
  bonusThreshold: number
  // Individual fouls at which a player is disqualified/fouled out.
  foulOutThreshold?: number
}

export type SportDefinition = {
  slug: string
  name: string
  leagueTypes: string[]
  positions: string[]
  periods: {
    type: 'quarters' | 'halves' | 'periods' | 'sets' | 'rounds' | 'none'
    count?: number
  }
  score: {
    unit: string
    highScoreWins: boolean
  }
  // RGB triplet strings ("R G B", no `rgb()` wrapper) so they drop straight
  // into a CSS variable the same way every other color token does — see
  // apps/mobile/global.css's --color-sport-accent and useSportTheme().
  theme: {
    accent: { light: string; dark: string }
  }
  events: Record<string, EventDefinition>
  playerStatFields: Record<string, StatFieldDefinition>
  teamStatFields: Record<string, StatFieldDefinition>
  views: {
    profileHeadline: string[]
    teamProfileHeadline: string[]
    boxScore: string[]
    leaderboard: string[]
    livePad: string[][]
  }
  // Optional — only sports with a real foul/bonus/disqualification concept
  // declare this. Absent for sports where computeDisciplineStatus should
  // just return null rather than guess at an unresearched rule.
  discipline?: DisciplineConfig
}

export type ReconcileEvent = {
  type: string
  playerId: string | null
  teamId: string | null
  status?: string
}

export type ReconciledPlayerLine = {
  playerId: string
  teamId: string
  stats: Record<string, number>
}

export type ReconcileResult = {
  playerLines: ReconciledPlayerLine[]
  teamScores: Map<string, number>
}
