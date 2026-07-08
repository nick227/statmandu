import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiClient, ApiError } from '../client'

export function useJoinGameAsReporter(gameId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: { role: string; teamId?: string }) => {
      const { data, error, response } = await getApiClient().POST('/games/{gameId}/reporters', {
        params: { path: { gameId } },
        body: body as any,
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game', gameId] })
    },
  })
}

export function useStartLiveGame(gameId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data, error, response } = await getApiClient().POST('/games/{gameId}/start-live', {
        params: { path: { gameId } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game', gameId] })
    },
  })
}

export function useSubmitGameEvent(gameId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: {
      type: string
      playerId?: string
      teamId?: string
      clientTimestamp: string
      deviceId?: string
    }) => {
      const { data, error, response } = await getApiClient().POST('/games/{gameId}/events', {
        params: { path: { gameId } },
        body: body as any,
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game', gameId, 'snapshot'] })
    },
  })
}

export function useUndoGameEvent(gameId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (eventId: string) => {
      const { data, error, response } = await getApiClient().DELETE('/games/{gameId}/events/{eventId}', {
        params: { path: { gameId, eventId } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game', gameId, 'snapshot'] })
    },
  })
}

export function useGameSnapshot(gameId: string) {
  return useQuery({
    queryKey: ['game', gameId, 'snapshot'],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/games/{gameId}/snapshot', {
        params: { path: { gameId } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    enabled: Boolean(gameId),
    // Live games are otherwise pollable in place of a websocket room (see CLAUDE.md).
    refetchInterval: 4000,
  })
}

// Full play-by-play — distinct from useGameSnapshot (last 20, live-polling
// only). Works for any game status and doesn't poll, since a finalized
// recap is static.
export function useGameEvents(gameId: string) {
  return useQuery({
    queryKey: ['game', gameId, 'events'],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/games/{gameId}/events', {
        params: { path: { gameId } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    enabled: Boolean(gameId),
  })
}

export function useFinalizeGame(gameId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data, error, response } = await getApiClient().POST('/games/{gameId}/finalize', {
        params: { path: { gameId } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game', gameId] })
    },
  })
}

export function useGameConflicts(gameId: string) {
  return useQuery({
    queryKey: ['game', gameId, 'conflicts'],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/games/{gameId}/conflicts', {
        params: { path: { gameId } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    enabled: Boolean(gameId),
    refetchInterval: 4000,
  })
}

export function useResolveGameConflict(gameId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ conflictId, resolvedEventId }: { conflictId: string; resolvedEventId: string }) => {
      const { data, error, response } = await getApiClient().POST('/games/{gameId}/conflicts/{conflictId}/resolve', {
        params: { path: { gameId, conflictId } },
        body: { resolvedEventId },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game', gameId, 'conflicts'] })
      queryClient.invalidateQueries({ queryKey: ['game', gameId, 'snapshot'] })
    },
  })
}

export function useMarkGameConflictDisputed(gameId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (conflictId: string) => {
      const { data, error, response } = await getApiClient().POST('/games/{gameId}/conflicts/{conflictId}/mark-disputed', {
        params: { path: { gameId, conflictId } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game', gameId, 'conflicts'] })
      queryClient.invalidateQueries({ queryKey: ['game', gameId, 'snapshot'] })
    },
  })
}
