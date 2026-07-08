import { Link } from 'expo-router'
import type { components } from '@statman/sdk'
import { useSportTheme } from '@/lib/theme'
import { EntityTile } from '@/shared/ui/EntityTile'

type Player = components['schemas']['Player']

export interface PlayerCardLinkProps {
  player: Player
  className?: string
}

export function PlayerCardLink({ player, className }: PlayerCardLinkProps) {
  const sportTheme = useSportTheme(player.sport?.slug)
  const { athleteProfile, currentTeam, position, jerseyNumber } = player
  const name = `${athleteProfile.firstName} ${athleteProfile.lastName}`
  const subtitle = [currentTeam?.name, position, jerseyNumber ? `#${jerseyNumber}` : null]
    .filter(Boolean)
    .join(' · ')

  return (
    <Link href={{ pathname: '/players/[playerId]', params: { playerId: player.id } }} asChild>
      <EntityTile
        name={name}
        imageUri={athleteProfile.avatarUrl}
        meta={subtitle}
        stat={player.sport?.name}
        className={className}
        style={sportTheme}
      />
    </Link>
  )
}
