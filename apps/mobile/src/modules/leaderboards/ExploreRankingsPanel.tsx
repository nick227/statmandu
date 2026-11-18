import { ScrollView, View } from 'react-native'
import { BarChart3, Shield } from 'lucide-react-native'
import { ContentSection } from '@/shared/layout/ContentSection'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Text } from '@/shared/ui/Text'
import { EXPLORE_COPY } from '@/modules/leaderboards/exploreContent'
import { RankingsSkeleton } from '@/modules/leaderboards/RankingsSkeleton'
import { PodiumStrip } from '@/modules/leaderboards/RankingsShowcase'
import { AthleteSpotlightCardLink, TeamSpotlightCardLink } from '@/modules/leaderboards/SpotlightCardLinks'
import { GameSpotlightCardLink } from '@/modules/feed/SpotlightCardLinks'
import type { useExploreRankings } from '@/modules/leaderboards/useExploreRankings'

type RankingsState = ReturnType<typeof useExploreRankings>

export function ExploreRankingsPanel({ rankings }: { rankings: RankingsState }) {
  const copy = EXPLORE_COPY
  return (
    <View className="gap-lg pb-md">
      {rankings.isError ? (
        <ErrorState message={copy.errors.rankings} />
      ) : rankings.isLoading ? (
        <RankingsSkeleton />
      ) : (
        <View className="gap-lg">
          {rankings.featuredPlayer ? (
            <ContentSection title="Athlete to watch" subtitle="The current season leader, one tap from their full profile.">
              <AthleteSpotlightCardLink
                entry={rankings.featuredPlayer}
                sportSlug={rankings.sportSlug}
                size="large"
                eyebrow={copy.sections.featuredPlayer.eyebrow}
              />
            </ContentSection>
          ) : null}

          {rankings.risingPlayers.length > 0 ? (
            <ContentSection title="Trending athletes" subtitle="More players moving up the season board.">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-sm">
                {rankings.risingPlayers.slice(0, 6).map((entry) => (
                  <AthleteSpotlightCardLink key={entry.seasonStat.id} entry={entry} sportSlug={rankings.sportSlug} size="small" className="w-40" />
                ))}
              </ScrollView>
            </ContentSection>
          ) : null}

          <ContentSection title="Top performers" subtitle={`Leaders in ${rankings.sport.playerStatFields[rankings.playerStat]?.fullLabel ?? rankings.playerStat}.`}>
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

          <ContentSection title="Teams" subtitle="Programs setting the pace this season." href={{ pathname: '/teams' }}>
            {rankings.hasTeamResults ? (
              <>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-sm">
                    {rankings.teamEntries.slice(0, 6).map((entry) => (
                      <TeamSpotlightCardLink
                        key={entry.seasonStat.id}
                        entry={entry}
                        sportSlug={rankings.sportSlug}
                        size="small"
                        className="w-40"
                      />
                    ))}
                </ScrollView>
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

          {rankings.discoveryGames.length > 0 ? (
            <ContentSection title="Recent games" subtitle="Live games, fresh finals, and what is next." href={{ pathname: '/games' }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-sm">
                {rankings.discoveryGames.map((game) => (
                  <GameSpotlightCardLink key={game.id} game={game} size="small" className="w-40" />
                ))}
              </ScrollView>
            </ContentSection>
          ) : null}

        </View>
      )}
    </View>
  )
}
