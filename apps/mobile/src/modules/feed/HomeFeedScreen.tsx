import { ScrollView, View } from 'react-native'
import { Rss } from 'lucide-react-native'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Screen } from '@/shared/layout'
import { FeedItemCard } from '@/modules/feed/FeedItemCard'
import {
  CommunityPulseMetrics,
  HomeSection,
  PlatformAuthorityBand,
  PlatformPitchCard,
  UsageCtaRow,
} from '@/modules/feed/HomeSections'
import { AthleteSpotlightCardLink, TeamSpotlightCardLink } from '@/modules/leaderboards/SpotlightCardLinks'
import { GameSpotlightCardLink } from '@/modules/feed/SpotlightCardLinks'
import { useHomeFeed } from '@/modules/feed/useHomeFeed'
import { HOME_EMPTY_COPY, HOME_SPORT_SLUG } from '@/modules/feed/homeContent'

export function HomeFeedScreen() {
  const home = useHomeFeed()

  if (home.isError) {
    return (
      <Screen title="Home">
        <ErrorState message="The home feed couldn't be loaded." />
      </Screen>
    )
  }

  if (home.isLoading) {
    return (
      <Screen title="Home">
        <View className="gap-sm px-lg">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full" />)}
        </View>
      </Screen>
    )
  }

  return (
    <Screen title="Home" scroll contentClassName="gap-xl px-lg">
      <PlatformAuthorityBand {...home.authority} />

      {home.featuredAthlete ? (
        <HomeSection title={home.sectionCopy.athletes.title} subtitle={home.sectionCopy.athletes.subtitle} href={{ pathname: '/(tabs)/explore' }}>
          <AthleteSpotlightCardLink entry={home.featuredAthlete} sportSlug={HOME_SPORT_SLUG} size="large" />
        </HomeSection>
      ) : null}

      {home.risingAthletes.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-md">
          {home.risingAthletes.map((entry) => (
            <AthleteSpotlightCardLink key={entry.player.id} entry={entry} sportSlug={HOME_SPORT_SLUG} size="small" className="w-44" />
          ))}
        </ScrollView>
      ) : null}

      <HomeSection title={home.sectionCopy.community.title} subtitle={home.sectionCopy.community.subtitle}>
        <CommunityPulseMetrics metrics={home.communityMetrics} />
        <View className="gap-sm pt-sm">
          {home.communityActivity.length === 0 ? (
            <EmptyState icon={Rss} title={HOME_EMPTY_COPY.feed.title} description={HOME_EMPTY_COPY.feed.description} />
          ) : (
            home.communityActivity.map((item, index) => (
              <FeedItemCard key={item.id} item={item} index={index} />
            ))
          )}
        </View>
      </HomeSection>

      {home.featuredGame ? (
        <HomeSection title={home.sectionCopy.games.title} subtitle={home.sectionCopy.games.subtitle}>
          <GameSpotlightCardLink game={home.featuredGame} size="large" />
        </HomeSection>
      ) : null}

      {home.recentGames.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-md">
          {home.recentGames.map((game) => (
            <GameSpotlightCardLink key={game.id} game={game} size="small" className="w-56" />
          ))}
        </ScrollView>
      ) : null}

      <PlatformPitchCard {...home.platformPitch} />

      <HomeSection title={home.sectionCopy.usage.title} subtitle={home.sectionCopy.usage.subtitle}>
        <UsageCtaRow ctas={home.usageCtas} />
      </HomeSection>

      {home.leaderboardTeams.length > 0 ? (
        <HomeSection title={home.sectionCopy.leaders.title} subtitle={home.sectionCopy.leaders.subtitle} href={{ pathname: '/(tabs)/explore' }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-md pb-sm">
            {home.leaderboardTeams.map((entry) => (
              <TeamSpotlightCardLink key={entry.team.id} entry={entry} sportSlug={HOME_SPORT_SLUG} size="small" className="w-44" />
            ))}
          </ScrollView>
        </HomeSection>
      ) : null}
    </Screen>
  )
}
