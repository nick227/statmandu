import { FlatList, View } from 'react-native'
import { UserCheck } from 'lucide-react-native'
import { useClaims, useReviewClaim } from '@statman/sdk'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'

// Claims & Verification (admin side) — surface 10. Athlete-facing claim
// request flow lives on the player page instead (app/players/[playerId]/claim.tsx).
export default function ClaimsQueueScreen() {
  const { data, isLoading } = useClaims({ status: 'PENDING' })

  return (
    <View className="flex-1 bg-canvas p-lg">
      <Text variant="entityName" className="text-2xl pb-md">Pending Claims</Text>
      {isLoading ? null : (
        <FlatList
          data={data?.data ?? []}
          keyExtractor={(c) => c.id}
          contentContainerClassName="gap-sm pb-xxl"
          renderItem={({ item }) => <ClaimRow claimId={item.id} note={item.verificationNote} />}
          ListEmptyComponent={<EmptyState icon={UserCheck} title="No pending claims" />}
        />
      )}
    </View>
  )
}

function ClaimRow({ claimId, note }: { claimId: string; note?: string | null }) {
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
