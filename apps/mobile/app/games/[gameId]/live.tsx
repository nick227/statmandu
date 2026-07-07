import { useLocalSearchParams } from 'expo-router'
import { LiveScoringSessionScreen } from '@/modules/live-scoring/LiveScoringSessionScreen'

export default function LiveScoringSessionRoute() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>()
  return <LiveScoringSessionScreen gameId={gameId} />
}
