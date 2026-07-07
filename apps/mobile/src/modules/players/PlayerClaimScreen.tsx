import { View } from 'react-native'
import { useRouter, Stack } from 'expo-router'
import { Text } from '@/shared/ui/Text'
import { Textarea } from '@/shared/ui/Textarea'
import { Button } from '@/shared/ui/Button'
import { usePlayerClaim } from '@/modules/players/usePlayerClaim'

export function PlayerClaimScreen({ playerId }: { playerId: string }) {
  const router = useRouter()
  const { claim, note, setNote, submitted, submitClaim } = usePlayerClaim(playerId)

  if (submitted) {
    return (
      <View className="flex-1 bg-canvas items-center justify-center p-lg gap-sm">
        <Stack.Screen options={{ headerShown: true, title: 'Claim Profile' }} />
        <Text className="font-semibold text-center">Claim submitted</Text>
        <Text variant="caption" className="text-center">An admin will review your request.</Text>
        <Button variant="secondary" onPress={() => router.back()}>Done</Button>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-canvas p-lg gap-md">
      <Stack.Screen options={{ headerShown: true, title: 'Claim Profile' }} />
      <Text variant="caption">Tell us why this profile is yours. An admin reviews every claim before it's approved.</Text>
      <Textarea placeholder="e.g. I am this athlete, here's how to verify..." value={note} onChangeText={setNote} />
      <Button
        isLoading={claim.isPending}
        onPress={submitClaim}
      >
        Submit Claim
      </Button>
    </View>
  )
}
