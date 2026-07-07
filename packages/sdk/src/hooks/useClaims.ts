import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiClient, ApiError } from '../client'

export function useClaimPlayer(playerId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body?: { verificationNote?: string }) => {
      const { data, error, response } = await getApiClient().POST('/players/{playerId}/claim', {
        params: { path: { playerId } },
        body: body ?? {},
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player', playerId] })
    },
  })
}

export function useClaims(params?: { status?: string }) {
  return useQuery({
    queryKey: ['claims', params],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/claims', { params: { query: params as any } })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
  })
}

export function useReviewClaim(claimId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: { status: string; verificationNote?: string }) => {
      const { data, error, response } = await getApiClient().PATCH('/claims/{claimId}', {
        params: { path: { claimId } },
        body: body as any,
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] })
    },
  })
}

export function useVerifyPlayer(playerId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: { sourceStatus: string }) => {
      const { data, error, response } = await getApiClient().POST('/players/{playerId}/verify', {
        params: { path: { playerId } },
        body: body as any,
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player', playerId] })
    },
  })
}
