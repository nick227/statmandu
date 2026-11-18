import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, getApiClient } from '../client'

export function useAdminMetrics() {
  return useQuery({
    queryKey: ['admin', 'metrics'],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/admin/metrics')
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
  })
}

export function useBulkCreatePlayers() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: { items: Array<Record<string, unknown>> }) => {
      const { data, error, response } = await getApiClient().POST('/admin/players/bulk', { body: body as any })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] })
    },
  })
}

export function useBulkAddRosterMembers(teamId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: { items: Array<{ playerId: string; seasonId: string; jerseyNumber?: number }> }) => {
      const { data, error, response } = await getApiClient().POST('/admin/teams/{teamId}/roster/bulk', {
        params: { path: { teamId } },
        body: body as any,
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId, 'roster'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] })
    },
  })
}

export function useAdminDisputes(params?: { status?: string; targetType?: string; targetId?: string }) {
  return useQuery({
    queryKey: ['admin', 'disputes', params],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/admin/disputes', { params: { query: params as any } })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
  })
}

export function useAdminCreateFeedItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: { type: string; targetType: string; targetId: string; summary: string; occurredAt: string }) => {
      const { data, error, response } = await getApiClient().POST('/admin/feed-items', { body: body as any })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] })
    },
  })
}

export function useAdminAuditLog(params?: { cursor?: string; limit?: number; actorUserId?: string; subjectUserId?: string; targetType?: string; targetId?: string }) {
  return useQuery({
    queryKey: ['admin', 'audit-log', params],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/admin/audit-log', { params: { query: params as any } })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
  })
}

export function useImportProviders() {
  return useQuery({
    queryKey: ['admin', 'import', 'providers'],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/admin/import/providers')
      if (error) throw new ApiError((response as Response).status, (error as any).error)
      return data!
    },
  })
}

export function usePreviewSportsImport() {
  return useMutation({
    mutationFn: async (body: {
      leagueId: string
      season: string
      scopes: Array<'teams' | 'games' | 'standings' | 'stats'>
      detailFilters?: { dateFrom?: string; dateTo?: string; teamId?: string; gameIds?: string[]; recentCompletedGames?: number }
    }) => {
      const { data, error, response } = await getApiClient().POST('/admin/import/preview', { body })
      if (error) throw new ApiError((response as Response).status, (error as any).error)
      return data!
    },
  })
}

export function useSportsImportRun(runId?: string) {
  return useQuery({
    queryKey: ['admin', 'import', 'run', runId],
    enabled: Boolean(runId),
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/admin/import/runs/{runId}', { params: { path: { runId: runId! } } })
      if (error) throw new ApiError((response as Response).status, (error as any).error)
      return data!
    },
  })
}

export function useExecuteSportsImport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (runId: string) => {
      const { data, error, response } = await getApiClient().POST('/admin/import/runs/{runId}/execute', { params: { path: { runId } } })
      if (error) throw new ApiError((response as Response).status, (error as any).error)
      return data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      queryClient.invalidateQueries({ queryKey: ['games'] })
    },
  })
}

export function useResolveSportsImportRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { runId: string; recordId: string; resolution: 'MATCH' | 'CREATE' | 'SKIP'; localId?: string }) => {
      const { data, error, response } = await getApiClient().PATCH('/admin/import/runs/{runId}/records/{recordId}', {
        params: { path: { runId: input.runId, recordId: input.recordId } },
        body: { resolution: input.resolution, localId: input.localId },
      })
      if (error) throw new ApiError((response as Response).status, (error as any).error)
      return data!
    },
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'import', 'run', input.runId] })
    },
  })
}
