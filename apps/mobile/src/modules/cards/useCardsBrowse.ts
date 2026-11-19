import { useMemo, useState } from 'react'
import { useMyCards, useMyCardSaves, useRecentCards } from '@statman/sdk'
import { isLimitedEdition } from '@/modules/cards/cardDisplay'

export type CardsBrowseTab = 'featured' | 'new' | 'popular' | 'collections'
export type CardsBrowseFilter = 'all' | 'limited' | 'PROFILE' | 'BIG_GAME' | 'MILESTONE' | 'SEASON' | 'HIGHLIGHT'

export const CARDS_BROWSE_TABS: { key: CardsBrowseTab; label: string }[] = [
  { key: 'featured', label: 'Featured' },
  { key: 'new', label: 'New' },
  { key: 'popular', label: 'Popular' },
  { key: 'collections', label: 'Collections' },
]

export const CARDS_BROWSE_FILTERS: { key: CardsBrowseFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'limited', label: 'Limited' },
  { key: 'PROFILE', label: 'Profile' },
  { key: 'BIG_GAME', label: 'Game' },
  { key: 'MILESTONE', label: 'Milestone' },
  { key: 'SEASON', label: 'Season' },
  { key: 'HIGHLIGHT', label: 'Highlight' },
]

// Featured/New/Popular/Collections — the site's card discovery surface.
// New and Popular are real server-driven views (sort=recent vs
// sort=popular, added specifically for this page); Featured reuses the
// popular view filtered to limited editions (the drops actually getting
// traction, not a fabricated curation flag); Collections is the signed-in
// user's own claimed + saved cards, not part of the public catalog at all.
export function useCardsBrowse(isAuthenticated: boolean, initialTab: CardsBrowseTab = 'new') {
  const [tab, setTab] = useState<CardsBrowseTab>(initialTab)
  const [filter, setFilter] = useState<CardsBrowseFilter>('all')

  const newQuery = useRecentCards()
  const popularQuery = useRecentCards('popular')
  const minePastQuery = useMyCards({ enabled: isAuthenticated })
  const savesQuery = useMyCardSaves({ enabled: isAuthenticated })

  const sourceCards = useMemo(() => {
    if (tab === 'new') return newQuery.data?.data ?? []
    if (tab === 'popular') return popularQuery.data?.data ?? []
    if (tab === 'featured') return (popularQuery.data?.data ?? []).filter(isLimitedEdition)
    return []
  }, [tab, newQuery.data, popularQuery.data])

  const filtered = useMemo(() => {
    if (filter === 'all') return sourceCards
    if (filter === 'limited') return sourceCards.filter(isLimitedEdition)
    return sourceCards.filter((card) => card.cardType === filter)
  }, [sourceCards, filter])

  const claimedCards = (minePastQuery.data?.data.claimed ?? []).map((entry) => ({
    ...entry.card,
    currentUserHasClaimed: true,
    currentUserIssue: entry.issue,
  }))
  const savedCards = (savesQuery.data?.data ?? []).map((s) => s.card).filter((c): c is NonNullable<typeof c> => Boolean(c))

  const isLoading = tab === 'collections' ? minePastQuery.isLoading || savesQuery.isLoading : tab === 'new' ? newQuery.isLoading : popularQuery.isLoading
  const isError = tab === 'collections' ? minePastQuery.isError || savesQuery.isError : tab === 'new' ? newQuery.isError : popularQuery.isError

  return {
    tab,
    setTab,
    filter,
    setFilter,
    cards: filtered,
    featured: tab !== 'collections' ? (filtered[0] ?? null) : null,
    rest: tab !== 'collections' ? filtered.slice(1) : [],
    claimedCards,
    savedCards,
    isLoading,
    isError,
  }
}
