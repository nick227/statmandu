import { Pressable, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Flame, ThumbsUp, PartyPopper } from 'lucide-react-native'
import { useCurrentUser, useReactionCounts, useCreateReaction } from '@statman/sdk'
import { useNativeColor } from '@/lib/theme'
import { Text } from '@/shared/ui/Text'

type ReactionType = 'LIKE' | 'FIRE' | 'CLAP'

const REACTIONS: Array<{ type: ReactionType; icon: typeof Flame }> = [
  { type: 'LIKE', icon: ThumbsUp },
  { type: 'FIRE', icon: Flame },
  { type: 'CLAP', icon: PartyPopper },
]

export interface ConnectedReactionBarProps {
  targetType: 'PLAYER' | 'TEAM' | 'GAME'
  targetId: string
  className?: string
}

export function ConnectedReactionBar({ targetType, targetId, className }: ConnectedReactionBarProps) {
  const router = useRouter()
  const { data: me } = useCurrentUser()
  const { data } = useReactionCounts(targetType, targetId)
  const react = useCreateReaction()
  const mutedTextColor = useNativeColor('mutedText')

  return (
    <View className={className ?? 'flex-row gap-lg'}>
      {REACTIONS.map(({ type, icon: Icon }) => (
        <Pressable
          key={type}
          className="flex-row items-center gap-xs py-sm"
          hitSlop={8}
          onPress={() => (me ? react.mutate({ targetType, targetId, type }) : router.push('/login'))}
        >
          <Icon size={18} color={mutedTextColor} />
          <Text variant="caption">{data?.data.byType[type] ?? 0}</Text>
        </Pressable>
      ))}
    </View>
  )
}
