import { useInfiniteQuery } from '@tanstack/react-query'
import { getApiClient, ApiError } from '../client'

type SearchParams = {
  q: string
  types?: Array<'PLAYER' | 'TEAM' | 'GAME'>
  limit?: number
}

export function useSearch(params: SearchParams) {
  return useInfiniteQuery({
    queryKey: ['search', params],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const { data, error, response } = await getApiClient().GET('/search', {
        params: {
          query: {
            q: params.q,
            types: params.types?.join(','),
            limit: params.limit,
            cursor: pageParam,
          },
        },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor ?? undefined,
    enabled: params.q.length > 0,
  })
}
