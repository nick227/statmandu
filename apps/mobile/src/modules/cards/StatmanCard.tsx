import { View, type ViewProps } from 'react-native'
import type { components } from '@statman/sdk'
import { cn } from '@/lib/utils'
import { Card1AStage } from './Card1A'
import { CARD_STATUS_LABEL, CARD_STATUS_TONE, cardFaceDataFromCard } from './cardDisplay'

type Card = components['schemas']['Card']

export type StatmanCardSize = 'rail' | 'featured' | 'detail'

export interface StatmanCardProps extends Omit<ViewProps, 'children'> {
  card: Card
  size?: StatmanCardSize
  /** Owner-only context (draft/generating/failed) — hidden for public discovery surfaces. */
  showStatus?: boolean
  className?: string
}

// Sizing adapter around Card 1A. Card1A itself owns all online interaction,
// so no site surface can invent different flip or swipe behavior.
export function StatmanCard({ card, size: _size = 'rail', showStatus = false, className, style, ...props }: StatmanCardProps) {
  return (
    <View className={cn(className)} style={style} {...props}>
      <Card1AStage
        data={cardFaceDataFromCard(card)}
        statusBadge={showStatus ? { label: CARD_STATUS_LABEL[card.status], tone: CARD_STATUS_TONE[card.status] } : undefined}
      />
    </View>
  )
}
