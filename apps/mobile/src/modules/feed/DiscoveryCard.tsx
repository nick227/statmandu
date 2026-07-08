import type { components } from '@statman/sdk'
import { Gavel, Trophy, TrendingUp, UserCheck, UserPlus, Video } from 'lucide-react-native'
import { View, type PressableProps } from 'react-native'
import { Text } from '@/shared/ui/Text'
import { SpotlightCard } from '@/shared/ui/SpotlightCard'

type FeedItem = components['schemas']['FeedItem']

const ICON: Record<string, typeof Trophy> = {
  GAME_FINAL: Trophy,
  STAT_MILESTONE: TrendingUp,
  MEDIA_ADDED: Video,
  PLAYER_JOINED_TEAM: UserPlus,
  PROFILE_CLAIMED: UserCheck,
  DISPUTE_RESOLVED: Gavel,
}

const LABEL: Record<string, string> = {
  GAME_FINAL: 'Final',
  STAT_MILESTONE: 'Milestone',
  MEDIA_ADDED: 'Highlight',
  PLAYER_JOINED_TEAM: 'Roster',
  PROFILE_CLAIMED: 'Verified',
  DISPUTE_RESOLVED: 'Resolved',
}

export interface DiscoveryCardProps extends PressableProps {
  item: FeedItem
  index: number
}

export function DiscoveryCard({ item, index, className, ...props }: DiscoveryCardProps) {
  const Icon = ICON[item.type] ?? Trophy
  const size = index % 4 === 0 ? 'large' : 'small'
  const occurredAt = new Date(item.occurredAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

  return (
    <SpotlightCard
      size={size}
      kind="activity"
      eyebrow={LABEL[item.type] ?? 'Update'}
      title={item.summary}
      subtitle={item.targetType.replace(/_/g, ' ').toLowerCase()}
      badge={
        <View className="rounded-pill bg-white/10 px-sm py-xs">
          <Icon size={14} color="#FFFFFF" />
        </View>
      }
      footer={<Text variant="caption" className="text-white/55">{occurredAt}</Text>}
      className={className}
      {...props}
    />
  )
}
