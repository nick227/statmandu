import { useRecentMedia } from '@statman/sdk'

export function useVideosBrowse(limit = 24) {
  const query = useRecentMedia(limit)
  const videos = query.data?.data ?? []

  return {
    videos,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}
