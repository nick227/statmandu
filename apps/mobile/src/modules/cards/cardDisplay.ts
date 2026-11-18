import type { components } from '@statman/sdk'

type Card = components['schemas']['Card']
type CardTemplateStatus = components['schemas']['CardTemplateStatus']
type CardType = components['schemas']['CardType']
export type BadgeTone = 'muted-text' | 'brand' | 'verified' | 'dispute' | 'live' | 'imported'

// Formatting helpers shared by every real (SDK-backed) card surface.
export const CARD_TYPE_LABEL: Record<CardType, string> = {
  PROFILE: 'Profile',
  BIG_GAME: 'Big Game',
  MILESTONE: 'Milestone',
  SEASON: 'Season',
  HIGHLIGHT: 'Highlight',
}

export const CARD_STATUS_LABEL: Record<CardTemplateStatus, string> = {
  DRAFT: 'Draft',
  GENERATING: 'Generating',
  READY: 'Ready to Publish',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
  FAILED: 'Failed',
}

export const CARD_STATUS_TONE: Record<CardTemplateStatus, BadgeTone> = {
  DRAFT: 'muted-text',
  GENERATING: 'brand',
  READY: 'brand',
  PUBLISHED: 'verified',
  ARCHIVED: 'muted-text',
  FAILED: 'dispute',
}

export function isLimitedEdition(card: Pick<Card, 'editionMode'>): boolean {
  return card.editionMode === 'LIMITED' || card.editionMode === 'ONE_OF_ONE'
}

export function editionLabel(card: Pick<Card, 'editionMode' | 'editionSize' | 'issuedCount'>): string {
  if (card.editionMode === 'ONE_OF_ONE') return '1-of-1'
  if (card.editionMode === 'LIMITED' && card.editionSize) return `${card.issuedCount}/${card.editionSize} claimed`
  return 'Unlimited'
}

// Exact copy from spec: unlimited editions never had a meaningful issue
// number to show, limited/1-of-1 editions always do.
export function claimedStatusMessage(card: Pick<Card, 'editionMode' | 'editionSize'>, issueNumber?: number | null): string {
  if (card.editionMode === 'UNLIMITED' || !card.editionSize) return 'Claimed copy'
  return `You claimed #${String(issueNumber ?? 0).padStart(3, '0')} / ${String(card.editionSize).padStart(3, '0')}`
}

export function athleteFullName(card: Pick<Card, 'athlete'>): string {
  return card.athlete?.displayName ?? 'Unknown Athlete'
}

function isLoadableUrl(url?: string | null): url is string {
  // The card-image "generator" is currently a stub (see
  // CardImageGenerator.ts) that writes a fake `statman://generated/...`
  // placeholder into frontImage.url — a real, non-null ImageAsset row, but
  // not a URL any <Image> can load. Treat it the same as "no image" so the
  // ?? chain below actually falls through to the real photo instead of
  // rendering broken art on every published card.
  return Boolean(url) && /^https?:\/\//.test(url!)
}

export function cardImageUri(card: Pick<Card, 'frontImage' | 'sourceImage' | 'athlete'>): string | null {
  if (isLoadableUrl(card.frontImage?.url)) return card.frontImage!.url
  if (isLoadableUrl(card.sourceImage?.url)) return card.sourceImage!.url
  return card.athlete?.avatarUrl ?? null
}

// ─────────────────────────────────────────────────────────────────────────
// Card face — the actual trading-card visual, shared by CardFace.tsx (real
// cards + the Card Studio live preview) so the two can't drift apart again.
// ─────────────────────────────────────────────────────────────────────────

export type CardFramePreset = 'team-badge' | 'action-chrome' | 'stat-battle' | 'heritage-back'

export interface CardStylePreset {
  value: string
  label: string
  primary: string
  secondary: string
  text: string
  contrast: string
  plate: string
}

export const STYLE_PRESETS: CardStylePreset[] = [
  { value: 'classic-foil', label: 'Classic Foil', primary: '#2563EB', secondary: '#E5E7EB', text: '#FFFFFF', contrast: '#0F172A', plate: '#0F172A' },
  { value: 'team-pride', label: 'Team Pride', primary: '#16A34A', secondary: '#FACC15', text: '#FFFFFF', contrast: '#052E16', plate: '#052E16' },
  { value: 'action-chrome', label: 'Action Chrome', primary: '#DC2626', secondary: '#F8FAFC', text: '#FFFFFF', contrast: '#111827', plate: '#111827' },
  { value: 'heritage-stock', label: 'Heritage Stock', primary: '#B45309', secondary: '#FEF3C7', text: '#1F2937', contrast: '#1F2937', plate: '#FFFBEB' },
  { value: 'night-rivals', label: 'Night Rivals', primary: '#7C3AED', secondary: '#22D3EE', text: '#FFFFFF', contrast: '#18181B', plate: '#18181B' },
]

export const CARD_FRAMES: { value: CardFramePreset; label: string; description: string }[] = [
  { value: 'team-badge', label: 'Team Badge', description: 'Crest, nameplate, team color bands' },
  { value: 'action-chrome', label: 'Action Chrome', description: 'Full-bleed action image with premium trim' },
  { value: 'stat-battle', label: 'Stat Battle', description: 'Ratings and matchup-style stat bars' },
  { value: 'heritage-back', label: 'Heritage Back', description: 'Classic card front with a rich stat back' },
]

export function parseStatValue(stat: string) {
  const match = stat.match(/\d+/)
  return match ? Number(match[0]) : 0
}

export function ratingFromStats(stats: string[]) {
  const total = stats.reduce((sum, stat) => sum + parseStatValue(stat), 0)
  return Math.max(68, Math.min(99, 72 + Math.round(total / 3)))
}

export function teamInitials(value: string) {
  return (
    value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'SM'
  )
}

export interface CardFaceData {
  imageUri: string | null
  athleteName: string
  teamName: string
  title: string
  cardTypeLabel: string
  style: CardStylePreset
  framePreset: CardFramePreset
  stats: string[]
  rarityLabel: string
  isRare: boolean
  setName: string
  cardNumber: string
  backCopy: string
}

function readCardStudioSnapshot(card: Card): { framePreset?: string; stats?: string[]; setName?: string; cardNumber?: string; backCopy?: string } {
  const raw = card.statsSnapshotJson
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const studio = (raw as { cardStudio?: unknown }).cardStudio
  if (!studio || typeof studio !== 'object' || Array.isArray(studio)) return {}
  return studio as ReturnType<typeof readCardStudioSnapshot>
}

/** Normalizes a real, SDK-backed Card into the data CardFace renders —
 *  the counterpart to the builder's own state-to-face mapping in
 *  StatmanCardPreview.tsx. Falls back sensibly for cards that predate the
 *  Card Studio "cardStudio" snapshot or never went through it. */
export function cardFaceDataFromCard(card: Card): CardFaceData {
  const studio = readCardStudioSnapshot(card)
  const style = STYLE_PRESETS.find((s) => s.value === card.stylePreset) ?? STYLE_PRESETS[0]!
  const framePreset = CARD_FRAMES.some((f) => f.value === studio.framePreset)
    ? (studio.framePreset as CardFramePreset)
    : 'team-badge'

  return {
    imageUri: cardImageUri(card),
    athleteName: athleteFullName(card),
    teamName: card.athlete?.teamName ?? card.team?.name ?? 'Independent',
    title: card.title,
    cardTypeLabel: CARD_TYPE_LABEL[card.cardType],
    style,
    framePreset,
    stats: Array.isArray(studio.stats) ? studio.stats.filter(Boolean) : [],
    rarityLabel: editionLabel(card),
    isRare: isLimitedEdition(card),
    setName: studio.setName ?? 'Statman Debut',
    cardNumber: studio.cardNumber ?? '',
    backCopy: studio.backCopy ?? `${athleteFullName(card)} competes with purpose. This card records a verified Statman profile and season moment.`,
  }
}
