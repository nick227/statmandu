import { useLocalSearchParams } from 'expo-router'
import { TeamProfileScreen } from '@/modules/teams/TeamProfileScreen'

export default function TeamProfileRoute() {
  const { teamId } = useLocalSearchParams<{ teamId: string }>()
  return <TeamProfileScreen teamId={teamId} />
}
