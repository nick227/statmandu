import { Pressable, View } from 'react-native'
import { Flame, ThumbsUp, PartyPopper } from 'lucide-react-native'
import { useReactionCounts, useCreateReaction } from '@statman/sdk'
import { Text } from '@/components/ui/Text'

type ReactionType = 'LIKE' | 'FIRE' | 'CLAP'

const REACTIONS: Array<{ type: ReactionType; icon: typeof Flame }> = [
  { type: 'LIKE', icon: ThumbsUp },
  { type: 'FIRE', icon: Flame },
  { type: 'CLAP', icon: PartyPopper },
]

export interface ReactionBarProps {
  targetType: 'PLAYER' | 'TEAM' | 'GAME'
  targetId: string
  className?: string
}

// Self-contained, same rationale as FollowButton — see docs/frontend-architecture.md.
export function ReactionBar({ targetType, targetId, className }: ReactionBarProps) {
  const { data } = useReactionCounts(targetType, targetId)
  const react = useCreateReaction()

  return (
    <View className={className ?? 'flex-row gap-lg'}>
      {REACTIONS.map(({ type, icon: Icon }) => (
        <Pressable
          key={type}
          className="flex-row items-center gap-xs"
          onPress={() => react.mutate({ targetType, targetId, type })}
        >
          <Icon size={18} color="rgb(107 114 128)" />
          <Text variant="caption">{data?.data.byType[type] ?? 0}</Text>
        </Pressable>
      ))}
    </View>
  )
}
