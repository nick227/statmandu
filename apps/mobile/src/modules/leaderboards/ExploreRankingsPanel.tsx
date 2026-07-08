import { useState } from 'react'
import { ScrollView, View } from 'react-native'
import { BarChart3, Shield, Video } from 'lucide-react-native'
import type { components } from '@statman/sdk'
import { ContentSection } from '@/shared/layout/ContentSection'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Text } from '@/shared/ui/Text'
import { PlatformAuthorityBand } from '@/modules/feed/HomeSections'
import { EXPLORE_COPY, exploreAuthorityBand } from '@/modules/leaderboards/exploreContent'
import { RankingsSkeleton } from '@/modules/leaderboards/RankingsSkeleton'
import { ChampionRibbon, PodiumStrip, ShowcaseMosaic } from '@/modules/leaderboards/RankingsShowcase'
import { AthleteSpotlightCardLink, TeamSpotlightCardLink } from '@/modules/leaderboards/SpotlightCardLinks'
import { ConnectedVideoCard } from '@/modules/media/ConnectedVideoCard'
import { ConnectedFullScreenMediaViewer } from '@/modules/media/ConnectedFullScreenMediaViewer'
import { VideoRail } from '@/modules/media/VideoRail'
import type { useExploreRankings } from '@/modules/leaderboards/useExploreRankings'

type MediaAsset = components['schemas']['MediaAsset']

type RankingsState = ReturnType<typeof useExploreRankings>

export function ExploreRankingsPanel({ rankings }: { rankings: RankingsState }) {
  const copy = EXPLORE_COPY
  const authority = exploreAuthorityBand(rankings.sport.name)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)

  function openViewer(video: MediaAsset) {
    const index = rankings.exploreViewerVideos.findIndex((entry) => entry.id === video.id)
    if (index >= 0) setViewerIndex(index)
  }

  return (
    <>
    <View className="gap-lg pb-md">
      <PlatformAuthorityBand {...authority} />

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
              {rankings.championVideo ? (
                <ConnectedVideoCard
                  item={rankings.championVideo}
                  variant="hero"
                  onPress={() => openViewer(rankings.championVideo!)}
                />
              ) : (
                <EmptyState
                  icon={Video}
                  title={copy.sections.videos.champion.title}
                  description={copy.sections.videos.champion.empty}
                  className="py-md"
                />
              )}
            </ContentSection>
          ) : null}

          {rankings.leaderVideos.length > 0 ? (
            <ContentSection title={copy.sections.videos.board.title} subtitle={copy.sections.videos.board.subtitle}>
              <VideoRail
                items={rankings.leaderVideos}
                onItemPress={(index) => openViewer(rankings.leaderVideos[index]!)}
              />
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

    <ConnectedFullScreenMediaViewer
      visible={viewerIndex != null}
      items={rankings.exploreViewerVideos}
      initialIndex={viewerIndex ?? 0}
      onClose={() => setViewerIndex(null)}
    />
    </>
  )
}
