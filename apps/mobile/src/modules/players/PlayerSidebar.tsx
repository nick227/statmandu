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

type Player = components['schemas']['Player']
type AthleteProfile = components['schemas']['AthleteProfile']
type GameStatLine = components['schemas']['GameStatLine']
type MediaAsset = components['schemas']['MediaAsset']
type Game = components['schemas']['Game']

export interface PlayerSidebarProps {
  player: Player
  profile: AthleteProfile
  games: GameStatLine[]
  media: MediaAsset[]
  lastGame?: Game
  seasonHighPoints: number | null
}

export function PlayerSidebar({
  player,
  profile,
  games,
  media,
  lastGame,
  seasonHighPoints,
}: PlayerSidebarProps) {
  const name = `${profile.firstName} ${profile.lastName}`
  const team = player.currentTeam
  const items: SidebarListItem[] = []

  if (lastGame) {
    const opponent =
      lastGame.gameTeams.find((gt) => gt.teamId !== team?.id)?.team?.name ?? 'Opponent'
    items.push({
      id: `player-game:${lastGame.id}`,
      section: 'Games',
      title: `vs ${opponent}`,
      meta: new Date(lastGame.scheduledAt).toLocaleDateString(),
      href: { pathname: '/games/[gameId]', params: { gameId: lastGame.id } },
    })
  }

  for (const line of games.slice(0, 4)) {
    if (lastGame && line.gameId === lastGame.id) continue
    items.push({
      id: `player-line:${line.id}`,
      section: 'Games',
      title: line.gameOpponentName ?? 'Recent game',
      meta: `${line.points} pts · ${new Date(line.gameScheduledAt).toLocaleDateString()}`,
      href: { pathname: '/games/[gameId]', params: { gameId: line.gameId } },
    })
  }

  for (const asset of media.slice(0, 4)) {
    items.push({
      id: `player-media:${asset.id}`,
      section: 'Videos',
      title: asset.title ?? 'Highlight',
      meta: asset.targetType,
      href: { pathname: '/videos' },
    })
  }

  if (team) {
    items.push({
      id: `player-team:${team.id}`,
      section: 'Team',
      title: team.name,
      meta: [player.position, player.jerseyNumber != null ? `#${player.jerseyNumber}` : null]
        .filter(Boolean)
        .join(' · '),
      href: { pathname: '/teams/[teamId]', params: { teamId: team.id } },
    })
  }

  return (
    <SidebarRail>
      <SidebarBrandPanel
        title={name}
        subtitle={[player.position, team?.name].filter(Boolean).join(' · ') || 'Athlete profile'}
      />

      <SidebarPanel title="At a glance">
        {seasonHighPoints != null ? <SidebarGlanceRow label="Season high" value={`${seasonHighPoints} pts`} /> : null}
        <SidebarGlanceRow label="Status" value={profile.sourceStatus.replaceAll('_', ' ')} />
        {profile.hometown ? <SidebarGlanceRow label="Hometown" value={profile.hometown} /> : null}
        {!profile.claimedByUserId ? (
          <SidebarActionRow
            title="Claim this profile"
            meta="Manage media, bio, and verified identity."
            href={{ pathname: '/players/[playerId]/claim', params: { playerId: player.id } }}
          />
        ) : null}
        {team ? (
          <SidebarActionRow
            title={`Open ${team.name}`}
            meta="Roster, games, and team video."
            href={{ pathname: '/teams/[teamId]', params: { teamId: team.id } }}
          />
        ) : null}
      </SidebarPanel>

      <SidebarAdSlot
        sponsoredLabel="Sponsored"
        sponsor="Statman partners"
        headline={`Gear up for ${name}'s season`}
        body="Local sponsors · verified venues · next-game visibility."
        cta="Learn more"
      />

      <SidebarSearchList
        title="Next up"
        subtitle="Games, video, and related team."
        items={items}
        filters={['All', 'Games', 'Videos', 'Team']}
      />
    </SidebarRail>
  )
}
