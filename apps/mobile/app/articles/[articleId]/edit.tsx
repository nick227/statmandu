import { useLocalSearchParams } from 'expo-router'
import { ArticleFormScreen } from '@/modules/articles/ArticleFormScreen'

export default function ArticleEditRoute() {
  const { articleId } = useLocalSearchParams<{ articleId: string }>()
  return <ArticleFormScreen articleId={articleId} />
}
