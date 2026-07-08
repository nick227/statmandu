import { useMemo, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { Rss } from 'lucide-react-native'
import { ContentSection } from '@/shared/layout/ContentSection'
import { FullScreenMediaViewer } from '@/shared/media'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Screen } from '@/shared/layout'
import { AdPlaceholder } from '@/modules/feed/AdPlaceholder'
import { FeedItemCard } from '@/modules/feed/FeedItemCard'
import { HomeActivityCard } from '@/modules/feed/HomeActivityCard'
import {
  CommunityPulseMetrics,
  PlatformAuthorityBand,
  PlatformPitchCard,
  UsageCtaRow,
} from '@/modules/feed/HomeSections'
import { GameSpotlightCardLink } from '@/modules/feed/SpotlightCardLinks'
import { useHomeFeed } from '@/modules/feed/useHomeFeed'
import { HOME_EMPTY_COPY, HOME_PLAYER_STAT, HOME_SCREEN, HOME_SPORT_SLUG } from '@/modules/feed/homeContent'
import { ConnectedVideoCard } from '@/modules/media/ConnectedVideoCard'
import { VideoRail } from '@/modules/media/VideoRail'
import { RankingsSkeleton } from '@/modules/leaderboards/RankingsSkeleton'
import { ChampionRibbon, PodiumStrip, ShowcaseMosaic } from '@/modules/leaderboards/RankingsShowcase'
import { AthleteSpotlightCardLink, TeamSpotlightCardLink } from '@/modules/leaderboards/SpotlightCardLinks'

export function HomeFeedScreen() {
  const home = useHomeFeed()
  const copy = home.sectionCopy
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)

  const viewerItems = useMemo(
    () => home.recentVideos.map((item) => ({ id: item.id, youtubeVideoId: item.youtubeVideoId, title: item.title })),
    [home.recentVideos]
  )

  if (home.isError) {
    return (
      <Screen title={HOME_SCREEN.title}>
        <ErrorState message={HOME_SCREEN.error} />
      </Screen>
    )
  }

  if (home.isLoading) {
    return (
      <Screen title={HOME_SCREEN.title}>
        <View className="px-lg pt-sm">
          <RankingsSkeleton />
        </View>
      </Screen>
    )
  }

  const topAd = home.ads.find((slot) => slot.id === 'ad-top')
  const midAd = home.ads.find((slot) => slot.id === 'ad-mid')
  const bottomAd = home.ads.find((slot) => slot.id === 'ad-bottom')
  const hasFeed = home.communityActivity.length > 0 || home.mockActivity.length > 0

  return (
    <>
    <Screen title={HOME_SCREEN.title} scroll contentClassName={`${home.layout.sectionGap} px-lg`}>
      <PlatformAuthorityBand {...home.authority} />
      {topAd ? <AdPlaceholder slot={topAd} /> : null}

      {home.featuredVideo ? (
        <ContentSection title={copy.videos.featured.title} subtitle={copy.videos.featured.subtitle}>
          <ConnectedVideoCard
            item={home.featuredVideo}
            variant="hero"
            onPress={() => setViewerIndex(0)}
          />
        </ContentSection>
      ) : null}

      {home.featuredAthlete ? (
        <ContentSection
          title={copy.athletes.title}
          subtitle={copy.athletes.subtitle}
          href={{ pathname: '/(tabs)/explore' }}
          linkLabel={copy.linkLabels.seeAll}
        >
          <AthleteSpotlightCardLink
            entry={home.featuredAthlete}
            sportSlug={HOME_SPORT_SLUG}
            size="large"
            eyebrow={copy.athletes.champion}
          />
          <ChampionRibbon
            sportSlug={HOME_SPORT_SLUG}
            stat={HOME_PLAYER_STAT}
            entry={home.featuredAthlete}
            statLabel={copy.athletes.ribbonStat}
            rankLabel={`${copy.athletes.ribbonRank} #${home.featuredAthlete.rank}`}
          />
        </ContentSection>
      ) : null}

      {home.podiumPlayers.length > 0 ? (
        <ContentSection title={copy.athletes.podium} subtitle={copy.athletes.podiumSubtitle}>
          <PodiumStrip entries={home.podiumPlayers} sportSlug={HOME_SPORT_SLUG} />
        </ContentSection>
      ) : null}

      {home.latestVideos.length > 0 ? (
        <ContentSection title={copy.videos.latest.title} subtitle={copy.videos.latest.subtitle}>
          <VideoRail
            items={home.latestVideos}
            onItemPress={(index) => setViewerIndex(index + 1)}
          />
        </ContentSection>
      ) : null}

      {home.risingAthletes.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-sm">
          {home.risingAthletes.map((entry) => (
            <AthleteSpotlightCardLink
              key={entry.player.id}
              entry={entry}
              sportSlug={HOME_SPORT_SLUG}
              size="small"
              className={home.layout.railCardWidth}
            />
          ))}
        </ScrollView>
      ) : null}

      {midAd ? <AdPlaceholder slot={midAd} /> : null}

      <ContentSection title={copy.community.title} subtitle={copy.community.subtitle}>
        <CommunityPulseMetrics metrics={home.communityMetrics} />
        <View className="gap-sm pt-sm">
          {!hasFeed ? (
            <EmptyState icon={Rss} title={HOME_EMPTY_COPY.feed.title} description={HOME_EMPTY_COPY.feed.description} />
          ) : (
            <>
              {home.communityActivity.map((item, index) => (
                <FeedItemCard key={item.id} item={item} index={index} />
              ))}
              {home.mockActivity.map((item, index) => (
                <HomeActivityCard key={item.id} item={item} large={index === 0 && home.communityActivity.length === 0} />
              ))}
            </>
          )}
        </View>
      </ContentSection>

      {home.liveShowcase ? (
        <ShowcaseMosaic index={0} list={home.liveShowcase} sportSlug={HOME_SPORT_SLUG} />
      ) : home.featuredGame ? (
        <ContentSection title={copy.games.title} subtitle={copy.games.subtitle}>
          <GameSpotlightCardLink game={home.featuredGame} size="large" />
        </ContentSection>
      ) : null}

      {home.recentGames.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-sm">
          {home.recentGames.map((game) => (
            <GameSpotlightCardLink key={game.id} game={game} size="small" className={home.layout.railCardWidth} />
          ))}
        </ScrollView>
      ) : null}

      {home.moreVideos.length > 0 ? (
        <ContentSection title={copy.videos.rail.title} subtitle={copy.videos.rail.subtitle}>
          <VideoRail
            items={home.moreVideos}
            variant="tile"
            onItemPress={(index) => setViewerIndex(index + 1 + home.latestVideos.length)}
          />
        </ContentSection>
      ) : null}

      {home.featuredTeam ? (
        <ContentSection
          title={copy.teams.title}
          subtitle={copy.teams.subtitle}
          href={{ pathname: '/(tabs)/explore' }}
          linkLabel={copy.linkLabels.seeAll}
        >
          <TeamSpotlightCardLink
            entry={home.featuredTeam}
            sportSlug={HOME_SPORT_SLUG}
            size="large"
            eyebrow={copy.teams.featuredEyebrow}
          />
        </ContentSection>
      ) : null}

      {home.risingTeams.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-sm">
          {home.risingTeams.map((entry) => (
            <TeamSpotlightCardLink
              key={entry.team.id}
              entry={entry}
              sportSlug={HOME_SPORT_SLUG}
              size="small"
              className={home.layout.railCardWidth}
            />
          ))}
        </ScrollView>
      ) : null}

      {home.reboundShowcase ? (
        <ShowcaseMosaic index={1} list={home.reboundShowcase} sportSlug={HOME_SPORT_SLUG} />
      ) : null}

      {bottomAd ? <AdPlaceholder slot={bottomAd} /> : null}

      <PlatformPitchCard {...home.platformPitch} />

      <ContentSection title={copy.usage.title} subtitle={copy.usage.subtitle}>
        <UsageCtaRow ctas={home.usageCtas} />
      </ContentSection>
    </Screen>

    <FullScreenMediaViewer
      visible={viewerIndex != null}
      items={viewerItems}
      initialIndex={viewerIndex ?? 0}
      onClose={() => setViewerIndex(null)}
    />
    </>
  )
}
