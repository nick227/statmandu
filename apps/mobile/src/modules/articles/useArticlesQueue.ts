import { useArticlesForReview } from '@statman/sdk'

export function useArticlesQueue() {
  const articlesQuery = useArticlesForReview()

  return {
    articles: articlesQuery.data?.data ?? [],
    isLoading: articlesQuery.isLoading,
    isError: articlesQuery.isError,
  }
}
