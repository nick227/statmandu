import { useMemo, useState } from 'react'
import { useRecentCards } from '@statman/sdk'
import { isLimitedEdition } from '@/modules/cards/cardDisplay'

export type CardsBrowseFilter = 'all' | 'limited' | 'PROFILE' | 'BIG_GAME' | 'MILESTONE' | 'SEASON' | 'HIGHLIGHT'

export const CARDS_BROWSE_FILTERS: { key: CardsBrowseFilter; label: string }[] = [
  { key: 'all', label: 'Recent' },
  { key: 'limited', label: 'Limited' },
  { key: 'PROFILE', label: 'Profile' },
  { key: 'BIG_GAME', label: 'Game' },
  { key: 'MILESTONE', label: 'Milestone' },
  { key: 'SEASON', label: 'Season' },
  { key: 'HIGHLIGHT', label: 'Highlight' },
]

export function useCardsBrowse() {
  const [filter, setFilter] = useState<CardsBrowseFilter>('all')
  const cardsQuery = useRecentCards()
  const cards = cardsQuery.data?.data ?? []

  const filtered = useMemo(() => {
    if (filter === 'all') return cards
    if (filter === 'limited') return cards.filter(isLimitedEdition)
    return cards.filter((card) => card.cardType === filter)
  }, [cards, filter])

  return {
    filter,
    setFilter,
    cards: filtered,
    allCards: cards,
    featured: filtered[0] ?? null,
    rest: filtered.slice(1),
    isLoading: cardsQuery.isLoading,
    isError: cardsQuery.isError,
  }
}
