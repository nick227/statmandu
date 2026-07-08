import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApiClient, ApiError } from '../client'

export function useImages(targetType: string, targetId: string, usage?: string) {
  return useQuery({
    queryKey: ['images', targetType, targetId, usage],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/images', {
        params: { query: { targetType: targetType as any, targetId, usage: usage as any } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    enabled: Boolean(targetType && targetId),
  })
}

export function useUploadImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: {
      targetType: string
      targetId: string
      usage: string
      contentType: 'image/jpeg' | 'image/png' | 'image/webp'
      dataBase64: string
      originalFilename?: string
      width?: number
      height?: number
    }) => {
      const { data, error, response } = await getApiClient().POST('/images/upload', { body: body as any })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['images', variables.targetType, variables.targetId] })
      if (variables.targetType === 'PLAYER') queryClient.invalidateQueries({ queryKey: ['player', variables.targetId] })
      if (variables.targetType === 'TEAM') queryClient.invalidateQueries({ queryKey: ['team', variables.targetId] })
    },
  })
}
