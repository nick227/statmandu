import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Video } from 'lucide-react-native'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { TikTokVideoFeed } from '@/modules/media/TikTokVideoFeed'
import { VideoFilmSkeleton } from '@/modules/media/VideoFilmSkeleton'
import { useImmersiveFilmTabBar } from '@/modules/media/useImmersiveFilmTabBar'
import { VIDEOS_COPY, VIDEOS_SCREEN } from '@/modules/media/videosContent'
import { useVideosBrowse } from '@/modules/media/useVideosBrowse'

export function VideosBrowseScreen() {
  const browse = useVideosBrowse()
  const insets = useSafeAreaInsets()
  const copy = VIDEOS_COPY
  const hasVideos = browse.videos.length > 0

  useImmersiveFilmTabBar(hasVideos)

  if (browse.isError) {
    return (
      <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
        <ErrorState message={VIDEOS_SCREEN.error} />
      </View>
    )
  }

  if (browse.isLoading) {
    return (
      <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
        <VideoFilmSkeleton />
      </View>
    )
  }

  if (!hasVideos) {
    return (
      <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
        <EmptyState icon={Video} title={copy.empty.title} description={copy.empty.description} />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-black">
      <TikTokVideoFeed items={browse.videos} />
    </View>
  )
}
