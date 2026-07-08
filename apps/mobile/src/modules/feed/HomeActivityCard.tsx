import { View } from 'react-native'
import { Gavel, Trophy, TrendingUp, UserCheck, UserPlus, Video } from 'lucide-react-native'
import type { HomeActivityIcon, HomeMockActivity } from '@/modules/feed/homeContent'
import { Text } from '@/shared/ui/Text'
import { SpotlightCard } from '@/shared/ui/SpotlightCard'

const ICON: Record<HomeActivityIcon, typeof Trophy> = {
  GAME_FINAL: Trophy,
  STAT_MILESTONE: TrendingUp,
  MEDIA_ADDED: Video,
  PLAYER_JOINED_TEAM: UserPlus,
  PROFILE_CLAIMED: UserCheck,
  DISPUTE_RESOLVED: Gavel,
  COMMUNITY: TrendingUp,
} as const

export function HomeActivityCard({ item, large }: { item: HomeMockActivity; large?: boolean }) {
  const Icon = ICON[item.icon]
  return (
    <SpotlightCard
      size={large ? 'large' : 'small'}
      kind="activity"
      eyebrow={item.eyebrow}
      title={item.title}
      subtitle={item.subtitle}
      badge={
        <View className="rounded-pill bg-white/10 px-sm py-xs">
          <Icon size={14} color="#FFFFFF" />
        </View>
      }
      footer={<Text variant="caption" className="text-white/55">{item.timestamp}</Text>}
    />
  )
}
