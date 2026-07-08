import type { components } from '@statman/sdk'
import type { FullScreenMediaItem } from '@/shared/media/FullScreenMediaViewer'
import { isMediaTargetType, mediaFilmLabel, type MediaTargetType } from '@/shared/media/mediaLabels'

type MediaAsset = components['schemas']['MediaAsset']

export function toViewerItems(assets: MediaAsset[]): FullScreenMediaItem[] {
  return assets.map((item) => ({
    id: item.id,
    youtubeVideoId: item.youtubeVideoId,
    title: item.title,
    targetType: isMediaTargetType(item.targetType) ? item.targetType : undefined,
    targetId: isMediaTargetType(item.targetType) ? item.targetId : undefined,
    filmLabel: isMediaTargetType(item.targetType) ? mediaFilmLabel(item.targetType) : 'Video',
  }))
}

export function toViewerItemsForTarget(
  items: Array<{ id: string; youtubeVideoId: string; title?: string | null }>,
  targetType: MediaTargetType,
  targetId: string
): FullScreenMediaItem[] {
  return items.map((item) => ({
    id: item.id,
    youtubeVideoId: item.youtubeVideoId,
    title: item.title,
    targetType,
    targetId,
    filmLabel: mediaFilmLabel(targetType),
  }))
}
