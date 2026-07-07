import { useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { useLocalSearchParams, Stack } from 'expo-router'
import {
  useGame, useTeamRoster, useJoinGameAsReporter, useStartLiveGame,
  useSubmitGameEvent, useUndoGameEvent, useGameSnapshot, useFinalizeGame,
} from '@statman/sdk'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { GameScoreboard, LiveEventPad, type LiveEventType } from '@/components/domain'

const ROLES = ['OFFICIAL_SCORER', 'TEAM_SCORER', 'BROADCASTER', 'SPECTATOR_REPORTER'] as const

// Live Game Capture — surface 6. Scorekeeper/broadcaster stat entry mode.
// Offline queueing (26_LIVE_GAME_STAT_CAPTURE_SPEC.md) is not wired yet —
// events currently submit directly; see CLAUDE.md parking lot for the
// local-queue + sync-status follow-up.
export default function LiveCaptureScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>()
  const [joinedRole, setJoinedRole] = useState<string | null>(null)
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [lastEventId, setLastEventId] = useState<string | null>(null)

  const { data: gameRes, isLoading } = useGame(gameId)
  const homeTeam = gameRes?.data.gameTeams.find((gt) => gt.isHome)?.team
  const awayTeam = gameRes?.data.gameTeams.find((gt) => !gt.isHome)?.team
  const activeTeamSlug = selectedTeamId === homeTeam?.id ? homeTeam?.slug : awayTeam?.slug
  const { data: rosterRes } = useTeamRoster(activeTeamSlug ?? '')

  const join = useJoinGameAsReporter(gameId)
  const startLive = useStartLiveGame(gameId)
  const submitEvent = useSubmitGameEvent(gameId)
  const undoEvent = useUndoGameEvent(gameId)
  const finalize = useFinalizeGame(gameId)
  const { data: snapshot } = useGameSnapshot(gameId)

  if (isLoading || !gameRes) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <Stack.Screen options={{ headerShown: true, title: 'Live Capture' }} />
        <Spinner />
      </View>
    )
  }

  const game = gameRes.data

  if (!joinedRole) {
    return (
      <View className="flex-1 bg-canvas p-lg gap-md">
        <Stack.Screen options={{ headerShown: true, title: 'Live Capture' }} />
        <Text variant="entityName" className="text-2xl">Join as...</Text>
        {ROLES.map((role) => (
          <Button
            key={role}
            variant="secondary"
            isLoading={join.isPending}
            onPress={async () => {
              await join.mutateAsync({ role })
              setJoinedRole(role)
            }}
          >
            {role.replace(/_/g, ' ')}
          </Button>
        ))}
      </View>
    )
  }

  const score = Object.fromEntries((snapshot?.data.score ?? []).map((s) => [s.teamId, s.points]))

  return (
    <ScrollView className="flex-1 bg-canvas" contentContainerClassName="pb-xxl">
      <Stack.Screen options={{ headerShown: true, title: 'Live Capture' }} />
      <GameScoreboard game={game} liveScoreByTeamId={score} />

      {game.status === 'SCHEDULED' ? (
        <Button className="mx-lg mb-md" isLoading={startLive.isPending} onPress={() => startLive.mutate()}>
          Start Live Game
        </Button>
      ) : null}

      <View className="flex-row gap-sm px-lg pb-md">
        {[homeTeam, awayTeam].map((team) => team && (
          <Pressable
            key={team.id}
            onPress={() => { setSelectedTeamId(team.id); setSelectedPlayerId(null) }}
            className={`flex-1 rounded-md border p-sm items-center ${selectedTeamId === team.id ? 'border-brand bg-brand/10' : 'border-border'}`}
          >
            <Text className="font-semibold">{team.name}</Text>
          </Pressable>
        ))}
      </View>

      {selectedTeamId ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-sm px-lg pb-md">
          {(rosterRes?.data ?? []).map((m) => (
            <Pressable
              key={m.id}
              onPress={() => setSelectedPlayerId(m.player.id)}
              className={`rounded-md border px-md py-sm ${selectedPlayerId === m.player.id ? 'border-brand bg-brand/10' : 'border-border'}`}
            >
              <Text>#{m.jerseyNumber ?? m.player.jerseyNumber} {m.player.athleteProfile.firstName}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      <LiveEventPad
        disabled={!selectedPlayerId || submitEvent.isPending}
        onEvent={async (type: LiveEventType) => {
          if (!selectedPlayerId || !selectedTeamId) return
          const result = await submitEvent.mutateAsync({
            type,
            playerId: selectedPlayerId,
            teamId: selectedTeamId,
            clientTimestamp: new Date().toISOString(),
          })
          setLastEventId(result.data.id)
        }}
        className="px-lg"
      />

      <View className="flex-row gap-sm px-lg pt-md">
        <Button
          variant="secondary"
          className="flex-1"
          disabled={!lastEventId}
          isLoading={undoEvent.isPending}
          onPress={async () => {
            if (!lastEventId) return
            await undoEvent.mutateAsync(lastEventId)
            setLastEventId(null)
          }}
        >
          Undo Last
        </Button>
        {joinedRole === 'OFFICIAL_SCORER' ? (
          <Button
            variant="destructive"
            className="flex-1"
            isLoading={finalize.isPending}
            onPress={() => finalize.mutate()}
          >
            Finalize Game
          </Button>
        ) : null}
      </View>
    </ScrollView>
  )
}
