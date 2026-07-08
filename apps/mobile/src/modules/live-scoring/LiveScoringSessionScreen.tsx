import { useRef, useState } from 'react'
import { Alert, Pressable, View } from 'react-native'
import { Link, Stack, useRouter } from 'expo-router'
import type GorhomBottomSheet from '@gorhom/bottom-sheet'
import { getSportDefinition } from '@statman/sports'
import { ClipboardList, Eye, Radio, Target } from 'lucide-react-native'
import type { components } from '@statman/sdk'
import { useNativeColor } from '@/lib/theme'
import { Text } from '@/shared/ui/Text'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
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
import { RecentPlaysStrip } from '@/modules/live-scoring/RecentPlaysStrip'
import { useLiveScoringSession } from '@/modules/live-scoring/useLiveScoringSession'
import { useAuthGate } from '@/modules/auth/useAuthGate'
import { SportEventPad, SportStatStrip } from '@/modules/sports'

type GameEventType = components['schemas']['GameEventType']
type SheetView = 'players' | 'substitution' | 'conflicts' | null

// Maps the 4 real-world jobs someone arrives at this screen to do onto the
// backend's 7-value GameReporterRole enum. "Score the Game" defaults to
// TEAM_SCORER (the common case — a team's own scorer) rather than
// OFFICIAL_SCORER, which carries real manager authority (conflict
// resolution, finalize) and stays a deliberate secondary choice, not the
// default. "Track a Player" and "Broadcast" have no meaningfully different
// backend behavior across CONTRIBUTOR/SPECTATOR_REPORTER, so one concrete
// role each keeps the choice simple instead of preserving every enum value
// as its own button. "Watch" isn't a reporter role at all — it's the
// existing public Spectate screen, so it navigates there directly instead
// of joining as anything.
interface JobOptionProps {
  icon: React.ComponentType<{ size?: number; color?: string }>
  title: string
  description: string
  onPress: () => void
  isLoading?: boolean
}

function JobOption({ icon: Icon, title, description, onPress, isLoading }: JobOptionProps) {
  const iconColor = useNativeColor('brand')
  return (
    <Pressable
      onPress={onPress}
      disabled={isLoading}
      className={`flex-row items-center gap-md rounded-md border border-border bg-surface p-md active:opacity-70 ${isLoading ? 'opacity-50' : ''}`}
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-brand/10">
        <Icon size={20} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="font-semibold">{title}</Text>
        <Text variant="caption">{description}</Text>
      </View>
    </Pressable>
  )
}

export function LiveScoringSessionScreen({ gameId }: { gameId: string }) {
  const session = useLiveScoringSession(gameId)
  const { isAuthenticated, isAuthLoading } = useAuthGate()
  const router = useRouter()
  const sheetRef = useRef<GorhomBottomSheet>(null)
  const [sheetView, setSheetView] = useState<SheetView>(null)
  const [undoingEventId, setUndoingEventId] = useState<string | null>(null)

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
    disciplineStatus,
    dismissQueuedEvent,
    events,
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
    playerById,
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
    trackedPlayerStats,
    undoEvent,
    undoEventById,
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
      <View className="flex-1 bg-canvas p-lg gap-sm">
        <Stack.Screen options={{ headerShown: true, title: 'Live Capture' }} />
        <Text className="text-2xl font-bold pb-xs">What are you here to do?</Text>

        <JobOption
          icon={ClipboardList}
          title="Score the Game"
          description="Full box score — every player, both teams."
          isLoading={join.isPending}
          onPress={() => joinAsRole('TEAM_SCORER')}
        />
        <Pressable onPress={() => joinAsRole('OFFICIAL_SCORER')} className="self-end pr-sm" hitSlop={8}>
          <Text variant="caption" className="text-brand">I'm the assigned Official Scorer</Text>
        </Pressable>

        <JobOption
          icon={Target}
          title="Track a Player"
          description="Follow just one player's stats — simpler, fewer taps."
          isLoading={join.isPending}
          onPress={() => joinAsRole('CONTRIBUTOR')}
        />

        <JobOption
          icon={Radio}
          title="Broadcast"
          description="Score the game and unlock the big-display Cast view."
          isLoading={join.isPending}
          onPress={() => joinAsRole('BROADCASTER')}
        />

        <JobOption
          icon={Eye}
          title="Watch"
          description="Follow along live — no stat entry."
          onPress={() => router.push({ pathname: '/games/[gameId]/spectate', params: { gameId } })}
        />

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
  // "Track a Player" job (see JobOption mapping above) — once a player is
  // picked, the team-select/switch chrome collapses to a single "Tracking"
  // line + that player's own live stat strip, reusing the exact same pad
  // and submit flow as the full-game mode. Before a player is picked, this
  // mode looks identical to the full-game team-card (still needs one).
  const isTrackMode = joinedRole === 'CONTRIBUTOR'
  const isTrackingLocked = isTrackMode && Boolean(activePlayer)

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

  async function handleUndoEvent(eventId: string) {
    setUndoingEventId(eventId)
    try {
      await undoEventById(eventId)
    } finally {
      setUndoingEventId(null)
    }
  }

  return (
    <View className="flex-1 bg-canvas">
      <Stack.Screen options={{ headerShown: true, title: 'Live Capture' }} />

      {/* One compact context band, not four stacked ones — score/status on
          top, team+player selection below as a single bordered card, so the
          pad (the actual job) owns the rest of the screen. */}
      <View className="px-lg pt-sm gap-xs">
        <View className="flex-row items-start justify-between gap-sm">
          <ReporterPresencePill count={reporterCount} />
          <SyncStatusBar queue={queue} onRetry={retrySync} onDismiss={dismissQueuedEvent} className="flex-1 gap-xs" />
        </View>
        <GameScoreboardCard game={game} liveScoreByTeamId={score} className="py-0" />
      </View>

      {game.status === 'SCHEDULED' ? (
        <Button className="mx-lg my-sm" isLoading={startLive.isPending} onPress={() => startLive.mutate()}>
          Start Live Game
        </Button>
      ) : null}

      {isTrackingLocked ? (
        // Locked: team+player chosen once, chrome collapses to a single
        // line + this player's own live stat line — the "tracking one
        // player is simpler" job made visibly simpler, not just in name.
        <View className="mx-lg my-sm gap-sm">
          <Pressable
            onPress={() => setSelectedPlayerId(null)}
            className="flex-row items-center gap-sm rounded-md border border-border bg-surface px-md py-sm active:opacity-70"
          >
            <View className="h-9 w-9 items-center justify-center rounded-md bg-sport-accent/15">
              <Text className="font-bold text-sport-accent">{activePlayer!.jerseyNumber ?? activePlayer!.player.jerseyNumber ?? '–'}</Text>
            </View>
            <Text className="flex-1 font-semibold" numberOfLines={1}>{`Tracking ${activePlayerName}`}</Text>
            <Text variant="caption" className="text-brand">Change</Text>
          </Pressable>
          <SportStatStrip sport={sport} stats={trackedPlayerStats} view="profileHeadline" />
        </View>
      ) : (
        <View className="mx-lg my-sm rounded-md border border-border bg-surface overflow-hidden">
          <View className="flex-row gap-sm p-sm">
            {[homeTeam, awayTeam].map((team) => team && (
              <Pressable
                key={team.id}
                onPress={() => selectTeam(team.id)}
                className={`flex-1 rounded-md border py-xs items-center ${selectedTeamId === team.id ? 'border-sport-accent bg-sport-accent/10' : 'border-border'}`}
              >
                <Text className="font-semibold" numberOfLines={1}>{team.name}</Text>
                {disciplineStatus ? (
                  <View className="flex-row items-center gap-xs pt-xs">
                    <Text variant="caption">{`${disciplineStatus.teamFouls[team.id] ?? 0} fouls`}</Text>
                    {disciplineStatus.inBonus[team.id] ? <Badge tone="dispute">Bonus</Badge> : null}
                  </View>
                ) : null}
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={() => selectedTeamId && openSheet('players')}
            disabled={!selectedTeamId}
            className={`flex-row items-center gap-sm px-md py-sm border-t border-border active:opacity-70 ${!selectedTeamId ? 'opacity-40' : ''}`}
          >
            {/* Jersey number leads, name is secondary — a scorer identifies a
                player on the court by number, not by reading a name (see
                PlayerPickRow, which the sheet this opens reuses for the same reason). */}
            {activePlayer ? (
              <View className="h-9 w-9 items-center justify-center rounded-md bg-sport-accent/15">
                <Text className="font-bold text-sport-accent">{activePlayer.jerseyNumber ?? activePlayer.player.jerseyNumber ?? '–'}</Text>
              </View>
            ) : null}
            <Text className="flex-1 font-semibold" numberOfLines={1}>{activePlayerName}</Text>
            <Text variant="caption">Switch</Text>
          </Pressable>
        </View>
      )}

      <SportEventPad
        sport={sport}
        disabled={!selectedPlayerId}
        suggestedEventTypes={suggestedEventTypes}
        onEvent={handleEventTap}
        className="flex-1 px-lg"
      />

      <RecentPlaysStrip
        sport={sport}
        events={events}
        playerById={playerById}
        onUndo={handleUndoEvent}
        undoingEventId={undoingEventId}
        filterPlayerId={isTrackMode ? selectedPlayerId : undefined}
        className="px-lg gap-xs pt-sm"
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
            fouledOutPlayerIds={disciplineStatus?.fouledOutPlayerIds}
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
