import { useState } from 'react'
import { View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useClaimPlayer } from '@statman/sdk'
import { Text } from '@/components/ui/Text'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'

// Part of surface 10 (Claims & Verification) — request flow. Review/approve
// is the admin side, at app/claims/index.tsx.
export default function ClaimPlayerScreen() {
  const { playerId } = useLocalSearchParams<{ playerId: string }>()
  const router = useRouter()
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const claim = useClaimPlayer(playerId)

  if (submitted) {
    return (
      <View className="flex-1 bg-canvas items-center justify-center p-lg gap-sm">
        <Text className="font-semibold text-center">Claim submitted</Text>
        <Text variant="caption" className="text-center">An admin will review your request.</Text>
        <Button variant="secondary" onPress={() => router.back()}>Done</Button>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-canvas p-lg gap-md">
      <Text variant="entityName" className="text-2xl">Claim this profile</Text>
      <Text variant="caption">Tell us why this profile is yours. An admin reviews every claim before it's approved.</Text>
      <Textarea placeholder="e.g. I am this athlete, here's how to verify..." value={note} onChangeText={setNote} />
      <Button
        isLoading={claim.isPending}
        onPress={async () => {
          await claim.mutateAsync({ verificationNote: note || undefined })
          setSubmitted(true)
        }}
      >
        Submit Claim
      </Button>
    </View>
  )
}
