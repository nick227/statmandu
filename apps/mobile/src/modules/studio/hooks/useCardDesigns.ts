import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApiClient, ApiError, type components } from '@statman/sdk'

import type {
  CardComposition,
  CardCompositionLayer,
} from '@/modules/cards/CardCompositionRenderer'

export type CardDesign = components['schemas']['CardDesign']
export type { CardComposition, CardCompositionLayer }
export type CreateCardDesignInput = Omit<components['schemas']['CreateCardDesignInput'], 'composition'> & {
  composition: CardComposition
}
export type UpdateCardDesignInput = Omit<components['schemas']['UpdateCardDesignInput'], 'composition'> & {
  composition?: CardComposition
}

export class RevisionConflictError extends Error {
  constructor(
    message: string = 'Conflict: this card design was updated elsewhere. Your unsaved changes are preserved locally.',
    public currentRevision?: number,
  ) {
    super(message)
    this.name = 'RevisionConflictError'
  }
}

export function useCardDesigns() {
  return useQuery({
    queryKey: ['card-designs'],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/card-designs')
      if (error) throw new ApiError(response.status, (error as any).error)
      return data?.data ?? []
    },
  })
}

export function useCardDesign(designId: string | undefined) {
  return useQuery({
    queryKey: ['card-designs', designId],
    enabled: Boolean(designId),
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/card-designs/{designId}', {
        params: { path: { designId: designId! } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!.data
    },
  })
}

export function useCreateCardDesign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateCardDesignInput) => {
      const { data, error, response } = await getApiClient().POST('/card-designs', {
        body: body as any,
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!.data
    },
    onSuccess: (newDesign) => {
      queryClient.invalidateQueries({ queryKey: ['card-designs'] })
      queryClient.setQueryData(['card-designs', newDesign.id], newDesign)
    },
  })
}

export function useUpdateCardDesign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      designId,
      ...body
    }: UpdateCardDesignInput & { designId: string }) => {
      const { data, error, response } = await getApiClient().PATCH('/card-designs/{designId}', {
        params: { path: { designId } },
        body: body as any,
      })
      if (response.status === 409) {
        throw new RevisionConflictError(
          (error as any)?.error ?? 'Design revision conflict. Your local changes are preserved.',
        )
      }
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!.data
    },
    onSuccess: (updatedDesign) => {
      queryClient.invalidateQueries({ queryKey: ['card-designs'] })
      queryClient.setQueryData(['card-designs', updatedDesign.id], updatedDesign)
    },
  })
}

export function useArchiveCardDesign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ designId, expectedRevision }: { designId: string; expectedRevision: number }) => {
      const { data, error, response } = await getApiClient().PATCH('/card-designs/{designId}', {
        params: { path: { designId } },
        body: { expectedRevision, archived: true },
      })
      if (response.status === 409) {
        throw new RevisionConflictError()
      }
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!.data
    },
    onSuccess: (updatedDesign) => {
      queryClient.invalidateQueries({ queryKey: ['card-designs'] })
      queryClient.setQueryData(['card-designs', updatedDesign.id], updatedDesign)
    },
  })
}
