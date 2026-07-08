import { useColorScheme, vars } from 'nativewind'
import { getSportDefinition } from '@statman/sports'

// Re-exported so the rest of the app imports theme concerns from one place
// (`@/lib/theme`) instead of reaching into `nativewind` directly everywhere.
export { useColorScheme }

// Mirrors the RGB triplets in global.css exactly. className-based colors read
// those CSS variables and flip automatically with the `.dark` class, but native
// color props (lucide icons, ActivityIndicator, TextInput placeholders,
// @gorhom/bottom-sheet style props) can't — this is the one place those values
// get duplicated as literals. Keep in sync with global.css by hand.
const NATIVE_COLOR = {
  text: { light: 'rgb(17 17 17)', dark: 'rgb(245 245 244)' },
  mutedText: { light: 'rgb(107 114 128)', dark: 'rgb(156 163 175)' },
  surface: { light: 'rgb(255 255 255)', dark: 'rgb(23 24 26)' },
  border: { light: 'rgb(229 231 235)', dark: 'rgb(42 42 46)' },
  brand: { light: 'rgb(29 78 216)', dark: 'rgb(59 130 246)' },
  dispute: { light: 'rgb(245 158 11)', dark: 'rgb(251 191 36)' },
} as const

export type NativeColorScale = keyof typeof NATIVE_COLOR

export function useNativeColor(scale: NativeColorScale) {
  const { colorScheme } = useColorScheme()
  return NATIVE_COLOR[scale][colorScheme === 'dark' ? 'dark' : 'light']
}

// Scopes --color-sport-accent to the given sport for everything under the
// View this is applied to — `bg-sport-accent`/`text-sport-accent`/etc. all
// resolve to that sport's color for the rest of the subtree, the same way
// `.dark` scopes light/dark. Spread the result onto a wrapping View's style:
//   <View style={useSportTheme(sport)}>...</View>
// Falls back to brand blue (global.css's default) for an unknown/missing
// sport rather than throwing — this wraps whole screens, so it must never
// crash a profile page over a bad or not-yet-loaded sport slug.
export function useSportTheme(sportSlug: string | undefined) {
  const { colorScheme } = useColorScheme()
  const mode = colorScheme === 'dark' ? 'dark' : 'light'
  if (!sportSlug) return vars({})
  try {
    const accent = getSportDefinition(sportSlug).theme.accent[mode]
    return vars({ '--color-sport-accent': accent })
  } catch {
    return vars({})
  }
}

// Native-color-prop equivalent of useSportTheme, for icons/ActivityIndicator
// inside a themed screen that can't take a className.
export function useSportAccentColor(sportSlug: string | undefined) {
  const { colorScheme } = useColorScheme()
  const mode = colorScheme === 'dark' ? 'dark' : 'light'
  const fallback = NATIVE_COLOR.brand[mode]
  if (!sportSlug) return fallback
  try {
    const [r, g, b] = getSportDefinition(sportSlug).theme.accent[mode].split(' ')
    return `rgb(${r} ${g} ${b})`
  } catch {
    return fallback
  }
}

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

// Native-color-prop equivalent of the StatusColorToken palette (mirrors
// global.css exactly) — for a Badge's optional icon, which can't take a
// className. Separate from NATIVE_COLOR since the token names don't line up
// 1:1 (StatusColorToken uses 'muted-text', NativeColorScale uses 'mutedText').
const STATUS_NATIVE_COLOR: Record<StatusColorToken, { light: string; dark: string }> = {
  'muted-text': NATIVE_COLOR.mutedText,
  brand: NATIVE_COLOR.brand,
  dispute: NATIVE_COLOR.dispute,
  verified: { light: 'rgb(22 163 74)', dark: 'rgb(34 197 94)' },
  live: { light: 'rgb(239 68 68)', dark: 'rgb(248 113 113)' },
  imported: { light: 'rgb(99 102 241)', dark: 'rgb(129 140 248)' },
}

export function useStatusNativeColor(tone: StatusColorToken) {
  const { colorScheme } = useColorScheme()
  return STATUS_NATIVE_COLOR[tone][colorScheme === 'dark' ? 'dark' : 'light']
}

const SOURCE_STATUS_COLOR: Record<string, StatusColorToken> = {
  PLAYER_REPORTED: 'muted-text',
  SPECTATOR_REPORTED: 'muted-text',
  MULTI_SPECTATOR_CONFIRMED: 'brand',
  TEAM_MANAGER_ENTERED: 'brand',
  OFFICIAL_SCORER_RECORDED: 'brand',
  VERIFIED_TEAM_ACCOUNT: 'verified',
  ONLINE_SOURCE_IMPORTED: 'imported',
  PUBLIC_SOURCE_SCRAPED: 'imported',
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
