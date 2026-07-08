import { useArticle } from '@statman/sdk'

export function useArticleReader(articleId: string) {
  const query = useArticle(articleId)
  return {
    article: query.data?.data,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}
