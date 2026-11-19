import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApiClient, ApiError, type components } from '@statman/sdk'

export type CardDesign = components['schemas']['CardDesign']
export type CardComposition = components['schemas']['CardComposition'] & {
  metadata?: {
    rendererVersion?: string
    flagship?: any
    taxonomy?: any
    [key: string]: any
  }
}
export type CardCompositionLayer = components['schemas']['CardCompositionLayer']
export type CreateCardDesignInput = components['schemas']['CreateCardDesignInput']
export type UpdateCardDesignInput = components['schemas']['UpdateCardDesignInput']

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
        body,
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
        body,
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
