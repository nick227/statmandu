import { View } from 'react-native'
import type { components } from '@statman/sdk'
import { Trophy, Video, UserCheck, Gavel, TrendingUp, UserPlus } from 'lucide-react-native'
import { Card, CardContent } from '@/shared/ui/Card'
import { Text } from '@/shared/ui/Text'

type FeedItem = components['schemas']['FeedItem']

const ICON: Record<string, typeof Trophy> = {
  GAME_FINAL: Trophy,
  STAT_MILESTONE: TrendingUp,
  MEDIA_ADDED: Video,
  PLAYER_JOINED_TEAM: UserPlus,
  PROFILE_CLAIMED: UserCheck,
  DISPUTE_RESOLVED: Gavel,
}

export interface FeedItemCardProps {
  item: FeedItem
  className?: string
}

// One card per feed item type — "creative module rhythm, not identical cards
// only" per docs is achieved by varying the icon/tone, not the card shape.
export function FeedItemCard({ item, className }: FeedItemCardProps) {
  const Icon = ICON[item.type] ?? Trophy

  return (
    <Card className={className}>
      <CardContent className="flex-row items-center gap-md">
        <Icon size={20} color="rgb(29 78 216)" />
        <View className="flex-1">
          <Text>{item.summary}</Text>
          <Text variant="caption">{new Date(item.occurredAt).toLocaleString()}</Text>
        </View>
      </CardContent>
    </Card>
  )
}
