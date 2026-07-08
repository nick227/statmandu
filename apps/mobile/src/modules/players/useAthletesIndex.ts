import { useMemo } from 'react'
import { usePlayers } from '@statman/sdk'

export function useAthletesIndex() {
  const playersQuery = usePlayers({ limit: 40 })

  const athletes = useMemo(
    () => playersQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [playersQuery.data],
  )

  return {
    athletes,
    isLoading: playersQuery.isLoading,
    isError: playersQuery.isError,
    hasNextPage: playersQuery.hasNextPage,
    isFetchingNextPage: playersQuery.isFetchingNextPage,
    fetchNextPage: playersQuery.fetchNextPage,
  }
}
