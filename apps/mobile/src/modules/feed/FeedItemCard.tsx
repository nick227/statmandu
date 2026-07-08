import type { components } from '@statman/sdk'
import { Link } from 'expo-router'
import { DiscoveryCard } from './DiscoveryCard'

type FeedItem = components['schemas']['FeedItem']

function feedHref(item: FeedItem) {
  switch (item.targetType) {
    case 'PLAYER':
      return { pathname: '/players/[playerId]' as const, params: { playerId: item.targetId } }
    case 'TEAM':
      return { pathname: '/teams/[teamId]' as const, params: { teamId: item.targetId } }
    case 'GAME':
      return { pathname: '/games/[gameId]' as const, params: { gameId: item.targetId } }
    default:
      return null
  }
}

export interface FeedItemCardProps {
  item: FeedItem
  index?: number
  className?: string
}

export function FeedItemCard({ item, index = 0 }: FeedItemCardProps) {
  const href = feedHref(item)
  if (!href) return <DiscoveryCard item={item} index={index} />

  return (
    <Link href={href} asChild>
      <DiscoveryCard item={item} index={index} />
    </Link>
  )
}
