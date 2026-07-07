import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiClient, ApiError } from '../client'

export function useReactionCounts(targetType: string, targetId: string) {
  return useQuery({
    queryKey: ['reactions', targetType, targetId],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/reactions', {
        params: { query: { targetType: targetType as any, targetId } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    enabled: Boolean(targetType && targetId),
  })
}

export function useCreateReaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: { targetType: string; targetId: string; type: string }) => {
      const { data, error, response } = await getApiClient().POST('/reactions', { body: body as any })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reactions', variables.targetType, variables.targetId] })
    },
  })
}
