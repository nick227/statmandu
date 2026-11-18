import { useState } from 'react'
import { ScrollView, View } from 'react-native'
import type { components } from '@statman/sdk'
import { LAYOUT } from '@/shared/layout/layoutConstants'
import { ConnectedStatmanCard, type ConnectedStatmanCardProps } from './ConnectedStatmanCard'
import { FLIP_TAB_WIDTH } from './FlippableCard'

type Card = components['schemas']['Card']

export interface CardRailProps {
  cards: Card[]
  /** Show draft/generating/failed status instead of edition info — for an owner viewing their own unpublished cards. */
  showStatus?: boolean
  /** Route unfinished owned cards into Card Studio. */
  editInStudio?: boolean
  /** Which surface this rail lives on — see ConnectedStatmanCardProps.source. */
  source?: ConnectedStatmanCardProps['source']
  className?: string
}

// Generic horizontal rail reused on Home, Explore, and the athlete profile
// Cards tab — each caller supplies its own already-fetched card list, this
// component owns only the scroll/tile presentation.
export function CardRail({ cards, showStatus, editInStudio, source, className }: CardRailProps) {
  const [containerWidth, setContainerWidth] = useState(0)
  const groupWidth = cards.length * LAYOUT.railCardWidth + Math.max(0, cards.length - 1) * LAYOUT.railGap
  const cardsFit = containerWidth >= groupWidth
  const cardItems = cards.map((card) => (
    <View key={card.id} style={{ width: LAYOUT.railCardWidth }}>
      <ConnectedStatmanCard
        card={card}
        size="rail"
        showStatus={showStatus}
        editInStudio={editInStudio}
        source={source}
      />
    </View>
  ))

  return (
    <View
      className={className}
      style={{ width: '100%', overflow: 'visible' }}
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
    >
      {cardsFit ? (
        <View
          style={{
            width: '100%',
            overflow: 'visible',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: LAYOUT.railGap,
          }}
        >
          {cardItems}
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={LAYOUT.railCardWidth + LAYOUT.railGap}
          snapToAlignment="start"
          decelerationRate="fast"
          contentContainerStyle={{ gap: LAYOUT.railGap, paddingHorizontal: FLIP_TAB_WIDTH }}
        >
          {cardItems}
        </ScrollView>
      )}
    </View>
  )
}
