import { useCard, useMarkCardDownloaded } from '@statman/sdk'

export function useCardDetail(cardId: string) {
  const cardQuery = useCard(cardId)
  const markDownloaded = useMarkCardDownloaded()

  return {
    card: cardQuery.data?.data,
    isLoading: cardQuery.isLoading,
    isError: cardQuery.isError,
    markDownloaded,
  }
}
