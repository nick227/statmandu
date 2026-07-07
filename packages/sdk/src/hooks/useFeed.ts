import { useInfiniteQuery } from '@tanstack/react-query'
import { getApiClient, ApiError } from '../client'

export function useFeed() {
  return useInfiniteQuery({
    queryKey: ['feed'],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const { data, error, response } = await getApiClient().GET('/feed', {
        params: { query: { cursor: pageParam } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor ?? undefined,
  })
}
