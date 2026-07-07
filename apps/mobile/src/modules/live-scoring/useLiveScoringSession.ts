import { useState } from 'react'
import {
  useFinalizeGame,
  useGame,
  useGameSnapshot,
  useJoinGameAsReporter,
  useStartLiveGame,
  useSubmitGameEvent,
  useTeamRoster,
  useUndoGameEvent,
} from '@statman/sdk'
import type { BasketballLiveEventType } from '@/modules/live-scoring/BasketballLiveEventPad'

export const LIVE_SCORING_ROLES = ['OFFICIAL_SCORER', 'TEAM_SCORER', 'BROADCASTER', 'SPECTATOR_REPORTER'] as const

export function useLiveScoringSession(gameId: string) {
  const [joinedRole, setJoinedRole] = useState<string | null>(null)
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [lastEventId, setLastEventId] = useState<string | null>(null)

  const gameQuery = useGame(gameId)
  const game = gameQuery.data?.data
  const homeTeam = game?.gameTeams.find((gt) => gt.isHome)?.team
  const awayTeam = game?.gameTeams.find((gt) => !gt.isHome)?.team
  const activeTeamSlug = selectedTeamId === homeTeam?.id ? homeTeam?.slug : awayTeam?.slug
  const rosterQuery = useTeamRoster(activeTeamSlug ?? '')

  const join = useJoinGameAsReporter(gameId)
  const startLive = useStartLiveGame(gameId)
  const submitEventMutation = useSubmitGameEvent(gameId)
  const undoEvent = useUndoGameEvent(gameId)
  const finalize = useFinalizeGame(gameId)
  const snapshotQuery = useGameSnapshot(gameId)
  const score = Object.fromEntries((snapshotQuery.data?.data.score ?? []).map((s) => [s.teamId, s.points]))

  async function joinAsRole(role: string) {
    await join.mutateAsync({ role })
    setJoinedRole(role)
  }

  async function submitEvent(type: BasketballLiveEventType) {
    if (!selectedPlayerId || !selectedTeamId) return
    const result = await submitEventMutation.mutateAsync({
      type,
      playerId: selectedPlayerId,
      teamId: selectedTeamId,
      clientTimestamp: new Date().toISOString(),
    })
    setLastEventId(result.data.id)
  }

  async function undoLastEvent() {
    if (!lastEventId) return
    await undoEvent.mutateAsync(lastEventId)
    setLastEventId(null)
  }

  function selectTeam(teamId: string) {
    setSelectedTeamId(teamId)
    setSelectedPlayerId(null)
  }

  return {
    game,
    homeTeam,
    awayTeam,
    roster: rosterQuery.data?.data ?? [],
    score,
    joinedRole,
    selectedTeamId,
    selectedPlayerId,
    lastEventId,
    join,
    joinAsRole,
    startLive,
    submitEvent,
    submitEventMutation,
    undoEvent,
    undoLastEvent,
    finalize,
    selectTeam,
    setSelectedPlayerId,
    isLoading: gameQuery.isLoading,
  }
}
