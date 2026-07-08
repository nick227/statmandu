import { useArticles } from '@statman/sdk'

// Public reading feed — PUBLISHED articles only (the SDK/service default when
// no authorUserId is passed). Also reused for an author's own article history
// by passing authorUserId, see MyArticlesScreen.
export function useArticlesFeed(params?: { authorUserId?: string; q?: string }) {
  const query = useArticles(params)
  return {
    articles: query.data?.pages.flatMap((page) => page.data) ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
  }
}
