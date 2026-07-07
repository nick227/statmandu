import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiClient, ApiError } from '../client'

export function useFollows(targetType: string, targetId: string) {
  return useQuery({
    queryKey: ['follows', targetType, targetId],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/follows', {
        params: { query: { targetType: targetType as any, targetId } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    enabled: Boolean(targetType && targetId),
  })
}

export function useCreateFollow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: { targetType: string; targetId: string }) => {
      const { data, error, response } = await getApiClient().POST('/follows', { body: body as any })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['follows', variables.targetType, variables.targetId] })
    },
  })
}

export function useDeleteFollow(targetType: string, targetId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (followId: string) => {
      const { data, error, response } = await getApiClient().DELETE('/follows/{followId}', {
        params: { path: { followId } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follows', targetType, targetId] })
    },
  })
}
