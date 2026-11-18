import type { components } from '@statman/sdk'
import type { FullScreenMediaItem } from '@/shared/media/FullScreenMediaViewer'
import { isMediaTargetType, mediaFilmLabel, type MediaTargetType } from '@/shared/media/mediaLabels'

type MediaAsset = components['schemas']['MediaAsset']

export function toViewerItems(assets: MediaAsset[]): FullScreenMediaItem[] {
  return assets.map((item) => ({
    id: item.id,
    kind: 'video' as const,
    youtubeVideoId: item.youtubeVideoId,
    title: item.title,
    targetType: isMediaTargetType(item.targetType) ? item.targetType : undefined,
    targetId: isMediaTargetType(item.targetType) ? item.targetId : undefined,
    filmLabel: isMediaTargetType(item.targetType) ? mediaFilmLabel(item.targetType) : 'Video',
  }))
}

type SourceGalleryItem =
  | { id: string; kind: 'video'; youtubeVideoId: string; title?: string | null }
  | { id: string; kind: 'photo'; imageUri: string; title?: string | null }

export function toViewerItemsForTarget(
  items: SourceGalleryItem[],
  targetType: MediaTargetType,
  targetId: string
): FullScreenMediaItem[] {
  return items.map((item) =>
    item.kind === 'video'
      ? { id: item.id, kind: 'video' as const, youtubeVideoId: item.youtubeVideoId, title: item.title, targetType, targetId, filmLabel: mediaFilmLabel(targetType) }
      : { id: item.id, kind: 'photo' as const, imageUri: item.imageUri, title: item.title, targetType, targetId, filmLabel: mediaFilmLabel(targetType) }
  )
}
