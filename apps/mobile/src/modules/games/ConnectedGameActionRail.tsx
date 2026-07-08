import { Share } from 'react-native'
import { useRouter } from 'expo-router'
import { Heart, MessageCircle, Share2 } from 'lucide-react-native'
import { useCreateReaction, useCurrentUser, useReactionCounts } from '@statman/sdk'
import { FloatingActionRail, FloatingIconButton } from '@/shared/layout'

export interface ConnectedGameActionRailProps {
  gameId: string
  title: string
}

export function ConnectedGameActionRail({ gameId, title }: ConnectedGameActionRailProps) {
  const router = useRouter()
  const { data: me } = useCurrentUser()
  const { data } = useReactionCounts('GAME', gameId)
  const react = useCreateReaction()
  const likeCount = data?.data.byType.LIKE ?? 0

  return (
    <FloatingActionRail>
      <FloatingIconButton
        icon={Heart}
        label={likeCount > 0 ? String(likeCount) : 'Like'}
        onPress={() => (me ? react.mutate({ targetType: 'GAME', targetId: gameId, type: 'LIKE' }) : router.push('/login'))}
      />
      <FloatingIconButton
        icon={MessageCircle}
        label="Talk"
        onPress={() => router.push({ pathname: '/games/[gameId]/spectate', params: { gameId } })}
      />
      <FloatingIconButton
        icon={Share2}
        label="Share"
        onPress={() => {
          Share.share({ message: title })
        }}
      />
    </FloatingActionRail>
  )
}
