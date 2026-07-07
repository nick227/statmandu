import { useLocalSearchParams } from 'expo-router'
import { GameSpectateScreen } from '@/modules/games/GameSpectateScreen'

export default function GameSpectateRoute() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>()
  return <GameSpectateScreen gameId={gameId} />
}
