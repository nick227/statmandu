import { useState } from 'react'
import { View } from 'react-native'
import { Stack } from 'expo-router'
import { Screen } from '@/shared/layout'
import { Text } from '@/shared/ui/Text'
import { Card, CardContent } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'
import { Textarea } from '@/shared/ui/Textarea'
import { Button } from '@/shared/ui/Button'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'
import { useAuthGate } from '@/modules/auth/useAuthGate'
import { ConnectedActAsBar } from '@/modules/admin/ConnectedActAsBar'
import { setNextAdminNote } from '@/lib/adminHeaders'
import { useAdminTeams } from '@/modules/admin/useAdminTeams'

export function AdminTeamsScreen() {
  const { isAdmin, isAuthLoading } = useAuthGate()

  const [teamId, setTeamId] = useState('')
  const [note, setNote] = useState('')
  const [bulkText, setBulkText] = useState('')

  const { teams, bulkAdd } = useAdminTeams(teamId)

  if (!isAuthLoading && !isAdmin) {
    return (
      <Screen title="Teams">
        <Stack.Screen options={{ headerShown: true, title: 'Admin · Teams' }} />
        <ErrorState message="Admin access required." />
      </Screen>
    )
  }

  async function submitBulk() {
    const items = bulkText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        const [playerId, seasonId, jerseyNumber] = line.split(',').map((p) => p.trim())
        if (!playerId || !seasonId) throw new Error('Each line must be: playerId,seasonId[,jerseyNumber]')
        return { playerId, seasonId, jerseyNumber: jerseyNumber ? Number(jerseyNumber) : undefined }
      })

    setNextAdminNote(note.trim() ? note.trim() : null)
    await bulkAdd.mutateAsync({ items })
  }

  return (
    <Screen scroll contentClassName="gap-md p-lg">
      <Stack.Screen options={{ headerShown: true, title: 'Admin · Teams' }} />
      <ConnectedActAsBar />

      <Card>
        <CardContent className="gap-sm">
          <Text className="font-semibold">Bulk roster import</Text>
          <Input placeholder="Team ID" value={teamId} onChangeText={setTeamId} autoCapitalize="none" />
          <Input placeholder="Admin note (optional)" value={note} onChangeText={setNote} />
          <Text variant="caption">One membership per line: `playerId,seasonId[,jerseyNumber]`</Text>
          <Textarea placeholder="playerId,seasonId,12" value={bulkText} onChangeText={setBulkText} />
          <Button isLoading={bulkAdd.isPending} disabled={!teamId.trim() || !bulkText.trim()} onPress={submitBulk}>
            Add to roster
          </Button>
          {bulkAdd.data?.data?.errors?.length ? (
            <Text variant="caption">{bulkAdd.data.data.errors.length} error(s) returned.</Text>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="gap-sm">
          <Text className="font-semibold">Teams</Text>
          {teams.isError ? <ErrorState message="Teams couldn't be loaded." /> : null}
          {teams.isLoading ? <LoadingState /> : null}
          {!teams.isLoading && !teams.isError ? (
            <View className="gap-xs">
              {(teams.data?.data ?? []).map((t: any) => (
                <Text key={t.id} variant="caption">{t.name} · id={t.id}</Text>
              ))}
            </View>
          ) : null}
        </CardContent>
      </Card>
    </Screen>
  )
}

