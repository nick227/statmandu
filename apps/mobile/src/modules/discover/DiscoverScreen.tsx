import { useMemo, useState } from 'react'
import {
  FlatList,
  Pressable,
  ScrollView,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native'
import { Link } from 'expo-router'
import {
  Compass,
  CreditCard,
  Layers,
  Plus,
  Search,
  Sparkles,
  Trophy,
  User,
  X,
} from 'lucide-react-native'
import { brand } from '@/config/brand'
import { useNativeColor } from '@/lib/theme'
import { cn } from '@/lib/utils'
import { LAYOUT } from '@/shared/layout/layoutConstants'
import { Screen } from '@/shared/layout/Screen'
import { ContentSection } from '@/shared/layout/ContentSection'
import { Avatar } from '@/shared/ui/Avatar'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Skeleton } from '@/shared/ui/Skeleton'
import { Text } from '@/shared/ui/Text'
import { ConnectedStatmanCard } from '@/modules/cards/ConnectedStatmanCard'
import { CardRail } from '@/modules/cards/CardRail'
import { athleteFullName, editionLabel } from '@/modules/cards/cardDisplay'
import {
  DISCOVER_CATEGORIES,
  useDiscoverFeed,
  type Card,
  type DiscoverCategory,
  type PersonProfile,
} from './useDiscoverFeed'

function gridColumns(width: number): number {
  if (width >= 1440) return 4
  if (width >= 1024) return 3
  if (width >= 640) return 2
  return 1
}

export function DiscoverScreen() {
  const { width } = useWindowDimensions()
  const columns = gridColumns(width)
  const isWide = width >= LAYOUT.wideBreakpoint

  const {
    featuredCards,
    newCards,
    people,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    isSearching,
    searchCards,
    searchPeople,
    isLoading,
    isError,
    refetch,
  } = useDiscoverFeed()

  const mutedColor = useNativeColor('mutedText')
  const textColor = useNativeColor('text')
  const brandColor = useNativeColor('brand')

  if (isError) {
    return (
      <Screen insetTop={false}>
        <View className="px-lg py-xl">
          <ErrorState message="Could not load card discovery feed." />
        </View>
      </Screen>
    )
  }

  return (
    <Screen insetTop={false} scroll>
      <View className="w-full pb-xxl pt-md">
        {/* Brand Hero & Positioning */}
        <View className="mb-lg gap-sm border-b border-border pb-lg">
          <View className="flex-row items-center gap-xs">
            <Badge tone="brand">RARE Digital Collectibles</Badge>
            <Badge tone="muted-text">Beta</Badge>
          </View>
          <Text className="text-3xl font-extrabold tracking-tight text-text md:text-4xl">
            {brand.tagline}
          </Text>
          <Text variant="caption" className="max-w-2xl text-sm text-muted-text">
            The media-rich home for digital card collecting. Design custom cards in Studio,
            publish numbered releases, and collect people and moments from across culture.
          </Text>

          {/* Quick Actions */}
          <View className="mt-xs flex-row flex-wrap items-center gap-sm">
            <Link href="/cards/studio" asChild>
              <Button size="sm" icon={Plus}>
                Create in Studio
              </Button>
            </Link>
            <Link href="/collection" asChild>
              <Button variant="secondary" size="sm" icon={Layers}>
                My Collection
              </Button>
            </Link>
            <Link href="/players/create" asChild>
              <Button variant="ghost" size="sm" icon={User}>
                Add Person
              </Button>
            </Link>
          </View>

          {/* Live Search Bar */}
          <View className="mt-md flex-row items-center gap-sm rounded-lg border border-border bg-surface px-md py-sm">
            <Search size={18} color={mutedColor} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search cards, creators, or subjects..."
              placeholderTextColor={mutedColor}
              className="flex-1 text-sm text-text"
              style={{ outline: 'none' } as never}
            />
            {searchQuery.length > 0 ? (
              <Pressable
                onPress={() => setSearchQuery('')}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                className="p-xs active:opacity-60"
              >
                <X size={16} color={mutedColor} />
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* Category Pills */}
        <View className="mb-lg">
          <Text variant="statLabel" className="mb-xs">
            Browse by Category
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-xs pr-md py-xs"
          >
            {DISCOVER_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat
              return (
                <Pressable
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  accessibilityRole="button"
                  accessibilityLabel={cat}
                  accessibilityState={{ selected: active }}
                  className={cn(
                    'rounded-pill border px-md py-xs active:opacity-70',
                    active
                      ? 'border-text bg-text'
                      : 'border-border bg-surface hover:border-text/40'
                  )}
                >
                  <Text
                    className={cn(
                      'text-xs font-semibold',
                      active ? 'text-surface' : 'text-text'
                    )}
                  >
                    {cat}
                  </Text>
                </Pressable>
              )
            })}
          </ScrollView>
        </View>

        {/* Loading state skeleton */}
        {isLoading ? (
          <View className="gap-lg">
            <Skeleton className="h-80 w-full rounded-lg" />
            <View className="flex-row gap-md">
              <Skeleton className="h-48 flex-1 rounded-lg" />
              <Skeleton className="h-48 flex-1 rounded-lg" />
            </View>
          </View>
        ) : isSearching ? (
          /* Search Results View */
          <View className="gap-xl">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold">
                Search results for "{searchQuery}"
              </Text>
              <Text variant="caption">
                {searchCards.length} cards · {searchPeople.length} people
              </Text>
            </View>

            {searchCards.length > 0 ? (
              <ContentSection
                title="Matching Collectibles"
                subtitle="Cards matching title, subject, or creator."
              >
                <View
                  className={cn(
                    'gap-md',
                    columns === 3 && 'flex-row flex-wrap',
                    columns === 2 && 'flex-row flex-wrap'
                  )}
                >
                  {searchCards.map((card) => (
                    <View
                      key={card.id}
                      className={cn(
                        columns === 3 && 'w-[31.5%]',
                        columns === 2 && 'w-[48%]',
                        columns === 1 && 'w-full'
                      )}
                    >
                      <CardPreviewTile card={card} />
                    </View>
                  ))}
                </View>
              </ContentSection>
            ) : null}

            {searchPeople.length > 0 ? (
              <ContentSection
                title="People & Creators"
                subtitle="Profiles available to collect or build cards for."
              >
                <View className="gap-sm">
                  {searchPeople.map((p) => (
                    <PersonRowTile key={p.id} person={p} />
                  ))}
                </View>
              </ContentSection>
            ) : null}

            {searchCards.length === 0 && searchPeople.length === 0 ? (
              <EmptyState
                icon={Search}
                title={`No results for "${searchQuery}"`}
                description="Try another name or keyword, or jump into Card Studio to create the very first card for this subject."
              />
            ) : null}
          </View>
        ) : (
          /* Default Discover Feed */
          <View className="gap-xl">
            {/* 1. Featured Releases (Large Collectible Artwork) */}
            {featuredCards.length > 0 ? (
              <ContentSection
                title="Featured Releases"
                subtitle="Limited-edition drops and trending community collectibles."
                href={{ pathname: '/cards', params: { tab: 'featured' } }}
                linkLabel="See all featured"
              >
                <View className="gap-md">
                  <ConnectedStatmanCard
                    card={featuredCards[0]!}
                    size="featured"
                    source="HOME"
                  />
                  {featuredCards.length > 1 ? (
                    <CardRail
                      cards={featuredCards.slice(1, 7)}
                      source="HOME"
                      className="gap-sm pt-xs"
                    />
                  ) : null}
                </View>
              </ContentSection>
            ) : null}

            {/* 2. New & Noteworthy Cards */}
            {newCards.length > 0 ? (
              <ContentSection
                title="New & Noteworthy"
                subtitle="Recently published releases across all categories."
                href={{ pathname: '/cards' }}
                linkLabel="Browse catalog"
              >
                <View
                  className={cn(
                    'gap-md',
                    columns === 3 && 'flex-row flex-wrap',
                    columns === 2 && 'flex-row flex-wrap'
                  )}
                >
                  {newCards.slice(0, columns === 3 ? 6 : 4).map((card) => (
                    <View
                      key={card.id}
                      className={cn(
                        columns === 3 && 'w-[31.5%]',
                        columns === 2 && 'w-[48%]',
                        columns === 1 && 'w-full'
                      )}
                    >
                      <CardPreviewTile card={card} />
                    </View>
                  ))}
                </View>
              </ContentSection>
            ) : (
              <EmptyState
                icon={CreditCard}
                title={`No ${selectedCategory} cards classified yet`}
                description={
                  selectedCategory === 'Sports'
                    ? 'No public sports cards found. Publish one from Card Studio.'
                    : `Pursuit classification for ${selectedCategory} is scheduled for the upcoming data release. Browse All cards or design a custom ${selectedCategory} card in Studio.`
                }
              />
            )}

            {/* 3. Creators and People Worth Discovering */}
            {people.length > 0 ? (
              <ContentSection
                title="People Worth Discovering"
                subtitle="Notable individuals ready for card collection and creation."
                href={{ pathname: '/players' }}
                linkLabel="View all people"
              >
                <View className="gap-sm">
                  {people.slice(0, 5).map((p) => (
                    <PersonRowTile key={p.id} person={p} />
                  ))}
                </View>
              </ContentSection>
            ) : null}

            {/* 4. Contextual Sports Exploration Banner */}
            {selectedCategory === 'Sports' || selectedCategory === 'All' ? (
              <View className="rounded-xl border border-border bg-surface p-lg">
                <View className="flex-row items-start justify-between gap-md">
                  <View className="flex-1 gap-xs">
                    <View className="flex-row items-center gap-xs">
                      <Trophy size={16} color={brandColor} />
                      <Text className="text-xs font-bold uppercase tracking-wide text-brand">
                        Sports Archive
                      </Text>
                    </View>
                    <Text className="text-base font-bold text-text">
                      Looking for live scores, games, and rosters?
                    </Text>
                    <Text variant="caption">
                      Sports is an optional module in RARE. You can explore game broadcasts,
                      team rosters, and player stats in the sports section.
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-xs">
                    <Link href="/games" asChild>
                      <Button variant="secondary" size="sm">
                        Games
                      </Button>
                    </Link>
                    <Link href="/teams" asChild>
                      <Button variant="secondary" size="sm">
                        Teams
                      </Button>
                    </Link>
                  </View>
                </View>
              </View>
            ) : null}

            {/* 5. Creator Studio CTA */}
            <View className="rounded-xl border border-border bg-canvas p-xl text-center">
              <View className="max-w-xl self-center items-center gap-sm">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-brand/10">
                  <Sparkles size={22} color={brandColor} strokeWidth={2} />
                </View>
                <Text className="text-2xl font-bold tracking-tight text-text">
                  Design your own collectible card.
                </Text>
                <Text variant="caption" className="text-center text-sm">
                  Gather a person's story, compose layers and custom artwork in Card Studio,
                  and publish your own numbered edition.
                </Text>
                <Link href="/cards/studio" asChild className="mt-sm">
                  <Button size="lg">Open Card Studio</Button>
                </Link>
              </View>
            </View>
          </View>
        )}
      </View>
    </Screen>
  )
}

/** Individual card tile in Discover grid with explicit official/community attribution. */
function CardPreviewTile({ card }: { card: Card }) {
  const isOfficial = card.publicationType === 'OFFICIAL'

  return (
    <View className="overflow-hidden rounded-lg border border-border bg-surface p-sm gap-xs">
      <ConnectedStatmanCard card={card} size="rail" source="EXPLORE" />
      <View className="gap-[2px] pt-xs">
        <View className="flex-row items-center justify-between">
          <Badge tone={isOfficial ? 'verified' : 'muted-text'}>
            {isOfficial ? 'Official' : 'Community'}
          </Badge>
          <Text variant="caption" className="text-[11px] font-medium">
            {editionLabel(card)}
          </Text>
        </View>
        <Text className="font-semibold text-text" numberOfLines={1}>
          {card.title}
        </Text>
        <Text variant="caption" numberOfLines={1}>
          {athleteFullName(card)} · By @{card.createdByUserId}
          {card.publishedByUserId && card.publishedByUserId !== card.createdByUserId
            ? ` · Pub @${card.publishedByUserId}`
            : ''}
        </Text>
      </View>
    </View>
  )
}

/** Person row tile for Discover */
function PersonRowTile({ person }: { person: PersonProfile }) {
  const subtitle = [person.bio, ...(person.aliases ?? [])].filter(Boolean).join(' · ')

  return (
    <View className="flex-row items-center justify-between rounded-lg border border-border bg-surface p-md">
      <Link
        href={{ pathname: '/people/[personId]', params: { personId: person.id } }}
        asChild
      >
        <Pressable className="flex-1 flex-row items-center gap-md active:opacity-70">
          <Avatar
            uri={person.avatarUrl}
            fallback={person.displayName}
            size="md"
          />
          <View className="flex-1 min-w-0 gap-[2px]">
            <View className="flex-row items-center gap-xs">
              <Text className="font-bold text-text" numberOfLines={1}>
                {person.displayName}
              </Text>
              {person.claimedByUserId ? (
                <Badge tone="verified">Claimed</Badge>
              ) : null}
            </View>
            {subtitle ? (
              <Text variant="caption" numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </Pressable>
      </Link>
      <View className="flex-row items-center gap-xs ml-sm">
        <Link
          href={{
            pathname: '/cards/studio',
            params: { athleteProfileId: person.id },
          }}
          asChild
        >
          <Button variant="secondary" size="sm">
            Create card
          </Button>
        </Link>
      </View>
    </View>
  )
}
