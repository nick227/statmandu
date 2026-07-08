import { Image, View } from 'react-native'
import { Link, Stack } from 'expo-router'
import { Badge } from '@/shared/ui/Badge'
import { Text } from '@/shared/ui/Text'
import { ErrorScreenState, LoadingScreenState, PageFrame, Screen } from '@/shared/layout'
import { articleStatusColor } from '@/lib/theme'
import { useAuthGate } from '@/modules/auth/useAuthGate'
import { useArticleReader } from '@/modules/articles/useArticleReader'

function formatDate(value?: string | null) {
  if (!value) return null
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function ArticleReaderScreen({ articleId }: { articleId: string }) {
  const { article, isLoading, isError } = useArticleReader(articleId)
  const { user } = useAuthGate()

  if (isError) return <ErrorScreenState withBack message="This article couldn't be loaded." />
  if (isLoading || !article) return <LoadingScreenState withBack />

  const isOwner = user?.id === article.authorUserId
  const keywords = article.keywords ?? []
  const kicker = keywords[0]
  const byline = article.author.displayName ?? article.author.username ?? 'Unknown author'
  const publishedLabel = formatDate(article.publishedAt)
  const isUnpublished = article.status !== 'PUBLISHED'

  return (
    <Screen scroll>
      <Stack.Screen options={{ headerShown: true, title: article.title }} />
      <PageFrame
        main={
          <View className="gap-md pb-xxl">
            {article.thumbnailUrl ? (
              <Image
                source={{ uri: article.thumbnailUrl }}
                className="w-full rounded-lg"
                style={{ aspectRatio: 16 / 9 }}
                resizeMode="cover"
                accessibilityLabel={article.title}
              />
            ) : null}

            {isUnpublished ? (
              <View className="flex-row items-center gap-sm">
                <Badge tone={articleStatusColor(article.status)}>
                  {article.status === 'PENDING_REVIEW' ? 'In Review' : article.status === 'REJECTED' ? 'Not Published' : article.status}
                </Badge>
                {isOwner ? (
                  <Link href={{ pathname: '/articles/[articleId]/edit', params: { articleId: article.id } } as never}>
                    <Text variant="caption" className="text-brand">Edit</Text>
                  </Link>
                ) : null}
              </View>
            ) : null}

            {article.status === 'REJECTED' && article.rejectionNote && isOwner ? (
              <View className="gap-xs rounded-md border border-border bg-surface p-md">
                <Text variant="statLabel">Feedback from review</Text>
                <Text variant="caption">{article.rejectionNote}</Text>
              </View>
            ) : null}

            {kicker ? <Text variant="kicker">{kicker}</Text> : null}
            <Text variant="articleTitle">{article.title}</Text>
            <Text variant="caption">
              By {byline}{publishedLabel ? ` · ${publishedLabel}` : ''}
            </Text>

            <Text variant="articleBody" style={{ maxWidth: 640 }}>{article.body}</Text>

            {keywords.length > 0 ? (
              <View className="flex-row flex-wrap gap-xs pt-sm">
                {keywords.map((keyword) => (
                  <Badge key={keyword} tone="muted-text">{keyword}</Badge>
                ))}
              </View>
            ) : null}
          </View>
        }
      />
    </Screen>
  )
}
