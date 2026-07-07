import { useColorScheme } from 'nativewind'

// Re-exported so the rest of the app imports theme concerns from one place
// (`@/lib/theme`) instead of reaching into `nativewind` directly everywhere.
export { useColorScheme }

// Motion timings — statman_project_docs/statman_docs_bundle/19_DESIGN_TOKEN_SHEET.json.
// Not expressible as Tailwind classes on native, so they live here as plain
// constants for use with Reanimated / Animated configs.
export const motion = {
  sheetSnapMs: 260,
  cardPressMs: 120,
  pageTransitionMs: 220,
  liveEventFeedbackMs: 160,
} as const

// Maps backend status vocabulary (SourceStatus, GameStatus, GameEventStatus)
// to the design token color a badge/indicator should use. Single source of
// truth so a status never gets a different color on two different screens.
export type StatusColorToken = 'verified' | 'brand' | 'dispute' | 'live' | 'muted-text' | 'imported'

const SOURCE_STATUS_COLOR: Record<string, StatusColorToken> = {
  SELF_REPORTED: 'muted-text',
  TEAM_ENTERED: 'brand',
  MANAGER_APPROVED: 'brand',
  IMPORTED_SOURCE: 'imported',
  SCRAPED_PUBLIC: 'imported',
  VERIFIED: 'verified',
  IN_DISPUTE: 'dispute',
}

export function sourceStatusColor(status: string): StatusColorToken {
  return SOURCE_STATUS_COLOR[status] ?? 'muted-text'
}

const GAME_STATUS_COLOR: Record<string, StatusColorToken> = {
  SCHEDULED: 'muted-text',
  LIVE: 'live',
  FINAL: 'brand',
  DISPUTED: 'dispute',
}

export function gameStatusColor(status: string): StatusColorToken {
  return GAME_STATUS_COLOR[status] ?? 'muted-text'
}
