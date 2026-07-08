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

type Game = components['schemas']['Game']
type GameStatLine = components['schemas']['GameStatLine']
type MediaAsset = components['schemas']['MediaAsset']

export interface GameSidebarProps {
  game: Game
  topPerformers: GameStatLine[]
  media: MediaAsset[]
  performerMeta: (line: GameStatLine) => string
}

export function GameSidebar({ game, topPerformers, media, performerMeta }: GameSidebarProps) {
  const home = game.gameTeams.find((gt) => gt.isHome)
  const away = game.gameTeams.find((gt) => !gt.isHome)
  const homeName = home?.team?.name ?? 'Home'
  const awayName = away?.team?.name ?? 'Away'
  const score = `${home?.finalScore ?? 0} – ${away?.finalScore ?? 0}`
  const items: SidebarListItem[] = []

  for (const line of topPerformers) {
    items.push({
      id: `game-performer:${line.id}`,
      section: 'Leaders',
      title: line.playerName,
      meta: performerMeta(line),
      href: { pathname: '/players/[playerId]', params: { playerId: line.playerId } },
    })
  }

  if (home?.team) {
    items.push({
      id: `game-team-home:${home.team.id}`,
      section: 'Teams',
      title: homeName,
      meta: 'Home',
      href: { pathname: '/teams/[teamId]', params: { teamId: home.team.id } },
    })
  }
  if (away?.team) {
    items.push({
      id: `game-team-away:${away.team.id}`,
      section: 'Teams',
      title: awayName,
      meta: 'Away',
      href: { pathname: '/teams/[teamId]', params: { teamId: away.team.id } },
    })
  }

  for (const asset of media.slice(0, 4)) {
    items.push({
      id: `game-media:${asset.id}`,
      section: 'Videos',
      title: asset.title ?? 'Game video',
      meta: asset.targetType,
      href: { pathname: '/(tabs)/videos' },
    })
  }

  const isLiveOrUpcoming = game.status === 'LIVE' || game.status === 'SCHEDULED'

  return (
    <SidebarRail>
      <SidebarBrandPanel title={`${homeName} vs ${awayName}`} subtitle={`${game.status} · ${score}`} />

      <SidebarPanel title="Live actions">
        <SidebarGlanceRow label="Scheduled" value={new Date(game.scheduledAt).toLocaleDateString()} />
        {game.venue ? <SidebarGlanceRow label="Venue" value={game.venue} /> : null}
        {isLiveOrUpcoming ? (
          <SidebarActionRow
            title="Enter stats"
            meta="Join as scorer or contributor."
            href={{ pathname: '/games/[gameId]/live', params: { gameId: game.id } }}
          />
        ) : null}
        <SidebarActionRow
          title="Watch live"
          meta="Spectator timeline and reactions."
          href={{ pathname: '/games/[gameId]/spectate', params: { gameId: game.id } }}
        />
        {isLiveOrUpcoming ? (
          <SidebarActionRow
            title="Cast to display"
            meta="Broadcast scoreboard for a second screen."
            href={{ pathname: '/games/[gameId]/broadcast', params: { gameId: game.id } }}
          />
        ) : null}
      </SidebarPanel>

      <SidebarAdSlot
        sponsoredLabel="Sponsored"
        sponsor="Venue partners"
        headline="Tonight at the gym"
        body="Concessions · merch · community sponsors."
        cta="See sponsors"
      />

      <SidebarSearchList
        title="Around this game"
        subtitle="Top performers, teams, and video."
        items={items}
        filters={['All', 'Leaders', 'Teams', 'Videos']}
      />
    </SidebarRail>
  )
}
