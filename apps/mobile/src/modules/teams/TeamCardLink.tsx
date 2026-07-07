import { Pressable, View } from 'react-native'
import { Link } from 'expo-router'
import type { components } from '@statman/sdk'
import { Avatar } from '@/shared/ui/Avatar'
import { Text } from '@/shared/ui/Text'

type Team = components['schemas']['Team']

export interface TeamCardLinkProps {
  team: Team
  className?: string
}

export function TeamCardLink({ team, className }: TeamCardLinkProps) {
  return (
    <Link href={{ pathname: '/teams/[teamId]', params: { teamId: team.id } }} asChild>
      <Pressable className={className}>
        <View className="items-center gap-sm w-24">
          <Avatar uri={team.logoUrl} fallback={team.name} size="lg" />
          <Text className="font-semibold text-center" numberOfLines={1}>{team.name}</Text>
          {team.city ? <Text variant="caption" className="text-center" numberOfLines={1}>{team.city}</Text> : null}
        </View>
      </Pressable>
    </Link>
  )
}
