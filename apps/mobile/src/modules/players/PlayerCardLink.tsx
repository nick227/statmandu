import { Pressable, View } from 'react-native'
import { Link } from 'expo-router'
import type { components } from '@statman/sdk'
import { Avatar } from '@/shared/ui/Avatar'
import { Text } from '@/shared/ui/Text'

type Player = components['schemas']['Player']

export interface PlayerCardLinkProps {
  player: Player
  className?: string
}

export function PlayerCardLink({ player, className }: PlayerCardLinkProps) {
  const { athleteProfile, currentTeam, position, jerseyNumber } = player
  const name = `${athleteProfile.firstName} ${athleteProfile.lastName}`
  const subtitle = [currentTeam?.name, position, jerseyNumber ? `#${jerseyNumber}` : null]
    .filter(Boolean)
    .join(' · ')

  return (
    <Link href={{ pathname: '/players/[playerId]', params: { playerId: player.id } }} asChild>
      <Pressable className={className}>
        <View className="items-center gap-sm w-24">
          <Avatar uri={athleteProfile.avatarUrl} fallback={name} size="lg" />
          <Text className="font-semibold text-center" numberOfLines={1}>{name}</Text>
          {subtitle ? <Text variant="caption" className="text-center" numberOfLines={1}>{subtitle}</Text> : null}
        </View>
      </Pressable>
    </Link>
  )
}
