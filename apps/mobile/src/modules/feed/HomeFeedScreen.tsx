import { useMemo, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { Link } from 'expo-router'
import { Newspaper, Rss, Video } from 'lucide-react-native'
import { ContentSection } from '@/shared/layout/ContentSection'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { PageFrame, Screen } from '@/shared/layout'
import { AdPlaceholder } from '@/modules/feed/AdPlaceholder'
import { CommunityPulseFeed } from '@/modules/feed/CommunityPulseFeed'
import {
  CommunityPulseMetrics,
  HomeSidebar,
  type HomeSidebarItem,
  PlatformAuthorityBand,
  PlatformPitchCard,
  UsageCtaRow,
} from '@/modules/feed/HomeSections'
import { HomeScoresStrip } from '@/modules/feed/HomeScoresStrip'
import { GameSpotlightCardLink } from '@/modules/feed/SpotlightCardLinks'
import { ArticleCardLink } from '@/modules/articles/ArticleCardLink'
import { useHomeFeed } from '@/modules/feed/useHomeFeed'
import { HOME_EMPTY_COPY, HOME_PLAYER_STAT, HOME_SCREEN, HOME_SPORT_SLUG } from '@/modules/feed/homeContent'
import { ConnectedVideoCard } from '@/modules/media/ConnectedVideoCard'
import { ConnectedCardDropSection } from '@/modules/cards/ConnectedCardDropSection'
import { ConnectedFullScreenMediaViewer } from '@/modules/media/ConnectedFullScreenMediaViewer'
import { Button } from '@/shared/ui/Button'
import { RankingsSkeleton } from '@/modules/leaderboards/RankingsSkeleton'
import { ChampionRibbon, PodiumStrip, ShowcaseMosaic } from '@/modules/leaderboards/RankingsShowcase'
import { AthleteSpotlightCardLink, TeamSpotlightCardLink } from '@/modules/leaderboards/SpotlightCardLinks'

function gameTitle(game: NonNullable<ReturnType<typeof useHomeFeed>['featuredGame']>) {
  const home = game.gameTeams.find((gt) => gt.isHome)?.team?.name ?? 'Home'
  const away = game.gameTeams.find((gt) => !gt.isHome)?.team?.name ?? 'Away'
  return `${home} vs ${away}`
}

export function HomeFeedScreen() {
  const home = useHomeFeed()
  const copy = home.sectionCopy
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)

  const viewerItems = useMemo(() => home.recentVideos, [home.recentVideos])
  const topAd = home.ads.find((slot) => slot.id === 'ad-top')
  const midAd = home.ads.find((slot) => slot.id === 'ad-mid')
  const bottomAd = home.ads.find((slot) => slot.id === 'ad-bottom')
  const hasPulse = home.communityPulse.length > 0
  const sidebarItems = useMemo<HomeSidebarItem[]>(() => {
    const gameItems = [home.featuredGame, ...home.recentGames]
      .filter(Boolean)
      .map((game) => ({
        id: `game:${game.id}`,
        section: 'Live' as const,
        title: gameTitle(game),
        meta: `${game.status} · ${new Date(game.scheduledAt).toLocaleDateString()}`,
        href: { pathname: '/games/[gameId]', params: { gameId: game.id } },
      }))
    const leaderItems = [home.featuredAthlete, ...home.podiumPlayers.filter((entry) => entry.player.id !== home.featuredAthlete?.player.id)]
      .filter(Boolean)
      .map((entry) => ({
        id: `leader:${entry.player.id}:${entry.rank}`,
        section: 'Leaders' as const,
        title: `${entry.player.athleteProfile.firstName} ${entry.player.athleteProfile.lastName}`,
        meta: `#${entry.rank} · ${entry.value} ${entry.stat}`,
        href: { pathname: '/players/[playerId]', params: { playerId: entry.player.id } },
      }))
    const videoItems = home.recentVideos.slice(0, 4).map((video) => ({
      id: `video:${video.id}`,
      section: 'Videos' as const,
      title: video.title ?? 'New video',
      meta: video.targetType,
      href: { pathname: '/videos' },
    }))
    return [...gameItems, ...leaderItems, ...videoItems]
  }, [home.featuredAthlete, home.featuredGame, home.podiumPlayers, home.recentGames, home.recentVideos])

  if (home.isError) {
    return (
      <Screen title={HOME_SCREEN.title} insetTop={false}>
        <ErrorState message={HOME_SCREEN.error} />
      </Screen>
    )
  }

  if (home.isLoading) {
    return (
      <Screen title={HOME_SCREEN.title} insetTop={false}>
        <View className="px-lg pt-sm">
          <RankingsSkeleton />
        </View>
      </Screen>
    )
  }

  const mainColumn = (
    <View className="gap-md">
      <PlatformAuthorityBand {...home.authority} />

      {home.scoreboardGames.length > 0 ? (
        <ContentSection
          title={copy.scores.title}
          subtitle={copy.scores.subtitle}
          href={{ pathname: '/scores' }}
          linkLabel={copy.linkLabels.scores}
        >
          <HomeScoresStrip games={home.scoreboardGames} />
        </ContentSection>
      ) : null}

      <ContentSection
        title={copy.videos.featured.title}
        subtitle={copy.videos.featured.subtitle}
        href={{ pathname: '/videos' }}
        linkLabel={copy.linkLabels.allVideos}
      >
        {home.featuredVideo ? (
          <ConnectedVideoCard
            item={home.featuredVideo}
            variant="hero"
            onPress={() => setViewerIndex(0)}
          />
        ) : (
          <View className="gap-sm">
            <EmptyState icon={Video} title={HOME_EMPTY_COPY.videos.title} description={HOME_EMPTY_COPY.videos.description} className="py-lg" />
            <Link href="/videos" asChild>
              <Button variant="secondary">{HOME_EMPTY_COPY.videos.browseCta}</Button>
            </Link>
          </View>
        )}
      </ContentSection>

      <ContentSection
        title={copy.articles.title}
        subtitle={copy.articles.subtitle}
        href={{ pathname: '/articles' }}
        linkLabel={copy.linkLabels.allArticles}
      >
        {home.recentArticles.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-sm">
            {home.recentArticles.map((article) => (
              <ArticleCardLink key={article.id} article={article} className={home.layout.railCardWidth} />
            ))}
          </ScrollView>
        ) : (
          <EmptyState icon={Newspaper} title={HOME_EMPTY_COPY.articles.title} description={HOME_EMPTY_COPY.articles.description} className="py-lg" />
        )}
      </ContentSection>

      {home.featuredAthlete ? (
        <ContentSection
          title={copy.athletes.title}
          subtitle={copy.athletes.subtitle}
          href={{ pathname: '/explore' }}
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
          {!hasPulse ? (
            <EmptyState icon={Rss} title={HOME_EMPTY_COPY.feed.title} description={HOME_EMPTY_COPY.feed.description} />
          ) : (
            <CommunityPulseFeed
              items={home.communityPulse}
              onVideoPress={setViewerIndex}
            />
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

      <ConnectedCardDropSection />

      {home.featuredTeam ? (
        <ContentSection
          title={copy.teams.title}
          subtitle={copy.teams.subtitle}
          href={{ pathname: '/teams' }}
          linkLabel={copy.linkLabels.allTeams}
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

      <PlatformPitchCard {...home.platformPitch} />

      <ContentSection title={copy.usage.title} subtitle={copy.usage.subtitle}>
        <UsageCtaRow ctas={home.usageCtas} />
      </ContentSection>
    </View>
  )

  return (
    <>
    <Screen title={HOME_SCREEN.title} scroll contentClassName="pb-xxl" insetTop={false}>
      <PageFrame
        main={mainColumn}
        sidebar={<HomeSidebar ad={topAd ?? bottomAd} items={sidebarItems} />}
      />
    </Screen>

    <ConnectedFullScreenMediaViewer
      visible={viewerIndex != null}
      items={viewerItems}
      initialIndex={viewerIndex ?? 0}
      onClose={() => setViewerIndex(null)}
    />
    </>
  )
}
