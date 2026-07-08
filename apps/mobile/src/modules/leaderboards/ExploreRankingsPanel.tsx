import { Pressable, ScrollView, View } from 'react-native'
import { BarChart3, Shield } from 'lucide-react-native'
import { getSportDefinition } from '@statman/sports'
import { ContentSection } from '@/shared/layout/ContentSection'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Text } from '@/shared/ui/Text'
import { PlatformAuthorityBand } from '@/modules/feed/HomeSections'
import { EXPLORE_COPY, exploreAuthorityBand } from '@/modules/leaderboards/exploreContent'
import { RankingsSkeleton } from '@/modules/leaderboards/RankingsSkeleton'
import { ChampionRibbon, PodiumStrip, ShowcaseMosaic } from '@/modules/leaderboards/RankingsShowcase'
import { AthleteSpotlightCardLink, TeamSpotlightCardLink } from '@/modules/leaderboards/SpotlightCardLinks'
import type { useExploreRankings } from '@/modules/leaderboards/useExploreRankings'

function FilterChip({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={active ? 'rounded-pill bg-sport-accent px-md py-xs' : 'rounded-pill border border-border bg-surface px-md py-xs'}
    >
      <Text variant="caption" className={active ? 'font-semibold text-white' : 'font-semibold'}>{label}</Text>
    </Pressable>
  )
}

type RankingsState = ReturnType<typeof useExploreRankings>

export function ExploreRankingsPanel({ rankings }: { rankings: RankingsState }) {
  const copy = EXPLORE_COPY
  const authority = exploreAuthorityBand(rankings.sport.name)

  return (
    <View className="gap-lg pb-md">
      <PlatformAuthorityBand {...authority} />

      <ContentSection title={copy.sections.rankings.title} subtitle={copy.sections.rankings.subtitle}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-sm">
          {rankings.sportOptions.map((sportSlug) => (
            <FilterChip
              key={sportSlug}
              label={getSportDefinition(sportSlug).name}
              active={rankings.sportSlug === sportSlug}
              onPress={() => rankings.setSportSlug(sportSlug)}
            />
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-sm">
          {rankings.playerStats.map((stat) => (
            <FilterChip
              key={stat}
              label={rankings.sport.playerStatFields[stat]?.fullLabel ?? rankings.sport.playerStatFields[stat]?.label ?? stat}
              active={rankings.playerStat === stat}
              onPress={() => rankings.setPlayerStat(stat)}
            />
          ))}
          <FilterChip
            label={copy.filters.verifiedOnly}
            active={rankings.verifiedOnly}
            onPress={() => rankings.setVerifiedOnly(!rankings.verifiedOnly)}
          />
        </ScrollView>
      </ContentSection>

      {rankings.isError ? (
        <ErrorState message={copy.errors.rankings} />
      ) : rankings.isLoading ? (
        <RankingsSkeleton />
      ) : (
        <View className="gap-lg">
          {rankings.featuredPlayer ? (
            <ContentSection title={copy.sections.champion.title} subtitle={copy.sections.champion.subtitle}>
              <AthleteSpotlightCardLink
                entry={rankings.featuredPlayer}
                sportSlug={rankings.sportSlug}
                size="large"
                eyebrow={copy.sections.featuredPlayer.eyebrow}
              />
              <ChampionRibbon sportSlug={rankings.sportSlug} stat={rankings.playerStat} entry={rankings.featuredPlayer} />
            </ContentSection>
          ) : null}

          <ContentSection title={copy.sections.podium.title} subtitle={copy.sections.podium.subtitle}>
            {rankings.hasPlayerResults ? (
              <PodiumStrip entries={rankings.playerEntries.slice(0, 3)} sportSlug={rankings.sportSlug} />
            ) : rankings.featuredPlayer ? (
              <Text variant="caption">{copy.empty.playersGrowing.description}</Text>
            ) : (
              <EmptyState
                icon={BarChart3}
                title={rankings.isVerifiedFilterEmpty ? copy.empty.verifiedPlayers.title : copy.empty.players.title}
                description={rankings.isVerifiedFilterEmpty ? copy.empty.verifiedPlayers.description : copy.empty.players.description}
                className="py-lg"
              />
            )}
          </ContentSection>

          {rankings.showcaseLists.length > 0 ? (
            <ContentSection title={copy.sections.showcases.title} subtitle={copy.sections.showcases.subtitle}>
              <View className="gap-md">
                {rankings.showcaseLists.map((list, index) => (
                  <ShowcaseMosaic key={list.key} index={index} list={list} sportSlug={rankings.sportSlug} />
                ))}
              </View>
            </ContentSection>
          ) : null}

          {rankings.risingPlayers.length > 0 ? (
            <ContentSection title={copy.sections.topPlayers.title} subtitle={copy.sections.topPlayers.subtitle}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-md">
                {rankings.risingPlayers.map((entry) => (
                  <AthleteSpotlightCardLink
                    key={entry.player.id}
                    entry={entry}
                    sportSlug={rankings.sportSlug}
                    size="small"
                    className="w-44"
                  />
                ))}
              </ScrollView>
            </ContentSection>
          ) : null}

          <ContentSection title={copy.sections.topTeams.title} subtitle={copy.sections.topTeams.subtitle}>
            {rankings.hasTeamResults ? (
              <>
                {rankings.featuredTeam ? (
                  <TeamSpotlightCardLink
                    entry={rankings.featuredTeam}
                    sportSlug={rankings.sportSlug}
                    size="large"
                    eyebrow={copy.sections.featuredTeam.eyebrow}
                  />
                ) : null}
                {rankings.risingTeams.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-md">
                    {rankings.risingTeams.map((entry) => (
                      <TeamSpotlightCardLink
                        key={entry.team.id}
                        entry={entry}
                        sportSlug={rankings.sportSlug}
                        size="small"
                        className="w-44"
                      />
                    ))}
                  </ScrollView>
                ) : rankings.featuredTeam ? (
                  <Text variant="caption">{copy.empty.teamsGrowing.description}</Text>
                ) : null}
              </>
            ) : (
              <EmptyState
                icon={Shield}
                title={copy.empty.teams.title}
                description={copy.empty.teams.description}
                className="py-lg"
              />
            )}
          </ContentSection>
        </View>
      )}
    </View>
  )
}
