import { View } from 'react-native'
import { Link } from 'expo-router'
import { useModerateArticle } from '@statman/sdk'
import { Button } from '@/shared/ui/Button'
import { Card, CardContent } from '@/shared/ui/Card'
import { Text } from '@/shared/ui/Text'

export interface ConnectedArticleReviewCardProps {
  articleId: string
  title: string
  byline: string
}

// Mirrors ConnectedClaimReviewCard.tsx — one-tap Approve/Reject, no reason
// sheet, matching the same review-card convention already established for
// Claims and live-game conflicts elsewhere in the app.
export function ConnectedArticleReviewCard({ articleId, title, byline }: ConnectedArticleReviewCardProps) {
  const moderate = useModerateArticle(articleId)

  return (
    <Card>
      <CardContent className="gap-sm">
        <Link href={{ pathname: '/articles/[articleId]', params: { articleId } } as never}>
          <Text className="font-semibold">{title}</Text>
        </Link>
        <Text variant="caption">By {byline}</Text>
        <View className="flex-row gap-sm">
          <Button
            size="sm"
            className="flex-1"
            isLoading={moderate.isPending}
            onPress={() => moderate.mutate({ status: 'PUBLISHED' })}
          >
            Approve
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            isLoading={moderate.isPending}
            onPress={() => moderate.mutate({ status: 'REJECTED' })}
          >
            Reject
          </Button>
        </View>
      </CardContent>
    </Card>
  )
}
