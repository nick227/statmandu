import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiClient, ApiError } from '../client'

export function useDisputes(targetType: string, targetId: string) {
  return useQuery({
    queryKey: ['disputes', targetType, targetId],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/disputes', {
        params: { query: { targetType: targetType as any, targetId } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    enabled: Boolean(targetType && targetId),
  })
}

export function useOpenDispute() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: { targetType: string; targetId: string; fieldName?: string; description: string; proposedValue?: string }) => {
      const { data, error, response } = await getApiClient().POST('/disputes', { body: body as any })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['disputes', variables.targetType, variables.targetId] })
    },
  })
}

export function useResolveDispute(disputeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: { status: string; resolutionNote?: string }) => {
      const { data, error, response } = await getApiClient().PATCH('/disputes/{disputeId}', {
        params: { path: { disputeId } },
        body: body as any,
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] })
    },
  })
}
