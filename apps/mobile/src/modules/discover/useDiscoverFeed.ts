import { useMemo, useState } from 'react'
import { usePeople, useRecentCards, useSearch, type components } from '@statman/sdk'
import { isLimitedEdition } from '@/modules/cards/cardDisplay'

export type Card = components['schemas']['Card']
export type PersonProfile = components['schemas']['PersonProfile']

export const DISCOVER_CATEGORIES = [
  'All',
  'Music',
  'Film',
  'Art',
  'Comedy',
  'Gaming',
  'Science',
  'Business',
  'Sports',
] as const

export type DiscoverCategory = (typeof DISCOVER_CATEGORIES)[number]

function cardMatchesCategory(card: Card, category: DiscoverCategory): boolean {
  if (category === 'All') return true
  if (category === 'Sports') {
    return Boolean(card.teamId || card.gameId || card.team || card.athlete?.teamName)
  }
  // No backend pursuit schema exists yet (scheduled for MR4); do not infer pursuits from text.
  return false
}

function personMatchesCategory(_person: PersonProfile, category: DiscoverCategory): boolean {
  if (category === 'All') return true
  // No backend pursuit schema exists yet on PersonProfile; do not infer from text.
  return false
}

export function useDiscoverFeed() {
  const [selectedCategory, setSelectedCategory] = useState<DiscoverCategory>('All')
  const [searchQuery, setSearchQuery] = useState('')

  const popularQuery = useRecentCards('popular')
  const recentQuery = useRecentCards('recent')
  const peopleQuery = usePeople()
  const searchApiQuery = useSearch({ q: searchQuery })

  const rawPopular = popularQuery.data?.data ?? []
  const rawRecent = recentQuery.data?.data ?? []
  const rawPeople = peopleQuery.data?.data ?? []

  // Featured collectible releases: prioritize limited editions
  const featuredCards = useMemo(() => {
    const limited = rawPopular.filter(isLimitedEdition)
    return limited.length > 0 ? limited : rawPopular
  }, [rawPopular])

  // Filtered by selected category
  const filteredFeatured = useMemo(() => {
    return featuredCards.filter((card) => cardMatchesCategory(card, selectedCategory))
  }, [featuredCards, selectedCategory])

  const filteredRecent = useMemo(() => {
    return rawRecent.filter((card) => cardMatchesCategory(card, selectedCategory))
  }, [rawRecent, selectedCategory])

  const filteredPeople = useMemo(() => {
    return rawPeople.filter((person) => personMatchesCategory(person, selectedCategory))
  }, [rawPeople, selectedCategory])

  // Live client-side search across cards and people
  const isSearching = searchQuery.trim().length > 0

  const searchCards = useMemo(() => {
    if (!isSearching) return []
    const q = searchQuery.toLowerCase().trim()
    const allCards = Array.from(new Map([...rawPopular, ...rawRecent].map((c) => [c.id, c])).values())
    return allCards.filter((card) => {
      const matchTitle = card.title.toLowerCase().includes(q)
      const matchSubject = (card.athlete?.displayName ?? '').toLowerCase().includes(q)
      const matchCreator = card.createdByUserId.toLowerCase().includes(q)
      return matchTitle || matchSubject || matchCreator
    })
  }, [isSearching, rawPopular, rawRecent, searchQuery])

  const searchPeople = useMemo(() => {
    if (!isSearching) return []
    const q = searchQuery.toLowerCase().trim()
    return rawPeople.filter((p) => {
      const matchName = p.displayName.toLowerCase().includes(q)
      const matchBio = (p.bio ?? '').toLowerCase().includes(q)
      const matchAlias = (p.aliases ?? []).some((a) => a.toLowerCase().includes(q))
      return matchName || matchBio || matchAlias
    })
  }, [isSearching, rawPeople, searchQuery])

  const isLoading = popularQuery.isLoading || recentQuery.isLoading || peopleQuery.isLoading
  const isError = popularQuery.isError && recentQuery.isError

  return {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    isSearching,
    searchCards,
    searchPeople,
    featuredCards: filteredFeatured,
    newCards: filteredRecent,
    people: filteredPeople,
    totalCardsCount: rawRecent.length,
    isLoading,
    isError,
    refetch: () => {
      void popularQuery.refetch()
      void recentQuery.refetch()
      void peopleQuery.refetch()
    },
  }
}
