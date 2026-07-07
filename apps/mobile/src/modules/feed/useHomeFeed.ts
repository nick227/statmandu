import { useFeed } from '@statman/sdk'

export function useHomeFeed() {
  const feedQuery = useFeed()

  return {
    items: feedQuery.data?.pages.flatMap((p) => p.data) ?? [],
    isLoading: feedQuery.isLoading,
    fetchNextPage: feedQuery.fetchNextPage,
    hasNextPage: feedQuery.hasNextPage,
  }
}
