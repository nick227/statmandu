import { FlatList, View } from 'react-native'
import { Stack } from 'expo-router'
import { UserCheck } from 'lucide-react-native'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { SignInPrompt } from '@/shared/ui/SignInPrompt'
import { ConnectedClaimReviewCard } from '@/modules/moderation/ConnectedClaimReviewCard'
import { useAuthGate } from '@/modules/auth/useAuthGate'
import { useClaimsQueue } from '@/modules/moderation/useClaimsQueue'

export function ClaimsQueueScreen() {
  const { isAdmin, isAuthLoading } = useAuthGate()
  const { claims, isError, isLoading } = useClaimsQueue()

  if (!isAuthLoading && !isAdmin) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: 'Pending Claims' }} />
        <SignInPrompt message="Sign in as an admin to review claims." />
      </>
    )
  }

  return (
    <View className="flex-1 bg-canvas p-lg">
      <Stack.Screen options={{ headerShown: true, title: 'Pending Claims' }} />
      {isError ? (
        <ErrorState message="Claims couldn't be loaded." />
      ) : isLoading ? (
        <View className="gap-sm">
          {[0, 1].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
        </View>
      ) : (
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
