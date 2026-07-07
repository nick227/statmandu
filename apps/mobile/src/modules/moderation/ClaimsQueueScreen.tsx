import { FlatList, View } from 'react-native'
import { Stack } from 'expo-router'
import { UserCheck } from 'lucide-react-native'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ConnectedClaimReviewCard } from '@/modules/moderation/ConnectedClaimReviewCard'
import { useClaimsQueue } from '@/modules/moderation/useClaimsQueue'

export function ClaimsQueueScreen() {
  const { claims, isLoading } = useClaimsQueue()

  return (
    <View className="flex-1 bg-canvas p-lg">
      <Stack.Screen options={{ headerShown: true, title: 'Pending Claims' }} />
      {isLoading ? null : (
        <FlatList
          data={claims}
          keyExtractor={(c) => c.id}
          contentContainerClassName="gap-sm pb-xxl"
          renderItem={({ item }) => <ConnectedClaimReviewCard claimId={item.id} note={item.verificationNote} />}
          ListEmptyComponent={<EmptyState icon={UserCheck} title="No pending claims" />}
        />
      )}
    </View>
  )
}
