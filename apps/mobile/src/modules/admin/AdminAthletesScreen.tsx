import { useState } from 'react'
import { View } from 'react-native'
import { Stack } from 'expo-router'
import { Screen } from '@/shared/layout'
import { Text } from '@/shared/ui/Text'
import { Card, CardContent } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Textarea } from '@/shared/ui/Textarea'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'
import { useAuthGate } from '@/modules/auth/useAuthGate'
import { ConnectedActAsBar } from '@/modules/admin/ConnectedActAsBar'
import { setNextAdminNote } from '@/lib/adminHeaders'
import { parseBulkPlayersText } from '@/modules/admin/parseBulkPlayersText'
import { useAdminAthletes } from '@/modules/admin/useAdminAthletes'

export function AdminAthletesScreen() {
  const { isAdmin, isAuthLoading } = useAuthGate()
  const { bulkCreate, players } = useAdminAthletes()

  const [note, setNote] = useState('')
  const [bulkText, setBulkText] = useState('')

  if (!isAuthLoading && !isAdmin) {
    return (
      <Screen title="Athletes">
        <Stack.Screen options={{ headerShown: true, title: 'Admin · Athletes' }} />
        <ErrorState message="Admin access required." />
      </Screen>
    )
  }

  async function submitBulk() {
    const items = parseBulkPlayersText(bulkText)
    setNextAdminNote(note.trim() ? note.trim() : null)
    await bulkCreate.mutateAsync({ items })
  }

  return (
    <Screen scroll contentClassName="gap-md p-lg">
      <Stack.Screen options={{ headerShown: true, title: 'Admin · Athletes' }} />
      <ConnectedActAsBar />

      <Card>
        <CardContent className="gap-sm">
          <Text className="font-semibold">Bulk create players</Text>
          <Text variant="caption">One player per line: `firstName,lastName,sportSlug`</Text>
          <Input placeholder="Admin note (optional)" value={note} onChangeText={setNote} />
          <Textarea placeholder="Jayden,Rios,basketball" value={bulkText} onChangeText={setBulkText} />
          <Button isLoading={bulkCreate.isPending} disabled={!bulkText.trim()} onPress={submitBulk}>
            Create
          </Button>
          {bulkCreate.data?.data?.errors?.length ? (
            <Text variant="caption">{bulkCreate.data.data.errors.length} error(s) returned.</Text>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="gap-sm">
          <Text className="font-semibold">Recent players</Text>
          {players.isError ? <ErrorState message="Players couldn't be loaded." /> : null}
          {players.isLoading ? <LoadingState /> : null}
          {!players.isLoading && !players.isError ? (
            <View className="gap-xs">
              {(players.data?.pages?.[0]?.data ?? []).slice(0, 10).map((p: any) => (
                <Text key={p.id} variant="caption">{p.athleteProfile.firstName} {p.athleteProfile.lastName} · {p.sport.slug}</Text>
              ))}
            </View>
          ) : null}
        </CardContent>
      </Card>
    </Screen>
  )
}

