import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApiClient, ApiError } from '../client'

export function useRecentCards() {
  return useQuery({
    queryKey: ['cards', 'recent'],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/cards/recent')
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
  })
}

export function useAthleteCards(athleteProfileId: string) {
  return useQuery({
    queryKey: ['cards', 'athlete', athleteProfileId],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/athlete-profiles/{athleteProfileId}/cards', {
        params: { path: { athleteProfileId } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    enabled: Boolean(athleteProfileId),
  })
}

export function useCard(cardId: string) {
  return useQuery({
    queryKey: ['cards', cardId],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/cards/{cardId}', {
        params: { path: { cardId } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    enabled: Boolean(cardId),
  })
}

export function useMyCards(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['cards', 'mine'],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/me/cards')
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    enabled: options?.enabled ?? true,
  })
}

export function useCreateCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: {
      athleteProfileId: string
      teamId?: string | null
      gameId?: string | null
      title: string
      cardType: 'PROFILE' | 'BIG_GAME' | 'MILESTONE' | 'SEASON' | 'HIGHLIGHT'
      stylePreset: string
      editionMode?: 'UNLIMITED' | 'LIMITED' | 'ONE_OF_ONE'
      editionSize?: number | null
      sourceImageAssetId?: string | null
      statsSnapshotJson?: unknown
    }) => {
      const { data, error, response } = await getApiClient().POST('/cards', { body: body as any })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cards', 'mine'] })
      queryClient.invalidateQueries({ queryKey: ['cards', 'athlete', data.data.athleteProfileId] })
    },
  })
}

export function useUpdateCard(cardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const { data, error, response } = await getApiClient().PATCH('/cards/{cardId}', {
        params: { path: { cardId } },
        body: body as any,
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cards', cardId] })
      queryClient.invalidateQueries({ queryKey: ['cards', 'mine'] })
      queryClient.invalidateQueries({ queryKey: ['cards', 'athlete', data.data.athleteProfileId] })
    },
  })
}

export function useGenerateCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (cardId: string) => {
      const { data, error, response } = await getApiClient().POST('/cards/{cardId}/generate', {
        params: { path: { cardId } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: (data, cardId) => {
      queryClient.invalidateQueries({ queryKey: ['cards', cardId] })
      queryClient.invalidateQueries({ queryKey: ['cards', 'mine'] })
      queryClient.invalidateQueries({ queryKey: ['cards', 'athlete', data.data.athleteProfileId] })
    },
  })
}

export function usePublishCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      cardId,
      body,
    }: {
      cardId: string
      body?: {
        visibility?: 'PRIVATE' | 'PUBLIC'
        editionMode?: 'UNLIMITED' | 'LIMITED' | 'ONE_OF_ONE'
        editionSize?: number | null
      }
    }) => {
      const { data, error, response } = await getApiClient().POST('/cards/{cardId}/publish', {
        params: { path: { cardId } },
        body: body as any,
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cards', variables.cardId] })
      queryClient.invalidateQueries({ queryKey: ['cards', 'recent'] })
      queryClient.invalidateQueries({ queryKey: ['cards', 'mine'] })
      queryClient.invalidateQueries({ queryKey: ['cards', 'athlete', data.data.athleteProfileId] })
    },
  })
}

export function useClaimCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (cardId: string) => {
      const { data, error, response } = await getApiClient().POST('/cards/{cardId}/claim', {
        params: { path: { cardId } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: (_data, cardId) => {
      queryClient.invalidateQueries({ queryKey: ['cards', cardId] })
      queryClient.invalidateQueries({ queryKey: ['cards', 'recent'] })
      queryClient.invalidateQueries({ queryKey: ['cards', 'mine'] })
      queryClient.invalidateQueries({ queryKey: ['cards', 'athlete'] })
    },
  })
}

export function useMarkCardDownloaded() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (issueId: string) => {
      const { data, error, response } = await getApiClient().POST('/card-issues/{issueId}/downloaded', {
        params: { path: { issueId } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', 'mine'] })
    },
  })
}
