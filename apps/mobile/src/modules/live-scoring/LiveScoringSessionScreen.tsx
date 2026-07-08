import { useRef, useState } from 'react'
import { Alert, Pressable, View } from 'react-native'
import { Link, Stack } from 'expo-router'
import type GorhomBottomSheet from '@gorhom/bottom-sheet'
import { getSportDefinition } from '@statman/sports'
import type { components } from '@statman/sdk'
import { Text } from '@/shared/ui/Text'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { Avatar } from '@/shared/ui/Avatar'
import { LoadingState } from '@/shared/ui/LoadingState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { SignInPrompt } from '@/shared/ui/SignInPrompt'
import { Sheet } from '@/shared/ui/Sheet'
import { GameScoreboardCard } from '@/modules/games/GameScoreboardCard'
import { ConnectedConflictQueue } from '@/modules/live-scoring/ConnectedConflictQueue'
import { SyncStatusBar } from '@/modules/live-scoring/SyncStatusBar'
import { ReporterPresencePill } from '@/modules/live-scoring/ReporterPresencePill'
import { PlayerSwitchSheet } from '@/modules/live-scoring/PlayerSwitchSheet'
import { SubstitutionPicker } from '@/modules/live-scoring/SubstitutionPicker'
import { LIVE_SCORING_ROLES, useLiveScoringSession } from '@/modules/live-scoring/useLiveScoringSession'
import { useAuthGate } from '@/modules/auth/useAuthGate'
import { SportEventPad } from '@/modules/sports'

type GameEventType = components['schemas']['GameEventType']
type SheetView = 'players' | 'substitution' | 'conflicts' | null

export function LiveScoringSessionScreen({ gameId }: { gameId: string }) {
  const session = useLiveScoringSession(gameId)
  const { isAuthenticated, isAuthLoading } = useAuthGate()
  const sheetRef = useRef<GorhomBottomSheet>(null)
  const [sheetView, setSheetView] = useState<SheetView>(null)

  if (!isAuthLoading && !isAuthenticated) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: 'Live Capture' }} />
        <SignInPrompt message="Sign in to enter stats for this game." />
      </>
    )
  }

  if (session.isError) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: 'Live Capture' }} />
        <ErrorState message="This game couldn't be loaded." />
      </>
    )
  }

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
    dismissQueuedEvent,
    finalize,
    game,
    homeTeam,
    isManager,
    join,
    joinedRole,
    joinAsRole,
    lastEventId,
    mode,
    openConflictCount,
    queue,
    reporterCount,
    retrySync,
    roster,
    score,
    selectedPlayerId,
    selectedTeamId,
    selectTeam,
    setMode,
    setSelectedPlayerId,
    startLive,
    submitEvent,
    suggestedEventTypes,
    undoEvent,
    undoLastEvent,
  } = session

  function finalizeWithWarning() {
    if (openConflictCount > 0) {
      Alert.alert(
        'Unresolved conflicts',
        `${openConflictCount} conflict${openConflictCount === 1 ? '' : 's'} still need${openConflictCount === 1 ? 's' : ''} a decision. Finalizing now will record any unresolved lines as disputed. Finalize anyway?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Finalize Anyway', style: 'destructive', onPress: () => finalize.mutate() },
        ]
      )
      return
    }
    finalize.mutate()
  }

  if (!joinedRole) {
    return (
      <View className="flex-1 bg-canvas p-lg gap-md">
        <Stack.Screen options={{ headerShown: true, title: 'Live Capture' }} />
        <Text className="text-2xl font-bold">Join as...</Text>
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
        <View className="flex-row gap-sm pt-md border-t border-border mt-sm">
          <Button
            variant={mode === 'live' ? 'primary' : 'secondary'}
            size="sm"
            className="flex-1"
            onPress={() => setMode('live')}
          >
            Live Now
          </Button>
          <Button
            variant={mode === 'catchUp' ? 'primary' : 'secondary'}
            size="sm"
            className="flex-1"
            onPress={() => setMode('catchUp')}
          >
            Catch-Up Entry
          </Button>
        </View>
        {mode === 'catchUp' ? (
          <Text variant="caption">
            Catch-up mode is for logging plays that already happened on an already-live game (e.g. joining after
            tip-off) — timestamps are spaced automatically so play order stays correct even if you pause mid-batch.
          </Text>
        ) : null}
      </View>
    )
  }

  const sport = game.sport?.slug ?? 'basketball'
  const definition = getSportDefinition(sport)
  const activePlayer = roster.find((m) => m.player.id === selectedPlayerId)
  const activePlayerName = activePlayer
    ? `${activePlayer.player.athleteProfile.firstName} ${activePlayer.player.athleteProfile.lastName}`
    : selectedTeamId
      ? 'Select a player'
      : 'Select a team first'
  const canCast = isManager || joinedRole === 'BROADCASTER'

  function openSheet(view: Exclude<SheetView, null>) {
    setSheetView(view)
    requestAnimationFrame(() => sheetRef.current?.snapToIndex(0))
  }

  function closeSheet() {
    sheetRef.current?.close()
  }

  function handleEventTap(type: GameEventType) {
    const eventDefinition = definition.events[type]
    if (eventDefinition?.confirmationMode === 'detail' && eventDefinition.requiresSecondaryPlayer) {
      openSheet('substitution')
      return
    }
    submitEvent(type)
  }

  async function handleSubstitution(outgoingPlayerId: string, incomingPlayerId: string) {
    await submitEvent('SUBSTITUTION_OUT' as GameEventType, outgoingPlayerId)
    await submitEvent('SUBSTITUTION_IN' as GameEventType, incomingPlayerId)
    closeSheet()
  }

  return (
    <View className="flex-1 bg-canvas">
      <Stack.Screen options={{ headerShown: true, title: 'Live Capture' }} />

      <View className="px-lg pt-sm gap-xs">
        <View className="flex-row items-center justify-between">
          <ReporterPresencePill count={reporterCount} />
        </View>
        <GameScoreboardCard game={game} liveScoreByTeamId={score} />
        <SyncStatusBar queue={queue} onRetry={retrySync} onDismiss={dismissQueuedEvent} className="py-0" />
      </View>

      {game.status === 'SCHEDULED' ? (
        <Button className="mx-lg my-sm" isLoading={startLive.isPending} onPress={() => startLive.mutate()}>
          Start Live Game
        </Button>
      ) : null}

      <View className="flex-row gap-sm px-lg pt-sm">
        {[homeTeam, awayTeam].map((team) => team && (
          <Pressable
            key={team.id}
            onPress={() => selectTeam(team.id)}
            className={`flex-1 rounded-md border py-xs items-center ${selectedTeamId === team.id ? 'border-sport-accent bg-sport-accent/10' : 'border-border'}`}
          >
            <Text className="font-semibold" numberOfLines={1}>{team.name}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={() => selectedTeamId && openSheet('players')}
        disabled={!selectedTeamId}
        className={`flex-row items-center gap-sm mx-lg my-sm px-md py-sm rounded-md border border-border bg-surface active:opacity-70 ${!selectedTeamId ? 'opacity-40' : ''}`}
      >
        {activePlayer ? <Avatar uri={activePlayer.player.athleteProfile.avatarUrl} fallback={activePlayerName} size="sm" /> : null}
        <Text className="flex-1 font-semibold" numberOfLines={1}>{activePlayerName}</Text>
        <Text variant="caption">Switch</Text>
      </Pressable>

      <SportEventPad
        sport={sport}
        disabled={!selectedPlayerId}
        suggestedEventTypes={suggestedEventTypes}
        onEvent={handleEventTap}
        className="flex-1 px-lg"
      />

      {isManager && openConflictCount > 0 ? (
        <Pressable onPress={() => openSheet('conflicts')} className="mx-lg mb-sm self-start">
          <Badge tone="dispute">{`${openConflictCount} conflict${openConflictCount === 1 ? '' : 's'} — review`}</Badge>
        </Pressable>
      ) : null}

      <View className="flex-row gap-sm px-lg pb-md">
        <Button variant="secondary" className="flex-1" disabled={!lastEventId} isLoading={undoEvent.isPending} onPress={undoLastEvent}>
          Undo Last
        </Button>
        {canCast ? (
          <Link href={{ pathname: '/games/[gameId]/broadcast', params: { gameId: game.id } }} asChild>
            <Button variant="secondary" className="flex-1">Cast to Display</Button>
          </Link>
        ) : null}
        {isManager ? (
          <Button variant="destructive" className="flex-1" isLoading={finalize.isPending} onPress={finalizeWithWarning}>
            {`Finalize${openConflictCount > 0 ? ` (${openConflictCount})` : ''}`}
          </Button>
        ) : null}
      </View>

      <Sheet ref={sheetRef} snaps={['half', 'expanded']} index={-1} onChange={(index) => { if (index === -1) setSheetView(null) }}>
        {sheetView === 'players' ? (
          <PlayerSwitchSheet
            roster={roster}
            selectedPlayerId={selectedPlayerId}
            onSelect={(playerId) => {
              setSelectedPlayerId(playerId)
              closeSheet()
            }}
          />
        ) : null}
        {sheetView === 'substitution' ? (
          <SubstitutionPicker roster={roster} onComplete={handleSubstitution} onCancel={closeSheet} />
        ) : null}
        {sheetView === 'conflicts' ? <ConnectedConflictQueue gameId={game.id} className="gap-md px-lg pt-sm" /> : null}
      </Sheet>
    </View>
  )
}
