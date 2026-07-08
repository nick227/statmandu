import { useLocalSearchParams } from 'expo-router'
import { PlayerProfileScreen } from '@/modules/players/PlayerProfileScreen'

export default function PlayerProfileRoute() {
  const { playerId } = useLocalSearchParams<{ playerId: string }>()
  return <PlayerProfileScreen playerId={playerId} />
}
