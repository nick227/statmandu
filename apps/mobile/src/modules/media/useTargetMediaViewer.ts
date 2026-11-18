import { useMemo, useState } from 'react'
import { toViewerItemsForTarget } from './mediaViewerItem'

export interface TargetMediaItem {
  id: string
  youtubeVideoId?: string | null
  title?: string | null
  createdAt?: string
}

export interface TargetImageItem {
  id: string
  url: string
  title?: string | null
  createdAt?: string
}

export type TargetGalleryItem =
  | { id: string; kind: 'video'; youtubeVideoId: string; title?: string | null; createdAt?: string }
  | { id: string; kind: 'photo'; imageUri: string; title?: string | null; createdAt?: string }

export type MediaViewerTargetType = 'PLAYER' | 'TEAM' | 'GAME'

// Merges video (MediaAsset) and photo (ImageAsset, usage=GALLERY) sources
// into one recency-ordered, kind-tagged list feeding the hero carousel,
// media grid, and full-screen viewer alike — `images` is optional so
// existing video-only callers (Team, Game) are unaffected.
export function useTargetMediaViewer(
  media: TargetMediaItem[],
  targetType: MediaViewerTargetType,
  targetId: string | undefined,
  images: TargetImageItem[] = []
) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const mediaItems = useMemo<TargetGalleryItem[]>(() => {
    const videos: TargetGalleryItem[] = media.flatMap((m) =>
      m.youtubeVideoId
        ? [{ id: m.id, kind: 'video' as const, youtubeVideoId: m.youtubeVideoId, title: m.title, createdAt: m.createdAt }]
        : []
    )
    const photos: TargetGalleryItem[] = images.map((img) => ({
      id: img.id,
      kind: 'photo' as const,
      imageUri: img.url,
      title: img.title,
      createdAt: img.createdAt,
    }))
    return [...videos, ...photos].sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [media, images])
  const viewerItems = useMemo(
    () => (targetId ? toViewerItemsForTarget(mediaItems, targetType, targetId) : []),
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
