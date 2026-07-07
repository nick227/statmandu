import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiClient, ApiError } from '../client'

export function useMedia(targetType: string, targetId: string) {
  return useQuery({
    queryKey: ['media', targetType, targetId],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/media', {
        params: { query: { targetType: targetType as any, targetId } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    enabled: Boolean(targetType && targetId),
  })
}

export function useAttachYouTubeMedia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: { targetType: string; targetId: string; youtubeUrl: string; title?: string }) => {
      const { data, error, response } = await getApiClient().POST('/media/youtube', { body: body as any })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['media', variables.targetType, variables.targetId] })
    },
  })
}
