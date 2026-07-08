import { useEffect, useMemo, useRef, useState } from 'react'
import { Platform } from 'react-native'
import * as Haptics from 'expo-haptics'
import {
  ApiError,
  useFinalizeGame,
  useGame,
  useGameConflicts,
  useGameEvents,
  useGameSnapshot,
  useJoinGameAsReporter,
  useStartLiveGame,
  useSubmitGameEvent,
  useTeamRoster,
  useUndoGameEvent,
} from '@statman/sdk'
import type { components } from '@statman/sdk'
import { computeDisciplineStatus, emptyNumericStats, getSportDefinition, predictNext, reconcileEvents } from '@statman/sports'

type GameEventType = components['schemas']['GameEventType']

// Matches the backend GameReporterRole enum minus ADMIN_OWNER (assigned, not
// self-joined) and VIEWER (that's the Spectate flow, not live capture).
export const LIVE_SCORING_ROLES = ['OFFICIAL_SCORER', 'TEAM_SCORER', 'BROADCASTER', 'CONTRIBUTOR', 'SPECTATOR_REPORTER'] as const

// Mirrors PermissionPolicy's GAME_MANAGER_ROLES on the server — keep in sync.
const MANAGER_ROLES = ['ADMIN_OWNER', 'OFFICIAL_SCORER']

const RETRY_INTERVAL_MS = 5000
// Catch-up mode spaces synthetic timestamps this far apart so play-by-play
// ordering stays correct even if the scorer pauses mid-batch to read a
// paper stat sheet, instead of every rapid-fire tap bunching to "now".
const CATCH_UP_STEP_MS = 4000

// expo-haptics has no native implementation on web — mirrors the existing
// Platform.OS === 'web' guard used for expo-secure-store elsewhere in the
// app rather than assuming the library no-ops safely on its own.
function safeHaptic(fn: () => void) {
  if (Platform.OS === 'web') return
  fn()
}

export type LiveScoringMode = 'live' | 'catchUp'

export interface QueuedLiveEvent {
  localId: string
  type: GameEventType
  playerId: string
  teamId: string
  clientTimestamp: string
  // 'failed' = transient (network/5xx) — auto-retried. 'rejected' = the
  // server actively refused it (4xx) — retrying won't help, needs a manual
  // dismiss so it doesn't look like a silent data-loss bug.
  status: 'pending' | 'syncing' | 'failed' | 'rejected'
}

function makeLocalId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export interface PredictedSelection {
  selectedTeamId: string | null
  clearPlayer: boolean
  suggestedEventTypes: string[]
}

// Pure decision logic behind applyPrediction, pulled out so it's testable
// without rendering the hook or mocking @statman/sdk's ~8 query/mutation
// hooks. Given the team a just-submitted event belonged to (plus the
// game's two team ids), decides what the *next* tap's team/player/
// suggested-tiles should be.
export function resolvePredictedSelection(
  sport: string,
  eventType: string,
  current: { selectedTeamId: string | null; homeTeamId?: string; awayTeamId?: string }
): PredictedSelection {
  const prediction = predictNext(sport, eventType)
  let selectedTeamId = current.selectedTeamId
  if (prediction.flipPossession) {
    if (selectedTeamId === current.homeTeamId) selectedTeamId = current.awayTeamId ?? selectedTeamId
    else if (selectedTeamId === current.awayTeamId) selectedTeamId = current.homeTeamId ?? selectedTeamId
  }
  return { selectedTeamId, clearPlayer: !prediction.keepPlayer, suggestedEventTypes: prediction.suggestedEventTypes }
}

export function useLiveScoringSession(gameId: string) {
  const [joinedRole, setJoinedRole] = useState<string | null>(null)
  const [mode, setMode] = useState<LiveScoringMode>('live')
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [suggestedEventTypes, setSuggestedEventTypes] = useState<string[]>([])
  const [lastEventId, setLastEventId] = useState<string | null>(null)
  const [queue, setQueue] = useState<QueuedLiveEvent[]>([])
  const queueRef = useRef(queue)
  queueRef.current = queue
  const catchUpClockRef = useRef<number | null>(null)

  const gameQuery = useGame(gameId)
  const game = gameQuery.data?.data
  const sport = game?.sport?.slug ?? 'basketball'
  const homeTeam = game?.gameTeams.find((gt) => gt.isHome)?.team
  const awayTeam = game?.gameTeams.find((gt) => !gt.isHome)?.team
  // Both rosters, not just the selected team's — the recent-plays strip
  // shows whichever team's event happened most recently, regardless of
  // which team is currently selected for input, so name/number resolution
  // needs to cover both sides. Also means switching the selected team no
  // longer triggers a fresh fetch, since both are already loaded.
  const homeRosterQuery = useTeamRoster(homeTeam?.slug ?? '')
  const awayRosterQuery = useTeamRoster(awayTeam?.slug ?? '')
  const roster = (selectedTeamId === awayTeam?.id ? awayRosterQuery.data?.data : homeRosterQuery.data?.data) ?? []
  const playerById = useMemo(() => {
    const all = [...(homeRosterQuery.data?.data ?? []), ...(awayRosterQuery.data?.data ?? [])]
    return Object.fromEntries(
      all.map((m) => [
        m.player.id,
        {
          jerseyNumber: m.jerseyNumber ?? m.player.jerseyNumber ?? null,
          name: `${m.player.athleteProfile.firstName} ${m.player.athleteProfile.lastName}`,
        },
      ])
    )
  }, [homeRosterQuery.data, awayRosterQuery.data])

  const join = useJoinGameAsReporter(gameId)
  const startLive = useStartLiveGame(gameId)
  const submitEventMutation = useSubmitGameEvent(gameId)
  const undoEvent = useUndoGameEvent(gameId)
  const finalize = useFinalizeGame(gameId)
  const snapshotQuery = useGameSnapshot(gameId)
  const score = Object.fromEntries((snapshotQuery.data?.data.score ?? []).map((s) => [s.teamId, s.points]))
  const reporterCount = snapshotQuery.data?.data.reporterCount ?? 1
  const isManager = Boolean(joinedRole && MANAGER_ROLES.includes(joinedRole))
  const conflictsQuery = useGameConflicts(isManager ? gameId : '')
  const openConflictCount = conflictsQuery.data?.data.length ?? 0

  // Polled (not the static Play-by-Play usage) — a live foul/bonus read
  // needs the full log, since the snapshot's last-20 cap isn't reliable
  // over a whole game.
  const eventsQuery = useGameEvents(gameId, { poll: Boolean(joinedRole) })
  const events = eventsQuery.data?.data ?? []
  // Shared shape for both engines below (computeDisciplineStatus,
  // reconcileEvents) so the GameEvent -> ReconcileEvent mapping happens once.
  const reconcileReadyEvents = useMemo(
    () => events.map((e) => ({ type: e.type, playerId: e.playerId ?? null, teamId: e.teamId ?? null, status: e.status })),
    [events]
  )
  const disciplineStatus = useMemo(() => {
    const teamIds = [homeTeam?.id, awayTeam?.id].filter((id): id is string => Boolean(id))
    return computeDisciplineStatus(getSportDefinition(sport), reconcileReadyEvents, teamIds)
  }, [sport, homeTeam?.id, awayTeam?.id, reconcileReadyEvents])

  // The live single-player stat line for Track-a-Player mode — same
  // reconcileEvents engine finalize() uses server-side, run client-side
  // against the in-progress event log instead of waiting for finalize.
  const trackedPlayerStats = useMemo(() => {
    if (!selectedPlayerId || !selectedTeamId) return null
    const definition = getSportDefinition(sport)
    const result = reconcileEvents(definition, reconcileReadyEvents, [selectedTeamId])
    return result.playerLines.find((line) => line.playerId === selectedPlayerId)?.stats ?? emptyNumericStats(definition)
  }, [sport, reconcileReadyEvents, selectedPlayerId, selectedTeamId])

  useEffect(() => {
    if (finalize.isSuccess) safeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success))
  }, [finalize.isSuccess])

  async function joinAsRole(role: string, teamId?: string) {
    await join.mutateAsync({ role, teamId })
    setJoinedRole(role)
    if (teamId) {
      setSelectedTeamId(teamId)
    }
  }

  function nextClientTimestamp() {
    if (mode !== 'catchUp') return new Date().toISOString()
    if (catchUpClockRef.current == null) {
      catchUpClockRef.current = game?.scheduledAt ? new Date(game.scheduledAt).getTime() : Date.now()
    } else {
      catchUpClockRef.current += CATCH_UP_STEP_MS
    }
    return new Date(catchUpClockRef.current).toISOString()
  }

  // Applies the predictive engine's output for the team/player that should
  // be pre-selected for the *next* tap — flips possession and/or clears the
  // sticky player per the sport's EventDefinition.flow data (@statman/sports).
  // The decision itself is a pure function (resolvePredictedSelection,
  // below) so it's unit-testable without rendering this hook or mocking the
  // SDK — this just applies the result to state.
  function applyPrediction(eventType: GameEventType) {
    const result = resolvePredictedSelection(sport, eventType, {
      selectedTeamId,
      homeTeamId: homeTeam?.id,
      awayTeamId: awayTeam?.id,
    })
    setSuggestedEventTypes(result.suggestedEventTypes)
    setSelectedTeamId(result.selectedTeamId)
    if (result.clearPlayer) setSelectedPlayerId(null)
  }

  async function syncEvent(event: QueuedLiveEvent) {
    setQueue((q) => q.map((e) => (e.localId === event.localId ? { ...e, status: 'syncing' } : e)))
    try {
      const result = await submitEventMutation.mutateAsync({
        type: event.type,
        playerId: event.playerId,
        teamId: event.teamId,
        clientTimestamp: event.clientTimestamp,
      })
      setLastEventId(result.data.id)
      setQueue((q) => q.filter((e) => e.localId !== event.localId))
      safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light))
      applyPrediction(event.type)
    } catch (err) {
      const isRejected = err instanceof ApiError && err.status >= 400 && err.status < 500
      setQueue((q) => q.map((e) => (e.localId === event.localId ? { ...e, status: isRejected ? 'rejected' : 'failed' } : e)))
      if (isRejected) safeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning))
    }
  }

  // Optimistic: queued immediately so the event pad never waits on the
  // network, then synced in the background. Local-first per the live game
  // stat capture spec's "Offline/sync status always visible" requirement —
  // does not persist across an app restart, just across network blips
  // during one session (see CLAUDE.md).
  // overridePlayerId lets a caller submit for a specific player other than
  // the sticky selection — used by the substitution picker, which needs to
  // submit SUBSTITUTION_OUT/SUBSTITUTION_IN for two different players in a
  // row without disturbing whichever player is currently selected for scoring.
  async function submitEvent(type: GameEventType, overridePlayerId?: string) {
    const playerId = overridePlayerId ?? selectedPlayerId
    if (!playerId || !selectedTeamId) return
    const event: QueuedLiveEvent = {
      localId: makeLocalId(),
      type,
      playerId,
      teamId: selectedTeamId,
      clientTimestamp: nextClientTimestamp(),
      status: 'pending',
    }
    setQueue((q) => [...q, event])
    await syncEvent(event)
  }

  function retrySync() {
    for (const event of queueRef.current) {
      if (event.status === 'failed') syncEvent(event)
    }
  }

  function dismissQueuedEvent(localId: string) {
    setQueue((q) => q.filter((e) => e.localId !== localId))
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (queueRef.current.some((e) => e.status === 'failed')) retrySync()
    }, RETRY_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  async function undoLastEvent() {
    if (!lastEventId) return
    await undoEventById(lastEventId)
  }

  // Backs the recent-plays correction strip — a scorer's real mistake
  // pattern is noticing an error a couple of plays later, not just on the
  // very last tap, so this isn't restricted to lastEventId like
  // undoLastEvent above (the backend itself has no "most recent only"
  // restriction either — any of the reporter's own non-finalized events).
  async function undoEventById(eventId: string) {
    await undoEvent.mutateAsync(eventId)
    if (eventId === lastEventId) {
      setLastEventId(null)
      setSuggestedEventTypes([])
    }
  }

  function selectTeam(teamId: string) {
    setSelectedTeamId(teamId)
    setSelectedPlayerId(null)
  }

  return {
    game,
    homeTeam,
    awayTeam,
    roster,
    playerById,
    score,
    reporterCount,
    events,
    disciplineStatus,
    trackedPlayerStats,
    mode,
    setMode,
    joinedRole,
    selectedTeamId,
    selectedPlayerId,
    suggestedEventTypes,
    lastEventId,
    join,
    joinAsRole,
    startLive,
    submitEvent,
    submitEventMutation,
    undoEvent,
    undoLastEvent,
    undoEventById,
    finalize,
    selectTeam,
    setSelectedPlayerId,
    isManager,
    openConflictCount,
    queue,
    retrySync,
    dismissQueuedEvent,
    isLoading: gameQuery.isLoading,
    isError: gameQuery.isError,
  }
}
