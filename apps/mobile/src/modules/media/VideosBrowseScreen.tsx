import { useMemo, useState } from 'react'
import { View } from 'react-native'
import { Video } from 'lucide-react-native'
import { Screen } from '@/shared/layout'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Text } from '@/shared/ui/Text'
import { RankingsSkeleton } from '@/modules/leaderboards/RankingsSkeleton'
import { ConnectedFullScreenMediaViewer } from '@/modules/media/ConnectedFullScreenMediaViewer'
import { TikTokVideoFeed } from '@/modules/media/TikTokVideoFeed'
import { VIDEOS_COPY, VIDEOS_SCREEN } from '@/modules/media/videosContent'
import { useVideosBrowse } from '@/modules/media/useVideosBrowse'

export function VideosBrowseScreen() {
  const browse = useVideosBrowse()
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const copy = VIDEOS_COPY
  const hasVideos = browse.videos.length > 0
  const viewerItems = useMemo(() => browse.videos, [browse.videos])

  if (browse.isError) {
    return (
      <Screen title={VIDEOS_SCREEN.title}>
        <ErrorState message={VIDEOS_SCREEN.error} />
      </Screen>
    )
  }

  if (browse.isLoading) {
    return (
      <Screen title={VIDEOS_SCREEN.title}>
        <RankingsSkeleton />
      </Screen>
    )
  }

  return (
    <>
      <Screen title={VIDEOS_SCREEN.title} scroll={false} contentClassName="flex-1 pb-xxl">
        {hasVideos ? (
          <View className="flex-1 gap-sm">
            <View className="gap-xs px-lg">
              <Text className="text-lg font-semibold">{copy.browse.title}</Text>
              <Text variant="caption">{copy.browse.subtitle}</Text>
            </View>
            <TikTokVideoFeed items={browse.videos} onOpenViewer={setViewerIndex} />
          </View>
        ) : (
          <EmptyState icon={Video} title={copy.empty.title} description={copy.empty.description} />
        )}
      </Screen>

      <ConnectedFullScreenMediaViewer
        visible={viewerIndex != null}
        items={viewerItems}
        initialIndex={viewerIndex ?? 0}
        onClose={() => setViewerIndex(null)}
      />
    </>
  )
}
