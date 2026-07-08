import { useMemo, useState } from 'react'
import { toViewerItemsForTarget } from './mediaViewerItem'

export interface TargetMediaItem {
  id: string
  youtubeVideoId?: string | null
  title?: string | null
}

export interface TargetVideoItem {
  id: string
  youtubeVideoId: string
  title?: string | null
}

export type MediaViewerTargetType = 'PLAYER' | 'TEAM' | 'GAME'

export function useTargetMediaViewer(
  media: TargetMediaItem[],
  targetType: MediaViewerTargetType,
  targetId: string | undefined,
) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const mediaItems = useMemo<TargetVideoItem[]>(
    () =>
      media.flatMap((m) =>
        m.youtubeVideoId
          ? [{ id: m.id, youtubeVideoId: m.youtubeVideoId, title: m.title }]
          : []
      ),
    [media]
  )
  const viewerItems = useMemo(
    () => targetId ? toViewerItemsForTarget(mediaItems, targetType, targetId) : [],
    [mediaItems, targetId, targetType]
  )

  return {
    mediaItems,
    viewerIndex,
    setViewerIndex,
    viewerProps: {
      visible: viewerIndex != null,
      items: viewerItems,
      initialIndex: viewerIndex ?? 0,
      onClose: () => setViewerIndex(null),
    },
  }
}
