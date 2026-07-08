import { ScrollView } from 'react-native'
import type { components } from '@statman/sdk'
import { ConnectedStatmanCard } from './ConnectedStatmanCard'

type Card = components['schemas']['Card']

export interface CardRailProps {
  cards: Card[]
  /** Show draft/generating/failed status instead of edition info — for an owner viewing their own unpublished cards. */
  showStatus?: boolean
  className?: string
}

// Generic horizontal rail reused on Home, Explore, and the athlete profile
// Cards tab — each caller supplies its own already-fetched card list, this
// component owns only the scroll/tile presentation.
export function CardRail({ cards, showStatus, className }: CardRailProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName={className ?? 'gap-sm'}>
      {cards.map((card) => (
        <ConnectedStatmanCard key={card.id} card={card} size="rail" showStatus={showStatus} className="w-40" />
      ))}
    </ScrollView>
  )
}
