import { useLocalSearchParams } from 'expo-router'
import { PlayerClaimScreen } from '@/modules/players/PlayerClaimScreen'

export default function PlayerClaimRoute() {
  const { playerId } = useLocalSearchParams<{ playerId: string }>()
  return <PlayerClaimScreen playerId={playerId} />
}
