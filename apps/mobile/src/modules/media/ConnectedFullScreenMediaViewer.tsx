import { useRouter } from 'expo-router'
import type { components } from '@statman/sdk'
import { FullScreenMediaViewer, type FullScreenMediaItem, type FullScreenMediaViewerProps } from '@/shared/media/FullScreenMediaViewer'
import { mediaTargetActionLabel } from '@/shared/media/mediaLabels'
import { mediaTargetHref } from '@/shared/media/videoTarget'
import { toViewerItems } from '@/modules/media/mediaViewerItem'

type MediaAsset = components['schemas']['MediaAsset']

type ConnectedFullScreenMediaViewerProps = Omit<FullScreenMediaViewerProps, 'items' | 'onViewTarget' | 'getTargetActionLabel'> & {
  items: MediaAsset[] | FullScreenMediaItem[]
}

function isMediaAsset(item: MediaAsset | FullScreenMediaItem): item is MediaAsset {
  return 'targetType' in item && typeof item.targetType === 'string'
}

function normalizeViewerItems(items: MediaAsset[] | FullScreenMediaItem[]): FullScreenMediaItem[] {
  if (items.length === 0) return []
  return isMediaAsset(items[0]!) ? toViewerItems(items as MediaAsset[]) : (items as FullScreenMediaItem[])
}

export function ConnectedFullScreenMediaViewer({ items, ...props }: ConnectedFullScreenMediaViewerProps) {
  const router = useRouter()
  const viewerItems = normalizeViewerItems(items)

  return (
    <FullScreenMediaViewer
      {...props}
      items={viewerItems}
      onViewTarget={(item) => {
        if (!item.targetType || !item.targetId) return
        const href = mediaTargetHref(item.targetType, item.targetId)
        if (href) router.push(href)
      }}
      getTargetActionLabel={(item) => (item.targetType ? mediaTargetActionLabel(item.targetType) : null)}
    />
  )
}
