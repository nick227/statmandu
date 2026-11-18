import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApiClient, ApiError } from '../client'

export function useRecentCards(sort?: 'recent' | 'popular') {
  return useQuery({
    queryKey: ['cards', 'recent', sort ?? 'recent'],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/cards/recent', {
        params: { query: sort ? { sort } : undefined },
      })
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
    mutationFn: async ({
      issueId,
      context,
    }: {
      issueId: string
      context?: 'PROFILE' | 'HOME' | 'EXPLORE' | 'CARD_STUDIO' | 'SHARED_LINK' | 'DIRECT'
    }) => {
      const { data, error, response } = await getApiClient().POST('/card-issues/{issueId}/downloaded', {
        params: { path: { issueId } },
        body: context ? { context } : undefined,
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', 'mine'] })
    },
  })
}

export function useGenerateCardBatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      athleteProfileId,
      sourceImageAssetId,
      poseIds,
      batchRequestId,
    }: {
      athleteProfileId: string
      sourceImageAssetId: string
      poseIds?: string[]
      batchRequestId?: string
    }) => {
      const { data, error, response } = await getApiClient().POST('/athlete-profiles/{athleteProfileId}/cards/generate-batch', {
        params: { path: { athleteProfileId } },
        body: { sourceImageAssetId, poseIds, batchRequestId },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cards', 'mine'] })
      queryClient.invalidateQueries({ queryKey: ['cards', 'athlete', variables.athleteProfileId] })
    },
  })
}

// One-off card lookups (not returned by generateCardBatch's own polling
// loop) — used by useCardGenerationBatch below to check each card's
// current status without a dedicated "list these specific ids" endpoint.
export function useCardBatchStatus(cardIds: string[], options?: { pollMs?: number }) {
  return useQuery({
    queryKey: ['cards', 'batch-status', cardIds],
    queryFn: async () => {
      const results = await Promise.all(
        cardIds.map(async (cardId) => {
          const { data, error, response } = await getApiClient().GET('/cards/{cardId}', { params: { path: { cardId } } })
          if (error) throw new ApiError(response.status, (error as any).error)
          return data!.data
        })
      )
      return results
    },
    enabled: cardIds.length > 0,
    refetchInterval: (query) => {
      const cards = query.state.data
      if (!cards) return options?.pollMs ?? 4000
      const settled = cards.every((card) => card.status === 'READY' || card.status === 'FAILED' || card.status === 'PUBLISHED')
      return settled ? false : (options?.pollMs ?? 4000)
    },
  })
}

// Lightweight save/collect — mirrors useFollows.ts's create/delete/list
// shape exactly (upsert-backed create, ownership-checked delete, a "mine"
// list query invalidated by both mutations).
export function useMyCardSaves(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['cards', 'saves', 'mine'],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/me/card-saves')
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    enabled: options?.enabled ?? true,
  })
}

export function useSaveCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (cardTemplateId: string) => {
      const { data, error, response } = await getApiClient().POST('/card-saves', {
        body: { cardTemplateId },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', 'saves', 'mine'] })
    },
  })
}

export function useUnsaveCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (saveId: string) => {
      const { data, error, response } = await getApiClient().DELETE('/card-saves/{saveId}', {
        params: { path: { saveId } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', 'saves', 'mine'] })
    },
  })
}

export function useCardDistribution(athleteProfileId: string) {
  return useQuery({
    queryKey: ['cards', 'distribution', athleteProfileId],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/athlete-profiles/{athleteProfileId}/cards/distribution', {
        params: { path: { athleteProfileId } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    enabled: Boolean(athleteProfileId),
  })
}
