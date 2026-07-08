import { View } from 'react-native'
import { Stack } from 'expo-router'
import { Text } from '@/shared/ui/Text'
import { Input } from '@/shared/ui/Input'
import { Textarea } from '@/shared/ui/Textarea'
import { Button } from '@/shared/ui/Button'
import { SignInPrompt } from '@/shared/ui/SignInPrompt'
import { useAuthGate } from '@/modules/auth/useAuthGate'
import { useDisputeForm } from '@/modules/disputes/useDisputeForm'

export function DisputesScreen() {
  const { isAuthenticated, isAuthLoading } = useAuthGate()
  const {
    description,
    openDispute,
    setDescription,
    setTargetId,
    setTargetType,
    submitted,
    submitDispute,
    targetId,
    targetType,
    targetTypes,
  } = useDisputeForm()

  if (!isAuthLoading && !isAuthenticated) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: 'Disputes & Corrections' }} />
        <SignInPrompt message="Sign in to submit a dispute." />
      </>
    )
  }

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
        {targetTypes.map((t) => (
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
        onPress={submitDispute}
      >
        Submit
      </Button>
    </View>
  )
}
