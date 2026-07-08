import type { components } from '@statman/sdk'
import type { FullScreenMediaItem } from '@/shared/media/FullScreenMediaViewer'
import { isMediaTargetType, mediaFilmLabel } from '@/shared/media/mediaLabels'

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
