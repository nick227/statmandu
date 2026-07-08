import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiClient, ApiError } from '../client'

type ArticleListParams = {
  q?: string
  keyword?: string
  authorUserId?: string
  limit?: number
}

export function useArticles(params?: ArticleListParams) {
  return useInfiniteQuery({
    queryKey: ['articles', params],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const { data, error, response } = await getApiClient().GET('/articles', {
        params: { query: { ...params, cursor: pageParam } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor ?? undefined,
  })
}

export function useArticle(articleId: string) {
  return useQuery({
    queryKey: ['article', articleId],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/articles/{articleId}', {
        params: { path: { articleId } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    enabled: Boolean(articleId),
  })
}

export function useCreateArticle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: { title: string; body: string; keywords?: string[] }) => {
      const { data, error, response } = await getApiClient().POST('/articles', { body: body as any })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] })
    },
  })
}

export function useUpdateArticle(articleId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: { title?: string; body?: string; keywords?: string[] }) => {
      const { data, error, response } = await getApiClient().PATCH('/articles/{articleId}', {
        params: { path: { articleId } },
        body: body as any,
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article', articleId] })
      queryClient.invalidateQueries({ queryKey: ['articles'] })
    },
  })
}

export function useSubmitArticle(articleId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data, error, response } = await getApiClient().POST('/articles/{articleId}/submit', {
        params: { path: { articleId } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article', articleId] })
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      queryClient.invalidateQueries({ queryKey: ['articles-review'] })
    },
  })
}

export function useArticlesForReview(params?: { status?: string }) {
  return useQuery({
    queryKey: ['articles-review', params],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/articles/review', {
        params: { query: params as any },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
  })
}

export function useModerateArticle(articleId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: { status: 'PUBLISHED' | 'REJECTED'; rejectionNote?: string }) => {
      const { data, error, response } = await getApiClient().PATCH('/articles/{articleId}/review', {
        params: { path: { articleId } },
        body: body as any,
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article', articleId] })
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      queryClient.invalidateQueries({ queryKey: ['articles-review'] })
    },
  })
}
