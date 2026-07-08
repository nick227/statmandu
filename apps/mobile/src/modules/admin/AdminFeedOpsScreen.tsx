import { useState } from 'react'
import { Stack } from 'expo-router'
import { Screen } from '@/shared/layout'
import { Card, CardContent } from '@/shared/ui/Card'
import { Text } from '@/shared/ui/Text'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { ErrorState } from '@/shared/ui/ErrorState'
import { useAuthGate } from '@/modules/auth/useAuthGate'
import { ConnectedActAsBar } from '@/modules/admin/ConnectedActAsBar'
import { setNextAdminNote } from '@/lib/adminHeaders'
import { useAdminFeedOps } from '@/modules/admin/useAdminFeedOps'

export function AdminFeedOpsScreen() {
  const { isAdmin, isAuthLoading } = useAuthGate()
  const { createFeedItem } = useAdminFeedOps()

  const [note, setNote] = useState('')
  const [type, setType] = useState('STAT_MILESTONE')
  const [targetType, setTargetType] = useState('ATHLETE_PROFILE')
  const [targetId, setTargetId] = useState('')
  const [summary, setSummary] = useState('')
  const [occurredAt, setOccurredAt] = useState(new Date().toISOString())

  if (!isAuthLoading && !isAdmin) {
    return (
      <Screen title="Feed Ops">
        <Stack.Screen options={{ headerShown: true, title: 'Admin · Feed' }} />
        <ErrorState message="Admin access required." />
      </Screen>
    )
  }

  async function submit() {
    setNextAdminNote(note.trim() ? note.trim() : null)
    await createFeedItem.mutateAsync({ type, targetType, targetId, summary, occurredAt })
  }

  return (
    <Screen scroll contentClassName="gap-md p-lg">
      <Stack.Screen options={{ headerShown: true, title: 'Admin · Feed' }} />
      <ConnectedActAsBar />

      <Card>
        <CardContent className="gap-sm">
          <Text className="font-semibold">Create feed item</Text>
          <Input placeholder="Admin note (optional)" value={note} onChangeText={setNote} />
          <Input placeholder="type (e.g. STAT_MILESTONE)" value={type} onChangeText={setType} autoCapitalize="characters" />
          <Input placeholder="targetType (e.g. ATHLETE_PROFILE)" value={targetType} onChangeText={setTargetType} autoCapitalize="characters" />
          <Input placeholder="targetId" value={targetId} onChangeText={setTargetId} autoCapitalize="none" />
          <Input placeholder="summary" value={summary} onChangeText={setSummary} />
          <Input placeholder="occurredAt (ISO)" value={occurredAt} onChangeText={setOccurredAt} autoCapitalize="none" />
          <Button isLoading={createFeedItem.isPending} disabled={!targetId || !summary} onPress={submit}>
            Create
          </Button>
        </CardContent>
      </Card>
    </Screen>
  )
}

