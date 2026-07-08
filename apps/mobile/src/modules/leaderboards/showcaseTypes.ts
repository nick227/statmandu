import type { components } from '@statman/sdk'

type Game = components['schemas']['Game']
type PlayerLeaderboardEntry = components['schemas']['PlayerLeaderboardEntry']
type TeamLeaderboardEntry = components['schemas']['TeamLeaderboardEntry']

export type ShowcaseList =
  | { key: string; kind: 'players'; title: string; subtitle: string; entries: PlayerLeaderboardEntry[] }
  | { key: string; kind: 'teams'; title: string; subtitle: string; entries: TeamLeaderboardEntry[] }
  | { key: string; kind: 'games'; title: string; subtitle: string; entries: Game[] }

export type ShowcaseEntry = ShowcaseList['entries'][number]
