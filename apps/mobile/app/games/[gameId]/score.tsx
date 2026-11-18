import { useLocalSearchParams } from 'expo-router'
import { ConnectedHistoricalScoreScreen } from '@/modules/live-scoring/ConnectedHistoricalScoreScreen'

export default function HistoricalScoreRoute() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>()
  return <ConnectedHistoricalScoreScreen gameId={gameId} />
}
