import type { components } from '@statman/sdk'
import { SidebarBrandPanel, SidebarRail, SidebarSearchList, type SidebarHref, type SidebarListItem } from '@/shared/layout'

type MediaAsset = components['schemas']['MediaAsset']
type EntityType = components['schemas']['EntityType']

function targetHref(targetType: EntityType, targetId: string): SidebarHref {
  if (targetType === 'PLAYER') return { pathname: '/players/[playerId]', params: { playerId: targetId } }
  if (targetType === 'TEAM') return { pathname: '/teams/[teamId]', params: { teamId: targetId } }
  if (targetType === 'GAME') return { pathname: '/games/[gameId]', params: { gameId: targetId } }
  return { pathname: '/(tabs)/videos' }
}

export function VideosSidebar({ videos }: { videos: MediaAsset[] }) {
  const items: SidebarListItem[] = videos.slice(0, 16).map((video) => ({
    id: `video:${video.id}`,
    section: video.targetType,
    title: video.title ?? 'Highlight',
    meta: new Date(video.createdAt).toLocaleDateString(),
    href: targetHref(video.targetType, video.targetId),
  }))

  return (
    <SidebarRail>
      <SidebarBrandPanel title="Video board" subtitle="Swipe highlights, then jump to the athlete, team, or game." />
      <SidebarSearchList title="Latest highlights" subtitle="Filter by target type." items={items} maxItems={10} />
    </SidebarRail>
  )
}

