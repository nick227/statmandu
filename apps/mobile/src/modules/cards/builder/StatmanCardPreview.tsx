import { Card1AStage } from '../Card1A'
import { STYLE_PRESETS, type CardFaceData } from '../cardDisplay'
import type { CardBuilderState } from './cardBuilderTypes'
import { CARD_TYPES } from './builderConstants'
import type { CardSide } from '../FlippableCard'

function releaseRarityLabel(state: CardBuilderState) {
  if (state.release === 'one-of-one') return '1-of-1'
  if (state.release === 'limited') return `${state.editionSize} max`
  if (state.release === 'draft') return 'Draft'
  return 'Unlimited'
}

/** Builder-state counterpart to cardDisplay.ts's cardFaceDataFromCard — same
 *  target shape, so the live preview and the real published card (once
 *  generate/publish round-trips this state through the API) render
 *  identically via the same CardFace component. */
function cardFaceDataFromBuilderState(state: CardBuilderState): CardFaceData {
  return {
    imageUri: state.sourceImageUrl,
    athleteName: state.athleteName ?? 'Select athlete',
    teamName: state.athleteTeamName ?? 'Independent',
    title: state.title,
    cardTypeLabel: CARD_TYPES.find((t) => t.value === state.cardType)?.label ?? 'Card',
    style: STYLE_PRESETS.find((s) => s.value === state.stylePreset) ?? STYLE_PRESETS[0]!,
    framePreset: state.framePreset,
    stats: [state.statOne, state.statTwo, state.statThree].filter(Boolean),
    rarityLabel: releaseRarityLabel(state),
    isRare: state.release === 'one-of-one' || state.release === 'limited',
    setName: state.setName,
    cardNumber: state.cardNumber,
    backCopy: state.backCopy,
  }
}

export function StatmanCardPreview({ state, onSideChange }: { state: CardBuilderState; onSideChange?: (side: CardSide) => void }) {
  return (
    <Card1AStage data={cardFaceDataFromBuilderState(state)} side={state.side} onSideChange={onSideChange} />
  )
}
