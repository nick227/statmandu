import { Pressable, ScrollView, View } from 'react-native'
import { Stack } from 'expo-router'
import { Text } from '@/shared/ui/Text'
import { Button } from '@/shared/ui/Button'
import { LoadingState } from '@/shared/ui/LoadingState'
import { GameScoreboardCard } from '@/modules/games/GameScoreboardCard'
import { BasketballLiveEventPad, type BasketballLiveEventType } from '@/modules/live-scoring/BasketballLiveEventPad'
import { LIVE_SCORING_ROLES, useLiveScoringSession } from '@/modules/live-scoring/useLiveScoringSession'

export function LiveScoringSessionScreen({ gameId }: { gameId: string }) {
  const session = useLiveScoringSession(gameId)

  if (session.isLoading || !session.game) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: 'Live Capture' }} />
        <LoadingState />
      </>
    )
  }

  const {
    awayTeam,
    finalize,
    game,
    homeTeam,
    join,
    joinedRole,
    joinAsRole,
    lastEventId,
    roster,
    score,
    selectedPlayerId,
    selectedTeamId,
    selectTeam,
    setSelectedPlayerId,
    startLive,
    submitEvent,
    submitEventMutation,
    undoEvent,
    undoLastEvent,
  } = session

  if (!joinedRole) {
    return (
      <View className="flex-1 bg-canvas p-lg gap-md">
        <Stack.Screen options={{ headerShown: true, title: 'Live Capture' }} />
        <Text variant="entityName" className="text-2xl">Join as...</Text>
        {LIVE_SCORING_ROLES.map((role) => (
          <Button
            key={role}
            variant="secondary"
            isLoading={join.isPending}
            onPress={() => joinAsRole(role)}
          >
            {role.replace(/_/g, ' ')}
          </Button>
        ))}
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-canvas" contentContainerClassName="pb-xxl">
      <Stack.Screen options={{ headerShown: true, title: 'Live Capture' }} />
      <GameScoreboardCard game={game} liveScoreByTeamId={score} />

      {game.status === 'SCHEDULED' ? (
        <Button className="mx-lg mb-md" isLoading={startLive.isPending} onPress={() => startLive.mutate()}>
          Start Live Game
        </Button>
      ) : null}

      <View className="flex-row gap-sm px-lg pb-md">
        {[homeTeam, awayTeam].map((team) => team && (
          <Pressable
            key={team.id}
            onPress={() => selectTeam(team.id)}
            className={`flex-1 rounded-md border p-sm items-center ${selectedTeamId === team.id ? 'border-brand bg-brand/10' : 'border-border'}`}
          >
            <Text className="font-semibold">{team.name}</Text>
          </Pressable>
        ))}
      </View>

      {selectedTeamId ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-sm px-lg pb-md">
          {roster.map((m) => (
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

      <BasketballLiveEventPad
        disabled={!selectedPlayerId || submitEventMutation.isPending}
        onEvent={async (type: BasketballLiveEventType) => {
          if (!selectedPlayerId || !selectedTeamId) return
          await submitEvent(type)
        }}
        className="px-lg"
      />

      <View className="flex-row gap-sm px-lg pt-md">
        <Button
          variant="secondary"
          className="flex-1"
          disabled={!lastEventId}
          isLoading={undoEvent.isPending}
          onPress={undoLastEvent}
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
