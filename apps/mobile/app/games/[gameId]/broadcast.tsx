import { useLocalSearchParams } from 'expo-router'
import { BroadcastDisplayScreen } from '@/modules/live-scoring/BroadcastDisplayScreen'

export default function GameBroadcastRoute() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>()
  return <BroadcastDisplayScreen gameId={gameId} />
}
