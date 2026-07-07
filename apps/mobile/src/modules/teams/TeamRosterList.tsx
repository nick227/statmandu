import { View, Pressable } from 'react-native'
import { Link } from 'expo-router'
import type { components } from '@statman/sdk'
import { Avatar } from '@/shared/ui/Avatar'
import { Text } from '@/shared/ui/Text'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Users } from 'lucide-react-native'

type RosterMembership = components['schemas']['RosterMembership']

export interface TeamRosterListProps {
  memberships: RosterMembership[]
  className?: string
}

export function TeamRosterList({ memberships, className }: TeamRosterListProps) {
  if (memberships.length === 0) {
    return <EmptyState icon={Users} title="No roster yet" description="Players will appear here once added." />
  }

  return (
    <View className={className}>
      {memberships.map((m) => {
        const name = `${m.player.athleteProfile.firstName} ${m.player.athleteProfile.lastName}`
        return (
          <Link key={m.id} href={{ pathname: '/players/[playerId]', params: { playerId: m.player.id } }} asChild>
            <Pressable className="flex-row items-center gap-md px-lg py-sm border-b border-border">
              <Text variant="caption" className="w-8 text-center">{m.jerseyNumber ?? m.player.jerseyNumber ?? '-'}</Text>
              <Avatar uri={m.player.athleteProfile.avatarUrl} fallback={name} size="sm" />
              <View className="flex-1">
                <Text className="font-semibold">{name}</Text>
                {m.player.position ? <Text variant="caption">{m.player.position}</Text> : null}
              </View>
            </Pressable>
          </Link>
        )
      })}
    </View>
  )
}
