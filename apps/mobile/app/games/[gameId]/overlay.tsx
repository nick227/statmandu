import { useLocalSearchParams } from 'expo-router'
import { OverlayScorebugScreen } from '@/modules/live-scoring/OverlayScorebugScreen'

export default function GameOverlayRoute() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>()
  return <OverlayScorebugScreen gameId={gameId} />
}
