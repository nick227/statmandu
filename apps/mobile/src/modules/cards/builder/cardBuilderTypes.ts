import type { components } from '@statman/sdk'

export type CardType = components['schemas']['CardType']

export type ReleaseType = 'draft' | 'unlimited' | 'limited' | 'one-of-one'

export type CardBuilderSide = 'front' | 'back'

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

export interface CardBuilderState {
  athleteProfileId: string | null
  athleteName: string | null
  athleteTeamName: string | null
  cardType: CardType
  title: string
  stylePreset: string
  framePreset: CardFramePreset
  statOne: string
  statTwo: string
  statThree: string
  promptHelper: string
  backCopy: string
  setName: string
  cardNumber: string
  release: ReleaseType
  editionSize: string
  sourceImageAssetId: string | null
  sourceImageUrl: string | null
  side: CardBuilderSide
}

