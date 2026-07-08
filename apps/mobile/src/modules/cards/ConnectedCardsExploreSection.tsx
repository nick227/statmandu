import { useMemo, useState } from 'react'
import { Pressable, View } from 'react-native'
import { useRecentCards } from '@statman/sdk'
import { Text } from '@/shared/ui/Text'
import { ContentSection } from '@/shared/layout/ContentSection'
import { cn } from '@/lib/utils'
import { CardRail } from './CardRail'
import { isLimitedEdition } from './cardDisplay'

type FilterKey = 'all' | 'limited' | 'PROFILE' | 'BIG_GAME' | 'MILESTONE'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Recent' },
  { key: 'limited', label: 'Limited' },
  { key: 'PROFILE', label: 'Profile' },
  { key: 'BIG_GAME', label: 'Game' },
  { key: 'MILESTONE', label: 'Milestone' },
]

// Explore's card discovery module. No dedicated card search endpoint exists
// (SearchResultItem's type union is PLAYER/TEAM/GAME only, owned by the
// search workstream) — rather than extend that contract, this reuses the
// same recent-public-cards list Home's drop section fetches and filters it
// client-side. Filters kept to what the data actually supports: a
// "Verified" facet was in the original brief but CardAthleteSummary carries
// no verification field, so it's left out rather than faking it.
export function ConnectedCardsExploreSection() {
  const [filter, setFilter] = useState<FilterKey>('all')
  const cardsQuery = useRecentCards()
  const cards = cardsQuery.data?.data ?? []

  const filtered = useMemo(() => {
    if (filter === 'all') return cards
    if (filter === 'limited') return cards.filter(isLimitedEdition)
    return cards.filter((c) => c.cardType === filter)
  }, [cards, filter])

  if (cardsQuery.isLoading || cardsQuery.isError || cards.length === 0) return null

  return (
    <ContentSection title="Statman Cards" subtitle="Recently published, ready to claim.">
      <View className="flex-row flex-wrap gap-xs pb-sm">
        {FILTERS.map((f) => {
          const active = filter === f.key
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              className={cn(
                'rounded-pill border px-sm py-xs',
                active ? 'border-sport-accent bg-sport-accent' : 'border-border bg-canvas'
              )}
            >
              <Text variant="caption" className={active ? 'text-white' : undefined}>{f.label}</Text>
            </Pressable>
          )
        })}
      </View>
      {filtered.length > 0 ? (
        <CardRail cards={filtered} />
      ) : (
        <Text variant="caption">No cards match this filter yet.</Text>
      )}
    </ContentSection>
  )
}
