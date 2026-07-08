import { View, TouchableOpacity } from 'react-native'
import { Text } from '@/shared/ui/Text'
import { useSpectatorGameReaction } from '@/modules/live-scoring/useSpectatorGameReaction'

export interface SpectatorReactionToolbarProps {
  gameId: string
}

export function SpectatorReactionToolbar({ gameId }: SpectatorReactionToolbarProps) {
  const { isSending, sendReaction } = useSpectatorGameReaction(gameId)

  const handleReaction = async (type: 'LIKE' | 'FIRE' | 'CLAP') => {
    try {
      await sendReaction(type)
    } catch (e) {
      console.error('Failed to submit reaction', e)
    }
  }

  return (
    <View className="flex-row items-center justify-center gap-xl py-md border-t border-border bg-canvas/90">
      <TouchableOpacity 
        onPress={() => handleReaction('LIKE')}
        disabled={isSending}
        className="h-16 w-16 items-center justify-center bg-gray-800 rounded-full border border-gray-700"
      >
        <Text className="text-3xl">👍</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => handleReaction('FIRE')}
        disabled={isSending}
        className="h-16 w-16 items-center justify-center bg-gray-800 rounded-full border border-gray-700"
      >
        <Text className="text-3xl">🔥</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => handleReaction('CLAP')}
        disabled={isSending}
        className="h-16 w-16 items-center justify-center bg-gray-800 rounded-full border border-gray-700"
      >
        <Text className="text-3xl">👏</Text>
      </TouchableOpacity>
    </View>
  )
}
