import { View, type ViewProps } from 'react-native'
import type { components } from '@statman/sdk'
import { cn } from '@/lib/utils'
import { Card1AStage } from './Card1A'
import { CardCompositionRenderer } from './CardCompositionRenderer'
import { FlippableCard } from './FlippableCard'
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
  const width = SIZE_WIDTHS[size]

  if (hasCompositionSnapshot) {
    const comp = card.templateSnapshot!.composition as any
    const person = card.person ?? card.templateSnapshot!.person
    const assets = card.templateSnapshot!.assets
    const issue = card.currentUserIssue

    const frontFace = (
      <CardCompositionRenderer
        composition={comp}
        person={person}
        assets={assets}
        issue={issue}
        width={width}
      />
    )

    if (comp.backComposition) {
      const backFace = (
        <CardCompositionRenderer
          composition={comp.backComposition}
          person={person}
          assets={assets}
          issue={issue}
          width={width}
        />
      )

      return (
        <View className={cn('items-center', className)} style={style} {...props}>
          <FlippableCard
            front={frontFace}
            back={backFace}
            accessibilityName={card.title || 'Collectible card'}
          />
        </View>
      )
    }

    return (
      <View className={cn('items-center', className)} style={style} {...props}>
        {frontFace}
      </View>
    )
  }

  return (
    <View className={cn('items-center', className)} style={style} {...props}>
      <Card1AStage
        maxWidth={width}
        data={cardFaceDataFromCard(card)}
        statusBadge={showStatus ? { label: CARD_STATUS_LABEL[card.status], tone: CARD_STATUS_TONE[card.status] } : undefined}
      />
    </View>
  )
}
