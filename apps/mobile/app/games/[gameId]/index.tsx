import { useLocalSearchParams } from 'expo-router'
import { GameDetailScreen } from '@/modules/games/GameDetailScreen'

export default function GameDetailRoute() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>()
  return <GameDetailScreen gameId={gameId} />
}
