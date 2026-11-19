import { View, type ViewProps } from 'react-native'
import type { components } from '@statman/sdk'
import { cn } from '@/lib/utils'
import { Card1AStage } from './Card1A'
import { CardCompositionRenderer } from './CardCompositionRenderer'
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

const SIZE_WIDTHS: Record<StatmanCardSize, number> = {
  rail: 240,
  featured: 320,
  detail: 340,
}

// Sizing adapter around CardCompositionRenderer (RDC) or Card 1A (legacy).
export function StatmanCard({ card, size = 'rail', showStatus = false, className, style, ...props }: StatmanCardProps) {
  const hasCompositionSnapshot = Boolean(card.templateSnapshot?.composition)

  if (hasCompositionSnapshot) {
    const width = SIZE_WIDTHS[size]
    return (
      <View className={cn('items-center', className)} style={style} {...props}>
        <CardCompositionRenderer
          composition={card.templateSnapshot!.composition}
          person={card.person ?? card.templateSnapshot!.person}
          assets={card.templateSnapshot!.assets}
          issue={card.currentUserIssue}
          width={width}
        />
      </View>
    )
  }

  return (
    <View className={cn(className)} style={style} {...props}>
      <Card1AStage
        data={cardFaceDataFromCard(card)}
        statusBadge={showStatus ? { label: CARD_STATUS_LABEL[card.status], tone: CARD_STATUS_TONE[card.status] } : undefined}
      />
    </View>
  )
}
