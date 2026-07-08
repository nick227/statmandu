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
      file: { uri: string; name: string; type: string }
      originalFilename?: string
      width?: number
      height?: number
    }) => {
      const formData = new FormData()
      formData.append('targetType', body.targetType)
      formData.append('targetId', body.targetId)
      formData.append('usage', body.usage)
      formData.append('contentType', body.contentType)
      formData.append('file', body.file as any)
      if (body.originalFilename) formData.append('originalFilename', body.originalFilename)
      if (body.width) formData.append('width', body.width.toString())
      if (body.height) formData.append('height', body.height.toString())

      const { data, error, response } = await getApiClient().POST('/images/upload', {
        body: formData as any,
        // @ts-ignore: React Native fetch handles multipart/form-data boundary automatically when body is FormData
        bodySerializer: (b) => b,
      })
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
