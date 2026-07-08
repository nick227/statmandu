import { Link } from 'expo-router'
import type { components } from '@statman/sdk'
import { useSportTheme } from '@/lib/theme'
import { EntityTile } from '@/shared/ui/EntityTile'

type Team = components['schemas']['Team']

export interface TeamCardLinkProps {
  team: Team
  className?: string
}

export function TeamCardLink({ team, className }: TeamCardLinkProps) {
  const sportTheme = useSportTheme(team.sport?.slug)
  return (
    <Link href={{ pathname: '/teams/[teamId]', params: { teamId: team.id } }} asChild>
      <EntityTile
        name={team.name}
        imageUri={team.logoUrl}
        meta={[team.league?.name, team.city].filter(Boolean).join(' · ')}
        stat={team.sport?.name}
        className={className}
        style={sportTheme}
      />
    </Link>
  )
}
