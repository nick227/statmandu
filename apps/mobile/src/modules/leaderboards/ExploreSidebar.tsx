import { View } from 'react-native'
import { getSportDefinition } from '@statman/sports'
import { Text } from '@/shared/ui/Text'
import {
  SidebarBrandPanel,
  SidebarChip,
  SidebarPanel,
  SidebarRail,
  SidebarSearchList,
  type SidebarListItem,
} from '@/shared/layout'
import { EXPLORE_COPY } from './exploreContent'
import type { useExploreRankings } from './useExploreRankings'

type RankingsState = ReturnType<typeof useExploreRankings>

export function ExploreSidebar({ rankings }: { rankings: RankingsState }) {
  const copy = EXPLORE_COPY
  const leaderItems: SidebarListItem[] = rankings.playerEntries.slice(0, 5).map((entry) => ({
    id: `explore-leader:${entry.player.id}:${entry.rank}`,
    section: 'Leaders',
    title: `${entry.player.athleteProfile.firstName} ${entry.player.athleteProfile.lastName}`,
    meta: `#${entry.rank} · ${entry.value} ${entry.stat}`,
    href: { pathname: '/players/[playerId]', params: { playerId: entry.player.id } },
  }))
  const teamItems: SidebarListItem[] = rankings.teamEntries.slice(0, 3).map((entry) => ({
    id: `explore-team:${entry.team.id}:${entry.rank}`,
    section: 'Teams',
    title: entry.team.name,
    meta: `#${entry.rank} · ${entry.value} ${entry.stat}`,
    href: { pathname: '/teams/[teamId]', params: { teamId: entry.team.id } },
  }))
  const videoItems: SidebarListItem[] = rankings.leaderVideos.slice(0, 4).map((video) => ({
    id: `explore-video:${video.id}`,
    section: 'Videos',
    title: video.title ?? 'Ranked athlete video',
    meta: video.targetType,
    href: { pathname: '/videos' },
  }))

  return (
    <SidebarRail>
      <SidebarBrandPanel title="Explore board" subtitle="Filter rankings, scan leaders, and jump into the newest video." />

      <SidebarPanel title="Board controls" subtitle="Change the main rankings without leaving the page.">
        <View className="gap-xs">
          <Text variant="statLabel">Sport</Text>
          <View className="flex-row flex-wrap gap-xs">
            {rankings.sportOptions.map((sportSlug) => (
              <SidebarChip
                key={sportSlug}
                label={getSportDefinition(sportSlug).name}
                active={rankings.sportSlug === sportSlug}
                onPress={() => rankings.setSportSlug(sportSlug)}
              />
            ))}
          </View>
        </View>
        <View className="gap-xs">
          <Text variant="statLabel">Stat</Text>
          <View className="flex-row flex-wrap gap-xs">
            {rankings.playerStats.map((stat) => (
              <SidebarChip
                key={stat}
                label={rankings.sport.playerStatFields[stat]?.label ?? stat}
                active={rankings.playerStat === stat}
                onPress={() => rankings.setPlayerStat(stat)}
              />
            ))}
          </View>
        </View>
        <SidebarChip
          label={copy.filters.verifiedOnly}
          active={rankings.verifiedOnly}
          onPress={() => rankings.setVerifiedOnly(!rankings.verifiedOnly)}
        />
      </SidebarPanel>

      <SidebarSearchList
        title="Current board"
        subtitle="Leaders, teams, and ranked videos."
        items={[...leaderItems, ...teamItems, ...videoItems]}
        filters={['All', 'Leaders', 'Teams', 'Videos']}
      />
    </SidebarRail>
  )
}
