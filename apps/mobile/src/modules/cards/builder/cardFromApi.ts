import type { components } from '@statman/sdk'
import type { CardBuilderState, CardFramePreset, ReleaseType } from './cardBuilderTypes'

type Card = components['schemas']['Card']

interface CardStudioSnapshot {
  framePreset?: CardFramePreset
  setName?: string
  cardNumber?: string
  backCopy?: string
  promptHelper?: string
  stats?: string[]
}

const FRAMES: CardFramePreset[] = ['team-badge', 'action-chrome', 'stat-battle', 'heritage-back']

function asFramePreset(value: unknown): CardFramePreset {
  return FRAMES.includes(value as CardFramePreset) ? (value as CardFramePreset) : 'team-badge'
}

function studioSnapshot(card: Card): CardStudioSnapshot {
  const raw = card.statsSnapshotJson
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const studio = (raw as { cardStudio?: unknown }).cardStudio
  if (!studio || typeof studio !== 'object' || Array.isArray(studio)) return {}
  return studio as CardStudioSnapshot
}

function releaseFromCard(card: Card): ReleaseType {
  if (card.status === 'DRAFT' || card.visibility === 'PRIVATE') return 'draft'
  if (card.editionMode === 'ONE_OF_ONE') return 'one-of-one'
  if (card.editionMode === 'LIMITED') return 'limited'
  return 'unlimited'
}

/** Maps a saved Card into Card Builder state so drafts can reopen in studio. */
export function cardToBuilderState(card: Card): CardBuilderState {
  const studio = studioSnapshot(card)
  const stats = studio.stats ?? []

  return {
    athleteProfileId: card.athleteProfileId,
    athleteName: card.athlete?.displayName ?? null,
    athleteTeamName: card.athlete?.teamName ?? null,
    cardType: card.cardType,
    title: card.title,
    stylePreset: card.stylePreset,
    framePreset: asFramePreset(studio.framePreset),
    statOne: stats[0] ?? '24 PTS',
    statTwo: stats[1] ?? '8 REB',
    statThree: stats[2] ?? '5 AST',
    promptHelper: studio.promptHelper ?? 'Confident, collectible athlete card using the selected action photo and a clean premium border.',
    backCopy: studio.backCopy ?? 'A composed competitor with the tools to take over a game.',
    setName: studio.setName ?? 'Statman Debut',
    cardNumber: studio.cardNumber ?? 'SM-001',
    release: releaseFromCard(card),
    editionSize: String(card.editionSize ?? 100),
    sourceImageAssetId: card.sourceImageAssetId ?? null,
    sourceImageUrl: card.sourceImage?.url ?? card.athlete?.avatarUrl ?? null,
    side: 'front',
  }
}

export function isEditableCardStatus(status: Card['status']) {
  return status === 'DRAFT' || status === 'READY' || status === 'FAILED' || status === 'GENERATING'
}
