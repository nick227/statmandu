import { useMemo, useState } from 'react'
import { useExecuteSportsImport, useImportProviders, usePreviewSportsImport, useResolveSportsImportRecord, useSportsImportRun } from '@statman/sdk'

export type SportsImportScope = 'teams' | 'games' | 'standings' | 'stats'

export function useSportsImport() {
  const providers = useImportProviders()
  const previewMutation = usePreviewSportsImport()
  const executeMutation = useExecuteSportsImport()
  const resolveMutation = useResolveSportsImportRecord()
  const [leagueId, setLeagueId] = useState('')
  const [season, setSeason] = useState('2023-2024')
  const [scopes, setScopes] = useState<SportsImportScope[]>(['teams', 'games', 'standings', 'stats'])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [teamId, setTeamId] = useState('')
  const [gameIdsText, setGameIdsText] = useState('')
  const [recentCompletedGames, setRecentCompletedGames] = useState('20')
  const previewRunId = previewMutation.data?.data.id
  const refreshedRun = useSportsImportRun(previewRunId)
  const run = executeMutation.data?.data ?? refreshedRun.data?.data ?? previewMutation.data?.data
  const error = (previewMutation.error ?? executeMutation.error ?? resolveMutation.error) as Error | null
  const unresolved = useMemo(() => run?.records?.filter((item) => item.action === 'CONFLICT') ?? [], [run])

  function toggleScope(scope: SportsImportScope) {
    setScopes((current) => current.includes(scope) ? current.filter((item) => item !== scope) : [...current, scope])
  }

  function preview() {
    previewMutation.mutate({
      leagueId: leagueId.trim(),
      season: season.trim(),
      scopes,
      detailFilters: {
        dateFrom: dateFrom.trim() || undefined,
        dateTo: dateTo.trim() || undefined,
        teamId: teamId.trim() || undefined,
        gameIds: gameIdsText.split(/[\s,]+/).map((id) => id.trim()).filter(Boolean),
        recentCompletedGames: Number(recentCompletedGames) || 20,
      },
    })
  }

  return {
    providers,
    run,
    unresolved,
    error,
    leagueId, setLeagueId,
    season, setSeason,
    scopes, toggleScope,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    teamId, setTeamId,
    gameIdsText, setGameIdsText,
    recentCompletedGames, setRecentCompletedGames,
    canPreview: Boolean(leagueId.trim() && season.trim() && scopes.length > 0),
    preview,
    isPreviewing: previewMutation.isPending,
    execute: (runId: string) => executeMutation.mutate(runId),
    isExecuting: executeMutation.isPending,
    resolveRecord: (input: Parameters<typeof resolveMutation.mutate>[0]) => resolveMutation.mutate(input),
    isResolving: resolveMutation.isPending,
  }
}
