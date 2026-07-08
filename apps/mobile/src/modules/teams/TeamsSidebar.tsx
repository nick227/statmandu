import type { components } from '@statman/sdk'
import { SidebarBrandPanel, SidebarPanel, SidebarRail, SidebarSearchList, type SidebarListItem } from '@/shared/layout'

type Team = components['schemas']['Team']

export function TeamsSidebar({ teams }: { teams: Team[] }) {
  const items: SidebarListItem[] = teams.slice(0, 12).map((team) => ({
    id: `teams:${team.id}`,
    section: team.league?.name ?? 'Teams',
    title: team.name,
    meta: [team.city, team.sport?.name].filter(Boolean).join(' · '),
    href: { pathname: '/teams/[teamId]', params: { teamId: team.id } },
  }))

  return (
    <SidebarRail>
      <SidebarBrandPanel title="Teams board" subtitle="Jump into a roster, games, and team media." />
      <SidebarSearchList title="All teams" subtitle="Filter by league label." items={items} maxItems={10} />
    </SidebarRail>
  )
}

