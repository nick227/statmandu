import { View } from 'react-native'
import { useReviewClaim } from '@statman/sdk'
import { Button } from '@/shared/ui/Button'
import { Card, CardContent } from '@/shared/ui/Card'
import { Text } from '@/shared/ui/Text'

export interface ConnectedClaimReviewCardProps {
  claimId: string
  note?: string | null
}

export function ConnectedClaimReviewCard({ claimId, note }: ConnectedClaimReviewCardProps) {
  const review = useReviewClaim(claimId)

  return (
    <Card>
      <CardContent className="gap-sm">
        {note ? <Text>{note}</Text> : <Text variant="caption">No note provided.</Text>}
        <View className="flex-row gap-sm">
          <Button
            size="sm"
            className="flex-1"
            isLoading={review.isPending}
            onPress={() => review.mutate({ status: 'APPROVED' })}
          >
            Approve
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            isLoading={review.isPending}
            onPress={() => review.mutate({ status: 'REJECTED' })}
          >
            Reject
          </Button>
        </View>
      </CardContent>
    </Card>
  )
}
