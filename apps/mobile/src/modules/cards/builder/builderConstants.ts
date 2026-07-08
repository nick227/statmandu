import type { CardStylePreset, CardType, CardFramePreset } from './cardBuilderTypes'

export const CARD_TYPES: { value: CardType; label: string; helper: string }[] = [
  { value: 'PROFILE', label: 'Profile', helper: 'The classic trading card: identity + headline stats.' },
  { value: 'BIG_GAME', label: 'Big Game', helper: 'A performance card that celebrates a single matchup.' },
  { value: 'MILESTONE', label: 'Milestone', helper: 'Commemorate a career moment or personal best.' },
  { value: 'SEASON', label: 'Season', helper: 'A year-in-review collectible built from season totals.' },
  { value: 'HIGHLIGHT', label: 'Highlight', helper: 'A single play with a premium presentation.' },
]

export const CARD_FRAMES: { value: CardFramePreset; label: string; description: string }[] = [
  { value: 'team-badge', label: 'Team Badge', description: 'Crest, nameplate, team color bands' },
  { value: 'action-chrome', label: 'Action Chrome', description: 'Full-bleed action image with premium trim' },
  { value: 'stat-battle', label: 'Stat Battle', description: 'Ratings and matchup-style stat bars' },
  { value: 'heritage-back', label: 'Heritage Back', description: 'Classic card front with a rich stat back' },
]

export const STYLE_PRESETS: CardStylePreset[] = [
  { value: 'classic-foil', label: 'Classic Foil', primary: '#2563EB', secondary: '#E5E7EB', text: '#FFFFFF', contrast: '#0F172A', plate: '#0F172A' },
  { value: 'team-pride', label: 'Team Pride', primary: '#16A34A', secondary: '#FACC15', text: '#FFFFFF', contrast: '#052E16', plate: '#052E16' },
  { value: 'action-chrome', label: 'Action Chrome', primary: '#DC2626', secondary: '#F8FAFC', text: '#FFFFFF', contrast: '#111827', plate: '#111827' },
  { value: 'heritage-stock', label: 'Heritage Stock', primary: '#B45309', secondary: '#FEF3C7', text: '#1F2937', contrast: '#1F2937', plate: '#FFFBEB' },
  { value: 'night-rivals', label: 'Night Rivals', primary: '#7C3AED', secondary: '#22D3EE', text: '#FFFFFF', contrast: '#18181B', plate: '#18181B' },
]

export const RELEASE_OPTIONS = [
  { value: 'draft' as const, label: 'Private Draft', helper: 'Save only. Not visible to fans.' },
  { value: 'unlimited' as const, label: 'Public Unlimited', helper: 'Fans can claim without a cap.' },
  { value: 'limited' as const, label: 'Limited', helper: 'Set a fixed claim limit.' },
  { value: 'one-of-one' as const, label: '1-of-1', helper: 'Only one issued copy.' },
]

