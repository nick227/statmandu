import { Link } from 'expo-router'
import type { components } from '@statman/sdk'
import { useSportTheme } from '@/lib/theme'
import { AthleteCard } from '@/modules/players/AthleteCard'

type Player = components['schemas']['Player']

export interface PlayerCardLinkProps {
  player: Player
  className?: string
}

export function PlayerCardLink({ player, className }: PlayerCardLinkProps) {
  const sportTheme = useSportTheme(player.sport?.slug)

  return (
    <Link href={{ pathname: '/players/[playerId]', params: { playerId: player.id } }} asChild>
      <AthleteCard player={player} className={className} style={sportTheme} />
    </Link>
  )
}
