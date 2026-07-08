import type { components } from '@statman/sdk'

type Card = components['schemas']['Card']
type CardTemplateStatus = components['schemas']['CardTemplateStatus']
type CardType = components['schemas']['CardType']
type BadgeTone = 'muted-text' | 'brand' | 'verified' | 'dispute' | 'live' | 'imported'

// Formatting helpers shared by every real (SDK-backed) card surface. Kept
// separate from the Card Builder workstream's modules/cards/types.ts +
// CardStatusBadge/CardEditionBadge — those model a local mock CardStatus
// ('draft'|'ready'|...) and CardEditionInfo shape for the in-progress
// builder wizard, not the real CardTemplateStatus/CardEditionMode enums
// the backend actually returns. Two different data contracts, so kept
// as two separate, non-colliding pieces rather than forcing a shared file.
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
  return card.athlete ? `${card.athlete.firstName} ${card.athlete.lastName}` : 'Unknown Athlete'
}

export function cardImageUri(card: Pick<Card, 'frontImage' | 'sourceImage' | 'athlete'>): string | null {
  return card.frontImage?.url ?? card.sourceImage?.url ?? card.athlete?.avatarUrl ?? null
}
