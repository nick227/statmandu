import type { components } from '@statman/sdk'
import {
  SidebarActionRow,
  SidebarAdSlot,
  SidebarBrandPanel,
  SidebarGlanceRow,
  SidebarPanel,
  SidebarRail,
  SidebarSearchList,
  type SidebarListItem,
} from '@/shared/layout'

type Team = components['schemas']['Team']
type RosterMembership = components['schemas']['RosterMembership']
type Game = components['schemas']['Game']
type MediaAsset = components['schemas']['MediaAsset']

export interface TeamSidebarProps {
  team: Team
  roster: RosterMembership[]
  games: Game[]
  media: MediaAsset[]
}

export function TeamSidebar({ team, roster, games, media }: TeamSidebarProps) {
  const upcoming = games.find((g) => g.status === 'SCHEDULED' || g.status === 'LIVE')
  const recent = games.filter((g) => g.status === 'FINAL').slice(0, 3)
  const leaders = roster.slice(0, 5)
  const items: SidebarListItem[] = []

  for (const membership of leaders) {
    const player = membership.player
    const profile = player?.athleteProfile
    if (!player || !profile) continue
    items.push({
      id: `team-roster:${player.id}`,
      section: 'Roster',
      title: `${profile.firstName} ${profile.lastName}`,
      meta: [membership.jerseyNumber != null ? `#${membership.jerseyNumber}` : null, player.position]
        .filter(Boolean)
        .join(' · '),
      href: { pathname: '/players/[playerId]', params: { playerId: player.id } },
    })
  }

  for (const game of [upcoming, ...recent].filter(Boolean) as Game[]) {
    const opponent = game.gameTeams.find((gt) => gt.teamId !== team.id)?.team?.name ?? 'Opponent'
    items.push({
      id: `team-game:${game.id}`,
      section: 'Games',
      title: `vs ${opponent}`,
      meta: `${game.status} · ${new Date(game.scheduledAt).toLocaleDateString()}`,
      href: { pathname: '/games/[gameId]', params: { gameId: game.id } },
    })
  }

  for (const asset of media.slice(0, 3)) {
    items.push({
      id: `team-media:${asset.id}`,
      section: 'Videos',
      title: asset.title ?? 'Team video',
      meta: asset.targetType,
      href: { pathname: '/videos' },
    })
  }

  return (
    <SidebarRail>
      <SidebarBrandPanel
        title={team.name}
        subtitle={[team.league?.name, team.city].filter(Boolean).join(' · ') || 'Team profile'}
      />

      <SidebarPanel title="Quick jumps">
        <SidebarGlanceRow label="Roster" value={`${roster.length} athletes`} />
        {upcoming ? (
          <SidebarActionRow
            title="Next game"
            meta={new Date(upcoming.scheduledAt).toLocaleDateString()}
            href={{ pathname: '/games/[gameId]', params: { gameId: upcoming.id } }}
          />
        ) : null}
        <SidebarActionRow
          title="Browse videos"
          meta="Highlights attached to this team."
          href={{ pathname: '/videos' }}
        />
      </SidebarPanel>

      <SidebarAdSlot
        sponsoredLabel="Sponsored"
        sponsor="Statman partners"
        headline={`Support ${team.name}`}
        body="Local gear · ticket partners · community sponsors."
        cta="Partner with us"
      />

      <SidebarSearchList
        title="Team board"
        subtitle="Roster leaders, games, and video."
        items={items}
        filters={['All', 'Roster', 'Games', 'Videos']}
      />
    </SidebarRail>
  )
}
