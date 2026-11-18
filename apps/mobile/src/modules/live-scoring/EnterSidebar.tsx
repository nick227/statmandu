import type { components } from '@statman/sdk'
import { SidebarBrandPanel, SidebarRail, SidebarSearchList, type SidebarListItem } from '@/shared/layout'

type Game = components['schemas']['Game']

function gameTitle(game: Game) {
  const home = game.gameTeams.find((gt) => gt.isHome)?.team?.name ?? 'Home'
  const away = game.gameTeams.find((gt) => !gt.isHome)?.team?.name ?? 'Away'
  return `${home} vs ${away}`
}

export function EnterSidebar({ games }: { games: Game[] }) {
  const items: SidebarListItem[] = games.slice(0, 12).map((game) => ({
    id: `game:${game.id}`,
    section: game.status,
    title: gameTitle(game),
    meta: new Date(game.scheduledAt).toLocaleString(),
    href: { pathname: '/games/[gameId]', params: { gameId: game.id } },
  }))

  return (
    <SidebarRail>
      <SidebarBrandPanel title="Games" subtitle="Open a game before choosing scoring or broadcast tools." />
      <SidebarSearchList title="Your games" subtitle="Scheduled, live, and historical games." items={items} filters={['All', 'SCHEDULED', 'LIVE', 'FINAL']} maxItems={8} />
    </SidebarRail>
  )
}
