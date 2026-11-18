import type { CardType } from './cardBuilderTypes'
import { CARD_FRAMES, STYLE_PRESETS } from '../cardDisplay'

// CARD_FRAMES/STYLE_PRESETS now live in cardDisplay.ts — CardFace.tsx
// (shared by the builder preview and every real card) needs them too, not
// just the builder form. Re-exported here so existing builder imports
// don't all need to change.
export { CARD_FRAMES, STYLE_PRESETS }

export const CARD_TYPES: { value: CardType; label: string; helper: string }[] = [
  { value: 'PROFILE', label: 'Profile', helper: 'The classic trading card: identity + headline stats.' },
  { value: 'BIG_GAME', label: 'Big Game', helper: 'A performance card that celebrates a single matchup.' },
  { value: 'MILESTONE', label: 'Milestone', helper: 'Commemorate a career moment or personal best.' },
  { value: 'SEASON', label: 'Season', helper: 'A year-in-review collectible built from season totals.' },
  { value: 'HIGHLIGHT', label: 'Highlight', helper: 'A single play with a premium presentation.' },
]

export const RELEASE_OPTIONS = [
  { value: 'draft' as const, label: 'Private Draft', helper: 'Save only. Not visible to fans.' },
  { value: 'unlimited' as const, label: 'Public Unlimited', helper: 'Fans can claim without a cap.' },
  { value: 'limited' as const, label: 'Limited', helper: 'Set a fixed claim limit.' },
  { value: 'one-of-one' as const, label: '1-of-1', helper: 'Only one issued copy.' },
]

