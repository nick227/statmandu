import { useLocalSearchParams } from 'expo-router'
import { ArticleReaderScreen } from '@/modules/articles/ArticleReaderScreen'

export default function ArticleReaderRoute() {
  const { articleId } = useLocalSearchParams<{ articleId: string }>()
  return <ArticleReaderScreen articleId={articleId} />
}
