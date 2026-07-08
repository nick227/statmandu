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
    id: `enter-game:${game.id}`,
    section: game.status,
    title: gameTitle(game),
    meta: new Date(game.scheduledAt).toLocaleString(),
    href: { pathname: '/games/[gameId]/live', params: { gameId: game.id } },
  }))

  return (
    <SidebarRail>
      <SidebarBrandPanel title="Enter board" subtitle="Pick a game and start logging stats fast." />
      <SidebarSearchList title="Your games" subtitle="Scheduled and live assignments." items={items} filters={['All', 'SCHEDULED', 'LIVE']} maxItems={8} />
    </SidebarRail>
  )
}

