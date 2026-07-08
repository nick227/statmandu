import { useState } from 'react'
import type { CardBuilderState } from './cardBuilderTypes'

const DEFAULT_STATE: CardBuilderState = {
  athleteProfileId: null,
  athleteName: null,
  athleteTeamName: null,
  cardType: 'PROFILE',
  title: 'Rising Star',
  stylePreset: 'classic-foil',
  framePreset: 'team-badge',
  statOne: '24 PTS',
  statTwo: '8 REB',
  statThree: '5 AST',
  promptHelper: 'Confident, collectible athlete card using the selected action photo and a clean premium border.',
  backCopy: 'A composed competitor with the tools to take over a game. Built from verified Statman profile data and reusable gallery media.',
  setName: 'Statman Debut',
  cardNumber: 'SM-001',
  release: 'draft',
  editionSize: '100',
  sourceImageAssetId: null,
  sourceImageUrl: null,
  side: 'front',
}

export function useCardBuilderState() {
  const [state, setState] = useState<CardBuilderState>(DEFAULT_STATE)

  return {
    state,
    setState,
    updateState: (updates: Partial<CardBuilderState>) => setState((prev) => ({ ...prev, ...updates })),
  }
}

