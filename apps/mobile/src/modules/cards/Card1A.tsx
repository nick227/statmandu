import { View, useWindowDimensions } from 'react-native'
import { CardBack } from './CardBack'
import { CardFace, type CardFaceProps } from './CardFace'
import { FlippableCard, type CardSide } from './FlippableCard'
import { CARD_GEOMETRY } from './cardGeometry'

export interface Card1AProps extends CardFaceProps {
  side?: CardSide
  initialSide?: CardSide
  onSideChange?: (side: CardSide) => void
}

/** Card 1A: canonical front/back artwork plus the canonical online interaction. */
export function Card1A({ side, initialSide, onSideChange, ...faceProps }: Card1AProps) {
  return (
    <FlippableCard
      front={<CardFace {...faceProps} />}
      back={<CardBack data={faceProps.data} dense={faceProps.dense} productionLabel={faceProps.statusBadge?.label} />}
      side={side}
      initialSide={initialSide}
      onSideChange={onSideChange}
      accessibilityName={`${faceProps.data.athleteName} trading card`}
    />
  )
}

export type Card1AStageProps = Omit<Card1AProps, 'dense'>

/**
 * The only approved online Card 1A viewport. The outer width reserves the
 * exterior flip controls; the inner card is locked to 320 x 448. It may
 * shrink only when its parent is narrower than the complete 368px stage.
 */
export function Card1AStage(props: Card1AStageProps) {
  const { width } = useWindowDimensions()
  const stageWidth = Math.min(CARD_GEOMETRY.interactionStageWidth, width)

  return (
    <View
      style={{
        width: stageWidth,
        alignSelf: 'center',
        paddingHorizontal: CARD_GEOMETRY.interactionGutter,
      }}
    >
      <View style={{ width: '100%', aspectRatio: CARD_GEOMETRY.aspectRatio, overflow: 'visible' }}>
        <Card1A {...props} dense={false} />
      </View>
    </View>
  )
}
