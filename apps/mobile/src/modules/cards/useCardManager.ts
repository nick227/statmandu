import { useMyCards } from '@statman/sdk'

export function useCardManager(enabled = true) {
  const query = useMyCards({ enabled })
  return {
    createdCards: query.data?.data.created ?? [],
    claimedCards: query.data?.data.claimed ?? [],
    isLoading: enabled && query.isLoading,
    isError: enabled && query.isError,
    refetch: query.refetch,
  }
}
