import type { CardPoseDefinition, SportDefinition } from './types'

// Used for any sport with no cardPoses declared — a real trading-card set
// still needs at least a portrait and one action shot, rather than
// returning nothing.
const GENERIC_CARD_POSES: CardPoseDefinition[] = [
  {
    id: 'generic-portrait',
    label: 'Portrait Stance',
    category: 'portrait',
    promptTemplate: 'Trading-card portrait pose: three-quarter view, confident expression, arms crossed, studio lighting, plain neutral background, team uniform.',
  },
  {
    id: 'generic-action',
    label: 'Action Shot',
    category: 'action',
    promptTemplate: 'Trading-card action pose: mid-competition dynamic movement, athletic uniform, outdoor venue background, dramatic lighting.',
  },
]

export function getCardPoses(definition: SportDefinition): CardPoseDefinition[] {
  return definition.cardPoses && definition.cardPoses.length > 0 ? definition.cardPoses : GENERIC_CARD_POSES
}
