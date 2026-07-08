import { View, useWindowDimensions } from 'react-native'
import { Video } from 'lucide-react-native'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { VideoFeed } from '@/modules/media/VideoFeed'
import { VideoFilmSkeleton } from '@/modules/media/VideoFilmSkeleton'
import { useImmersiveFilmTabBar } from '@/modules/media/useImmersiveFilmTabBar'
import { VIDEOS_COPY, VIDEOS_SCREEN } from '@/modules/media/videosContent'
import { useVideosBrowse } from '@/modules/media/useVideosBrowse'
import { LAYOUT, PageFrame, Screen } from '@/shared/layout'
import { VideosSidebar } from '@/modules/media/VideosSidebar'

export function VideosBrowseScreen() {
  const browse = useVideosBrowse()
  const { width } = useWindowDimensions()
  const copy = VIDEOS_COPY
  const hasVideos = browse.videos.length > 0
  const showSidebar = width >= LAYOUT.wideBreakpoint
  const contentWidth = Math.min(width, LAYOUT.pageMaxWidth)
  const stageWidth = showSidebar ? Math.floor(contentWidth * 0.7) : contentWidth

  useImmersiveFilmTabBar(hasVideos)

  if (browse.isError) {
    return (
      <Screen title="Video">
        <ErrorState message={VIDEOS_SCREEN.error} />
      </Screen>
    )
  }

  if (browse.isLoading) {
    return (
      <Screen title="Video">
        <VideoFilmSkeleton />
      </Screen>
    )
  }

  if (!hasVideos) {
    return (
      <Screen title="Video">
        <EmptyState icon={Video} title={copy.empty.title} description={copy.empty.description} />
      </Screen>
    )
  }

  return (
    <Screen title="Video">
      <PageFrame
        main={<VideoFeed items={browse.videos} stageWidth={stageWidth} />}
        sidebar={<VideosSidebar videos={browse.videos} />}
        narrowSidebar="hidden"
      />
    </Screen>
  )
}
