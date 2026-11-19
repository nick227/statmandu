import { useRef, useState } from 'react'
import {
  Pressable,
  ScrollView,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native'
import { Link } from 'expo-router'
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Layers,
  Plus,
  Search,
  Sparkles,
  User,
  X,
} from 'lucide-react-native'
import { useNativeColor } from '@/lib/theme'
import { cn } from '@/lib/utils'
import { Screen } from '@/shared/layout/Screen'
import { Avatar } from '@/shared/ui/Avatar'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Skeleton } from '@/shared/ui/Skeleton'
import { Text } from '@/shared/ui/Text'
import { ConnectedStatmanCard } from '@/modules/cards/ConnectedStatmanCard'
import { athleteFullName, creatorDisplayHandle, editionLabel } from '@/modules/cards/cardDisplay'
import { FLAGSHIP_DESIGNS } from '@/modules/designs/flagshipDesigns'
import {
  DISCOVER_CATEGORIES,
  useDiscoverFeed,
  type Card,
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
  const templateRailRef = useRef<ScrollView>(null)

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
  } = useDiscoverFeed()

  const mutedColor = useNativeColor('mutedText')
  const brandColor = useNativeColor('brand')

  function handleScrollTemplates(direction: 'left' | 'right') {
    templateRailRef.current?.scrollTo({
      x: direction === 'left' ? -320 : 320,
      animated: true,
    })
  }

  if (isError) {
    return (
      <Screen insetTop={false}>
        <View className="px-lg py-xl">
          <ErrorState message="Could not load card discovery feed." />
        </View>
      </Screen>
    )
  }

  // Exact flex-basis calculations filling 100% of available width with 24px gaps
  const gridColClass =
    'w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)]'

  return (
    <Screen insetTop={false} scroll>
      <View className="w-full max-w-[1800px] mx-auto pb-28 pt-2 md:pt-6">
        {/* 1. Canva-style Spacious, Centered Hero & Discovery Hub */}
        <View className="w-full items-center justify-center py-6 md:py-12 gap-5 md:gap-7 border-b border-border/40 pb-10 md:pb-16">
          {/* Centered Heading */}
          <View className="items-center gap-2 max-w-3xl px-4">
            <View className="flex-row items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 shadow-xs">
              <Sparkles size={14} color={brandColor} />
              <Text className="text-xs font-semibold text-muted-text">
                RARE Digital Collectibles
              </Text>
            </View>
            <Text className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-center text-text">
              What will you create today?
            </Text>
          </View>

          {/* Centered Wide Search Bar */}
          <View className="w-full max-w-2xl px-4">
            <View className="flex-row items-center gap-3 rounded-full border border-border bg-surface px-5 py-3.5 shadow-sm hover:border-brand/50 transition-all">
              <Search size={20} color={mutedColor} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search cards, creators, or subjects..."
                placeholderTextColor={mutedColor}
                className="flex-1 text-base text-text"
                style={{ outline: 'none' } as never}
              />
              {searchQuery.length > 0 ? (
                <Pressable
                  onPress={() => setSearchQuery('')}
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                  className="p-1 active:opacity-60"
                >
                  <X size={18} color={mutedColor} />
                </Pressable>
              ) : null}
            </View>
          </View>

          {/* Centered Quick Action Buttons */}
          <View className="flex-row flex-wrap items-center justify-center gap-3 px-4">
            <Link href="/cards/studio" asChild>
              <Button size="sm" variant="primary" icon={Plus}>
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

          {/* Centered Category Pills */}
          <View className="w-full pt-1">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2 px-4 md:justify-center items-center mx-auto"
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
                      'rounded-full border px-4 py-2 active:opacity-70 transition-all',
                      active
                        ? 'border-text bg-text shadow-xs'
                        : 'border-border/80 bg-surface hover:border-text/40'
                    )}
                  >
                    <Text
                      className={cn(
                        'text-xs md:text-sm font-semibold',
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
        </View>

        {/* 2. Main Content Stream with Generous Vertical Rhythm */}
        {isLoading ? (
          <View className="gap-8 py-10 px-4">
            <Skeleton className="h-80 w-full rounded-2xl" />
            <View className="flex-row gap-6">
              <Skeleton className="h-56 flex-1 rounded-2xl" />
              <Skeleton className="h-56 flex-1 rounded-2xl" />
            </View>
          </View>
        ) : isSearching ? (
          /* Search Results View */
          <View className="gap-12 py-8 px-4">
            <View className="flex-row items-center justify-between border-b border-border/40 pb-4">
              <Text className="text-2xl font-bold text-text">
                Search results for "{searchQuery}"
              </Text>
              <Text variant="caption" className="text-sm">
                {searchCards.length} cards · {searchPeople.length} people
              </Text>
            </View>

            {searchCards.length > 0 ? (
              <View className="gap-6">
                <Text className="text-xl font-bold text-text">Matching Collectibles</Text>
                <View className="flex-row flex-wrap gap-6">
                  {searchCards.map((card) => (
                    <View key={card.id} className={gridColClass}>
                      <DiscoveryCardTile card={card} />
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {searchPeople.length > 0 ? (
              <View className="gap-6">
                <Text className="text-xl font-bold text-text">People & Creators</Text>
                <View className="flex-row flex-wrap gap-4">
                  {searchPeople.map((p) => (
                    <View key={p.id} className="w-full sm:w-[calc(50%-8px)]">
                      <PersonRowTile person={p} />
                    </View>
                  ))}
                </View>
              </View>
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
          /* Default Discovery Feed with Consistent, Professional Scaling */
          <View className="gap-14 md:gap-20 pt-8 md:pt-12 px-4 md:px-6">
            {/* Section 1: Templates for You (Intentional Curated Editorial Rail with Desktop Navigation) */}
            <View className="gap-5">
              <View className="flex-col sm:flex-row sm:items-end justify-between gap-2">
                <View className="gap-1 flex-1">
                  <Text className="text-2xl md:text-3xl font-extrabold tracking-tight text-text">
                    Templates for You
                  </Text>
                  <Text variant="caption" className="text-sm text-muted-text">
                    Curated card layouts designed for cultural icons, creators, and professionals.
                  </Text>
                </View>
                <View className="flex-row items-center gap-3 self-start sm:self-auto">
                  {/* Obvious Desktop Rail Navigation Chevrons */}
                  <View className="hidden md:flex flex-row items-center gap-1.5">
                    <Pressable
                      onPress={() => handleScrollTemplates('left')}
                      accessibilityRole="button"
                      accessibilityLabel="Previous templates"
                      className="h-8 w-8 items-center justify-center rounded-full border border-border bg-surface active:opacity-70 hover:border-brand/40"
                    >
                      <ChevronLeft size={16} color={mutedColor} />
                    </Pressable>
                    <Pressable
                      onPress={() => handleScrollTemplates('right')}
                      accessibilityRole="button"
                      accessibilityLabel="Next templates"
                      className="h-8 w-8 items-center justify-center rounded-full border border-border bg-surface active:opacity-70 hover:border-brand/40"
                    >
                      <ChevronRight size={16} color={mutedColor} />
                    </Pressable>
                  </View>
                  <Link href="/cards/studio" asChild>
                    <Pressable className="active:opacity-70">
                      <Text className="text-sm font-semibold text-brand">Browse all →</Text>
                    </Pressable>
                  </Link>
                </View>
              </View>

              <ScrollView
                ref={templateRailRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-5 py-2 pr-6"
              >
                {FLAGSHIP_DESIGNS.slice(0, 8).map((d) => (
                  <Link
                    key={d.id}
                    href={{ pathname: '/cards/studio', params: { flagshipId: d.id } }}
                    asChild
                  >
                    <Pressable className="w-64 rounded-2xl border border-border/80 bg-surface p-4 gap-3 hover:border-brand/40 hover:shadow-md transition-all active:scale-[0.98]">
                      {/* Template Authentic Mini Stage */}
                      <View
                        style={{ backgroundColor: d.palette.background }}
                        className="h-44 w-full rounded-xl border border-border/40 justify-between p-3.5 shadow-inner"
                      >
                        <View className="flex-row items-center justify-between">
                          <View
                            style={{ backgroundColor: d.palette.accent }}
                            className="h-2 w-6 rounded-full"
                          />
                          <Text
                            style={{ color: d.palette.subtext || d.palette.foreground }}
                            className="text-[9px] font-mono tracking-widest uppercase opacity-80"
                          >
                            {d.family}
                          </Text>
                        </View>
                        <View
                          style={{ backgroundColor: d.palette.surface, borderColor: d.palette.border }}
                          className="h-20 w-full rounded-lg border items-center justify-center p-2 shadow-xs"
                        >
                          <Text
                            style={{ color: d.palette.foreground }}
                            className="text-xs font-bold tracking-wider text-center"
                            numberOfLines={1}
                          >
                            {d.name.toUpperCase()}
                          </Text>
                          <Text
                            style={{ color: d.palette.subtext || d.palette.foreground }}
                            className="text-[10px] text-center opacity-70 mt-1"
                            numberOfLines={1}
                          >
                            {d.visualTradition}
                          </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <View
                            style={{ backgroundColor: d.palette.accent }}
                            className="h-1.5 w-12 rounded-full opacity-60"
                          />
                          <Text
                            style={{ color: d.palette.foreground }}
                            className="text-[9px] font-semibold opacity-70"
                          >
                            2:3 RDC
                          </Text>
                        </View>
                      </View>
                      {/* Template Info */}
                      <View className="gap-1">
                        <View className="flex-row items-center justify-between">
                          <Text className="font-bold text-sm text-text" numberOfLines={1}>
                            {d.name}
                          </Text>
                          <View className="rounded bg-brand/10 px-2 py-0.5">
                            <Text className="text-[10px] font-bold text-brand">{d.family}</Text>
                          </View>
                        </View>
                        <Text variant="caption" numberOfLines={2} className="text-xs">
                          {d.description}
                        </Text>
                      </View>
                    </Pressable>
                  </Link>
                ))}
              </ScrollView>
            </View>

            {/* Section 2: Featured Releases (Responsive Grid for Primary Content) */}
            {featuredCards.length > 0 ? (
              <View className="gap-5">
                <View className="flex-col sm:flex-row sm:items-end justify-between gap-2">
                  <View className="gap-1 flex-1">
                    <Text className="text-2xl md:text-3xl font-extrabold tracking-tight text-text">
                      Featured Releases
                    </Text>
                    <Text variant="caption" className="text-sm text-muted-text">
                      Limited-edition drops and trending community collectibles.
                    </Text>
                  </View>
                  <Link href={{ pathname: '/cards', params: { tab: 'featured' } }} asChild>
                    <Pressable className="active:opacity-70 self-start sm:self-auto">
                      <Text className="text-sm font-semibold text-brand">See all featured →</Text>
                    </Pressable>
                  </Link>
                </View>

                {/* Primary Content Responsive Grid */}
                <View className="flex-row flex-wrap gap-6">
                  {featuredCards.slice(0, columns === 4 ? 4 : columns === 3 ? 3 : 2).map((card) => (
                    <View key={card.id} className={gridColClass}>
                      <DiscoveryCardTile card={card} />
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {/* Section 3: New & Noteworthy Cards (Responsive Grid) */}
            {newCards.length > 0 ? (
              <View className="gap-5">
                <View className="flex-col sm:flex-row sm:items-end justify-between gap-2">
                  <View className="gap-1 flex-1">
                    <Text className="text-2xl md:text-3xl font-extrabold tracking-tight text-text">
                      New & Noteworthy
                    </Text>
                    <Text variant="caption" className="text-sm text-muted-text">
                      Recently published releases across all categories.
                    </Text>
                  </View>
                  <Link href="/cards" asChild>
                    <Pressable className="active:opacity-70 self-start sm:self-auto">
                      <Text className="text-sm font-semibold text-brand">Browse catalog →</Text>
                    </Pressable>
                  </Link>
                </View>

                <View className="flex-row flex-wrap gap-6">
                  {newCards.slice(0, columns === 4 ? 8 : columns === 3 ? 6 : 4).map((card) => (
                    <View key={card.id} className={gridColClass}>
                      <DiscoveryCardTile card={card} />
                    </View>
                  ))}
                </View>
              </View>
            ) : selectedCategory !== 'All' ? (
              <View className="items-center py-12 gap-4 rounded-2xl border border-border/60 bg-surface">
                <EmptyState
                  icon={CreditCard}
                  title={`No ${selectedCategory} cards classified yet`}
                  description={
                    selectedCategory === 'Sports'
                      ? 'No sports cards have been published yet. Be the first to create one!'
                      : `Pursuit classification for ${selectedCategory} is scheduled for the upcoming data release. Browse All cards or design a custom ${selectedCategory} card in Studio.`
                  }
                />
                <Button
                  size="sm"
                  variant="primary"
                  onPress={() => setSelectedCategory('All')}
                >
                  Browse All Cards
                </Button>
              </View>
            ) : null}

            {/* Section 4: Cultural Icons & People */}
            {people.length > 0 ? (
              <View className="gap-5">
                <View className="flex-col sm:flex-row sm:items-end justify-between gap-2">
                  <View className="gap-1 flex-1">
                    <Text className="text-2xl md:text-3xl font-extrabold tracking-tight text-text">
                      Cultural Icons & People
                    </Text>
                    <Text variant="caption" className="text-sm text-muted-text">
                      Discover profiles with rich biographies and achievements.
                    </Text>
                  </View>
                  <Link href="/players" asChild>
                    <Pressable className="active:opacity-70 self-start sm:self-auto">
                      <Text className="text-sm font-semibold text-brand">See all people →</Text>
                    </Pressable>
                  </Link>
                </View>

                <View className="flex-row flex-wrap gap-4">
                  {people.slice(0, 4).map((p) => (
                    <View key={p.id} className="w-full sm:w-[calc(50%-8px)]">
                      <PersonRowTile person={p} />
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {/* Section 5: Creative Studio Prompt Banner */}
            <View className="rounded-2xl border border-border/80 bg-surface p-8 md:p-14 shadow-xs items-center text-center">
              <View className="max-w-xl items-center gap-4">
                <View className="h-14 w-14 items-center justify-center rounded-2xl bg-brand/10">
                  <Sparkles size={28} color={brandColor} strokeWidth={2} />
                </View>
                <Text className="text-2xl md:text-4xl font-extrabold tracking-tight text-text text-center">
                  Design your own collectible card
                </Text>
                <Text variant="caption" className="text-center text-sm md:text-base max-w-md text-muted-text">
                  Choose a subject, compose artwork and typography in Card Studio, and publish your numbered release.
                </Text>
                <Link href="/cards/studio" asChild className="mt-2">
                  <Button size="lg" variant="primary" icon={Plus}>
                    Open Card Studio
                  </Button>
                </Link>
              </View>
            </View>
          </View>
        )}
      </View>
    </Screen>
  )
}

/**
 * Standard Discovery Card Tile
 * Displays collectible cards with uniform 2:3 proportions, clear primary click target,
 * separately accessible creator attribution, and zero nested link warnings.
 */
function DiscoveryCardTile({ card }: { card: Card }) {
  const isOfficial = card.publicationType === 'OFFICIAL'

  return (
    <View className="overflow-hidden rounded-2xl border border-border/70 bg-surface p-4 gap-3 shadow-xs hover:border-brand/50 hover:shadow-md transition-all">
      {/* Primary Click Action: Card Artwork Preview Well */}
      <Link
        href={{ pathname: '/cards/[cardId]', params: { cardId: card.id, source: 'EXPLORE' } }}
        asChild
      >
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`View ${card.title} card details`}
          className="w-full items-center justify-center rounded-xl bg-neutral-100/80 dark:bg-neutral-900/40 py-4 shadow-inner active:opacity-80"
        >
          <ConnectedStatmanCard
            card={card}
            size="rail"
            source="EXPLORE"
            withDetailLink={false}
          />
        </Pressable>
      </Link>

      {/* Metadata Hierarchy */}
      <View className="gap-1.5 pt-1">
        <View className="flex-row items-center justify-between">
          <Badge tone={isOfficial ? 'verified' : 'muted-text'}>
            {isOfficial ? 'Official' : 'Community'}
          </Badge>
          <Text variant="caption" className="text-[11px] font-semibold text-muted-text">
            {editionLabel(card)}
          </Text>
        </View>

        <Link
          href={{ pathname: '/cards/[cardId]', params: { cardId: card.id, source: 'EXPLORE' } }}
          asChild
        >
          <Pressable accessibilityRole="link" className="active:opacity-70">
            <Text className="font-bold text-base text-text hover:text-brand transition-colors" numberOfLines={1}>
              {card.title}
            </Text>
          </Pressable>
        </Link>

        {/* Separately accessible creator attribution */}
        <Text variant="caption" numberOfLines={1} className="text-xs text-muted-text">
          {athleteFullName(card)} · By {creatorDisplayHandle(card.createdByUserId)}
          {card.publishedByUserId && card.publishedByUserId !== card.createdByUserId
            ? ` · Pub ${creatorDisplayHandle(card.publishedByUserId)}`
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
    <View className="flex-row items-center justify-between rounded-2xl border border-border/70 bg-surface p-4 hover:border-brand/40 transition-all">
      <Link
        href={{ pathname: '/people/[personId]', params: { personId: person.id } }}
        asChild
      >
        <Pressable className="flex-1 flex-row items-center gap-3 active:opacity-70">
          <Avatar
            uri={person.avatarUrl}
            fallback={person.displayName}
            size="md"
          />
          <View className="flex-1 min-w-0 gap-0.5">
            <View className="flex-row items-center gap-1.5">
              <Text className="font-bold text-text" numberOfLines={1}>
                {person.displayName}
              </Text>
              {person.claimedByUserId ? (
                <Badge tone="verified">Claimed</Badge>
              ) : null}
            </View>
            {subtitle ? (
              <Text variant="caption" numberOfLines={1} className="text-xs">
                {subtitle}
              </Text>
            ) : null}
          </View>
        </Pressable>
      </Link>
      <View className="flex-row items-center gap-2 ml-3">
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
