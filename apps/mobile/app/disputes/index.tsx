import { useState } from 'react'
import { View } from 'react-native'
import { Stack } from 'expo-router'
import { useOpenDispute } from '@statman/sdk'
import { Text } from '@/components/ui/Text'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'

const TARGET_TYPES = ['ATHLETE_PROFILE', 'GAME_STAT_LINE'] as const

// Disputes & Corrections — surface 11. Submission flow (docs: "Public
// correction/dispute submission"). There's no global "all disputes" list
// endpoint yet — GET /disputes requires a specific targetType+targetId — so
// per-entity dispute history lives on that entity's own Sources/Disputes
// tab (not yet wired; see CLAUDE.md parking lot) rather than here.
export default function DisputesScreen() {
  const [targetType, setTargetType] = useState<typeof TARGET_TYPES[number]>('ATHLETE_PROFILE')
  const [targetId, setTargetId] = useState('')
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const openDispute = useOpenDispute()

  if (submitted) {
    return (
      <View className="flex-1 bg-canvas items-center justify-center p-lg gap-sm">
        <Stack.Screen options={{ headerShown: true, title: 'Disputes & Corrections' }} />
        <Text className="font-semibold text-center">Dispute submitted</Text>
        <Text variant="caption" className="text-center">A manager or admin will review it.</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-canvas p-lg gap-md">
      <Stack.Screen options={{ headerShown: true, title: 'Disputes & Corrections' }} />
      <View className="flex-row gap-sm">
        {TARGET_TYPES.map((t) => (
          <Button
            key={t}
            variant={targetType === t ? 'primary' : 'secondary'}
            size="sm"
            onPress={() => setTargetType(t)}
          >
            {t.replace(/_/g, ' ')}
          </Button>
        ))}
      </View>
      <Input placeholder="Target ID (profile or stat line id)" value={targetId} onChangeText={setTargetId} />
      <Textarea placeholder="What's wrong, and what should it be?" value={description} onChangeText={setDescription} />
      <Button
        isLoading={openDispute.isPending}
        disabled={!targetId || !description}
        onPress={async () => {
          await openDispute.mutateAsync({ targetType, targetId, description })
          setSubmitted(true)
        }}
      >
        Submit
      </Button>
    </View>
  )
}
