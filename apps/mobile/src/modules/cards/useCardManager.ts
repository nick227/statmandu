import { useMyCards } from '@statman/sdk'

export function useCardManager() {
  const query = useMyCards()
  return {
    createdCards: query.data?.data.created ?? [],
    claimedCards: query.data?.data.claimed ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  }
}

