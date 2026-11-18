import { useAthleteCards, useCard, useMarkCardDownloaded } from '@statman/sdk'

const RELATED_CARDS_LIMIT = 6

export function useCardDetail(cardId: string) {
  const cardQuery = useCard(cardId)
  const markDownloaded = useMarkCardDownloaded()
  const card = cardQuery.data?.data

  // "More from this athlete" — reuses the same query the athlete's own
  // profile Cards tab already fetches (useAthleteCards), just filtered to
  // this card's siblings. No dedicated related-cards endpoint needed.
  const athleteCardsQuery = useAthleteCards(card?.athleteProfileId ?? '')
  const relatedCards = (athleteCardsQuery.data?.data ?? [])
    .filter((c) => c.id !== cardId && c.status === 'PUBLISHED')
    .slice(0, RELATED_CARDS_LIMIT)

  return {
    card,
    isLoading: cardQuery.isLoading,
    isError: cardQuery.isError,
    markDownloaded,
    relatedCards,
  }
}

