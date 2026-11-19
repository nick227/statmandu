import { useMemo } from 'react'
import { Pressable, View, useWindowDimensions } from 'react-native'
import { Link } from 'expo-router'
import {
  CreditCard,
  Plus,
  TrendingUp,
  Layers,
  Store,
  CheckCircle2,
} from 'lucide-react-native'
import { Screen } from '@/shared/layout/Screen'
import { Text } from '@/shared/ui/Text'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { SignInPrompt } from '@/shared/ui/SignInPrompt'
import { ConnectedStatmanCard } from '@/modules/cards/ConnectedStatmanCard'
import { athleteFullName, editionLabel } from '@/modules/cards/cardDisplay'
import { isEditableCardStatus } from '@/modules/cards/builder/cardFromApi'
import { useCardManager } from '@/modules/cards/useCardManager'
import { useCardsBrowse, type CardsBrowseTab } from '@/modules/cards/useCardsBrowse'
import { useAuthGate } from '@/modules/auth/useAuthGate'
import { useNativeColor } from '@/lib/theme'
import { cn } from '@/lib/utils'

function gridColumns(width: number): number {
  if (width >= 1440) return 4
  if (width >= 1024) return 3
  if (width >= 640) return 2
  return 1
}

export function CardManagerScreen({ initialTab: _initialTab }: { initialTab?: CardsBrowseTab } = {}) {
  const { width } = useWindowDimensions()
  const columns = gridColumns(width)
  const brandColor = useNativeColor('brand')

  const { isAuthenticated, isAuthLoading } = useAuthGate()
  const browse = useCardsBrowse(isAuthenticated, 'collections')
  const manager = useCardManager(isAuthenticated && !isAuthLoading)

  const createdCards = manager.createdCards
  const claimedCards = browse.claimedCards
  const savedCards = browse.savedCards

  // Sales and Collection Metrics for Hot Sellers
  const salesMetrics = useMemo(() => {
    const totalSold = createdCards.reduce((acc, c) => acc + (c.issuedCount ?? 0), 0)
    const activeReleases = createdCards.filter((c) => c.status === 'PUBLISHED').length
    const limitedCards = createdCards.filter((c) => c.editionMode === 'LIMITED' && (c.editionSize ?? 0) > 0)
    const totalLimitedCapacity = limitedCards.reduce((acc, c) => acc + (c.editionSize ?? 0), 0)
    const totalLimitedClaimed = limitedCards.reduce((acc, c) => acc + (c.issuedCount ?? 0), 0)
    const sellThroughRate =
      totalLimitedCapacity > 0 ? Math.round((totalLimitedClaimed / totalLimitedCapacity) * 100) : 0

    return {
      totalSold,
      activeReleases,
      totalOwned: claimedCards.length,
      totalSaved: savedCards.length,
      sellThroughRate,
    }
  }, [createdCards, claimedCards.length, savedCards.length])

  if (browse.isError || manager.isError) {
    return (
      <Screen title="Collection" insetTop={false}>
        <View className="px-lg py-xl">
          <ErrorState message="Could not load your collection and releases." />
        </View>
      </Screen>
    )
  }

  if (browse.isLoading || manager.isLoading || isAuthLoading) {
    return (
      <Screen title="Collection" insetTop={false}>
        <View className="w-full max-w-[1800px] mx-auto px-4 md:px-8 lg:px-12 py-8 gap-8">
          <View className="flex-row gap-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 flex-1 rounded-2xl" />
            ))}
          </View>
          <Skeleton className="h-80 w-full rounded-2xl" />
        </View>
      </Screen>
    )
  }

  if (!isAuthenticated) {
    return (
      <Screen title="Collection" insetTop={false}>
        <View className="w-full max-w-xl mx-auto px-4 py-16 items-center">
          <View className="w-full rounded-2xl border border-border bg-surface p-8 md:p-12 items-center gap-5 shadow-xs">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-brand/10">
              <Store size={28} color={brandColor} />
            </View>
            <View className="items-center gap-1.5">
              <Text className="text-2xl font-bold text-text text-center">Your Collection</Text>
              <Text variant="caption" className="text-sm text-muted-text text-center max-w-md">
                Sign in to collect digital cards, manage your vault, and track editions you've created.
              </Text>
            </View>
            <View className="w-full max-w-xs pt-2">
              <SignInPrompt variant="primary" message="Sign in to your account" />
            </View>
          </View>
        </View>
      </Screen>
    )
  }

  // Exact responsive grid layout calculation with 24px gaps
  const gridColClass =
    'w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)]'

  return (
    <Screen insetTop={false} scroll>
      <View className="w-full max-w-[1800px] mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12 gap-12 md:gap-16 pb-28">
        {/* Header & Seller Actions */}
        <View className="flex-row flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-6">
          <View className="gap-1">
            <View className="flex-row items-center gap-2">
              <View className="h-8 w-8 items-center justify-center rounded-xl bg-brand/10">
                <Store size={18} color={brandColor} />
              </View>
              <Text className="text-3xl md:text-4xl font-extrabold tracking-tight text-text">
                Collection & Sales
              </Text>
            </View>
            <Text variant="caption" className="text-sm text-muted-text">
              Track public collectible sales, monitor edition velocity, and manage your vault.
            </Text>
          </View>

          <Link href="/cards/studio" asChild>
            <Button size="md" variant="primary" icon={Plus}>
              New Drop in Studio
            </Button>
          </Link>
        </View>

        {/* 1. Hot Seller's Performance Metrics Deck */}
        <View className="flex-row flex-wrap gap-4">
          <MetricCard
            icon={TrendingUp}
            label="Copies Sold / Claimed"
            value={salesMetrics.totalSold.toString()}
            detail="Across all published drops"
            tone="brand"
          />
          <MetricCard
            icon={Store}
            label="Active Drops for Sale"
            value={salesMetrics.activeReleases.toString()}
            detail={`${createdCards.length} total designs`}
            tone="brand"
          />
          <MetricCard
            icon={CheckCircle2}
            label="Sell-Through Rate"
            value={`${salesMetrics.sellThroughRate}%`}
            detail="Of limited inventory claimed"
            tone="verified"
          />
          <MetricCard
            icon={Layers}
            label="Owned in Vault"
            value={salesMetrics.totalOwned.toString()}
            detail="Numbered copies collected"
            tone="neutral"
          />
        </View>

        {/* 2. For Sale & Created Releases (Seller's Watchlist) */}
        <View className="gap-6">
          <View className="flex-row items-end justify-between">
            <View className="gap-1">
              <Text className="text-2xl md:text-3xl font-extrabold tracking-tight text-text">
                Your Releases & Editions for Sale
              </Text>
              <Text variant="caption" className="text-sm text-muted-text">
                Live edition inventory, claiming velocity, and collector traction.
              </Text>
            </View>
            <Link href="/cards/studio" asChild>
              <Pressable className="active:opacity-70">
                <Text className="text-sm font-semibold text-brand">+ Create Release</Text>
              </Pressable>
            </Link>
          </View>

          {createdCards.length > 0 ? (
            <View className="flex-row flex-wrap gap-6">
              {createdCards.map((card) => {
                const isLimited = card.editionMode === 'LIMITED' && Boolean(card.editionSize)
                const soldCount = card.issuedCount ?? 0
                const sizeCount = card.editionSize ?? 0
                const percent = isLimited && sizeCount > 0 ? Math.min(100, Math.round((soldCount / sizeCount) * 100)) : 100
                const isEditable = isEditableCardStatus(card.status)

                const targetHref = isEditable
                  ? ({ pathname: '/cards/studio', params: { cardId: card.id } } as const)
                  : ({ pathname: '/cards/[cardId]', params: { cardId: card.id } } as const)

                return (
                  <View
                    key={card.id}
                    className={cn(
                      'overflow-hidden rounded-2xl border border-border/70 bg-surface p-4 gap-4 shadow-xs hover:border-brand/40 hover:shadow-md transition-all',
                      gridColClass
                    )}
                  >
                    {/* Primary Action Target: Card Preview Well */}
                    <Link href={targetHref as never} asChild>
                      <Pressable
                        accessibilityRole="link"
                        accessibilityLabel={`View ${card.title}`}
                        className="w-full items-center justify-center rounded-xl bg-neutral-100/80 dark:bg-neutral-900/40 py-4 shadow-inner active:opacity-80"
                      >
                        <ConnectedStatmanCard
                          card={card}
                          size="rail"
                          showStatus={true}
                          editInStudio={true}
                          withDetailLink={false}
                          authState={{ isAuthenticated, isAuthLoading }}
                        />
                      </Pressable>
                    </Link>

                    {/* Sales Performance Tracker */}
                    <View className="gap-2">
                      <View className="flex-row items-center justify-between">
                        <Badge tone={card.status === 'PUBLISHED' ? 'verified' : 'muted-text'}>
                          {card.status}
                        </Badge>
                        <Text variant="caption" className="text-xs font-bold text-text">
                          {isLimited ? `${soldCount} / ${sizeCount} claimed` : `${soldCount} claimed`}
                        </Text>
                      </View>

                      {/* Visual Sales Progress Bar */}
                      {isLimited ? (
                        <View className="w-full h-2 rounded-full bg-border overflow-hidden">
                          <View
                            style={{ width: `${percent}%` }}
                            className="h-full bg-brand rounded-full"
                          />
                        </View>
                      ) : null}

                      <Link href={targetHref as never} asChild>
                        <Pressable accessibilityRole="link" className="active:opacity-70">
                          <Text className="font-bold text-base text-text pt-0.5 hover:text-brand transition-colors" numberOfLines={1}>
                            {card.title}
                          </Text>
                        </Pressable>
                      </Link>

                      <View className="flex-row items-center justify-between pt-1 border-t border-border/40">
                        <Text variant="caption" className="text-xs text-muted-text" numberOfLines={1}>
                          {editionLabel(card)}
                        </Text>
                        <Link href={targetHref as never} asChild>
                          <Pressable className="active:opacity-70">
                            <Text className="text-xs font-bold text-brand">
                              {isEditable ? 'Edit in Studio →' : 'View details →'}
                            </Text>
                          </Pressable>
                        </Link>
                      </View>
                    </View>
                  </View>
                )
              })}
            </View>
          ) : (
            <View className="items-center py-12 gap-4 rounded-2xl border border-border/60 bg-surface">
              <EmptyState
                icon={Store}
                title="No releases created yet"
                description="Design your first collectible in Card Studio and publish a numbered release for collectors to claim."
              />
              <Link href="/cards/studio" asChild>
                <Button size="sm" variant="primary" icon={Plus}>
                  Open Card Studio
                </Button>
              </Link>
            </View>
          )}
        </View>

        {/* 3. Your Vault (Owned Copies) */}
        <View className="gap-6">
          <View className="gap-1">
            <Text className="text-2xl md:text-3xl font-extrabold tracking-tight text-text">
              Owned Copies in Your Vault
            </Text>
            <Text variant="caption" className="text-sm text-muted-text">
              Individually numbered collectible copies claimed and cryptographically verified.
            </Text>
          </View>

          {claimedCards.length > 0 ? (
            <View className="flex-row flex-wrap gap-6">
              {claimedCards.map((card) => {
                const issueNumber = card.currentUserIssue?.issueNumber
                const totalCopies = card.editionSize

                return (
                  <View
                    key={card.id}
                    className={cn(
                      'overflow-hidden rounded-2xl border border-border/70 bg-surface p-4 gap-4 shadow-xs hover:border-brand/40 hover:shadow-md transition-all',
                      gridColClass
                    )}
                  >
                    <Link
                      href={{ pathname: '/cards/[cardId]', params: { cardId: card.id, source: 'EXPLORE' } }}
                      asChild
                    >
                      <Pressable
                        accessibilityRole="link"
                        accessibilityLabel={`View owned ${card.title}`}
                        className="w-full items-center justify-center rounded-xl bg-neutral-100/80 dark:bg-neutral-900/40 py-4 shadow-inner active:opacity-80"
                      >
                        <ConnectedStatmanCard
                          card={card}
                          size="rail"
                          source="EXPLORE"
                          withDetailLink={false}
                          authState={{ isAuthenticated, isAuthLoading }}
                        />
                      </Pressable>
                    </Link>

                    <View className="gap-1.5">
                      <View className="flex-row items-center justify-between">
                        <Badge tone="verified">Owned Vault Copy</Badge>
                        {issueNumber ? (
                          <Text variant="caption" className="text-xs font-bold text-brand font-mono">
                            #{issueNumber} {totalCopies ? `of ${totalCopies}` : ''}
                          </Text>
                        ) : null}
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

                      <Text variant="caption" className="text-xs text-muted-text" numberOfLines={1}>
                        {athleteFullName(card)} · {editionLabel(card)}
                      </Text>
                    </View>
                  </View>
                )
              })}
            </View>
          ) : (
            <View className="items-center py-10 gap-2 rounded-2xl border border-border/60 bg-surface">
              <EmptyState
                icon={CreditCard}
                title="No owned copies yet"
                description="Browse public releases on Discover to claim your first numbered collectible copy."
              />
            </View>
          )}
        </View>

        {/* 4. Saved Drops (Bookmarked) */}
        {savedCards.length > 0 ? (
          <View className="gap-6">
            <View className="gap-1">
              <Text className="text-2xl md:text-3xl font-extrabold tracking-tight text-text">
                Saved & Bookmarked Releases
              </Text>
              <Text variant="caption" className="text-sm text-muted-text">
                Collectible drops you are watching for upcoming editions or releases.
              </Text>
            </View>

            <View className="flex-row flex-wrap gap-6">
              {savedCards.map((card) => (
                <View
                  key={card.id}
                  className={cn(
                    'overflow-hidden rounded-2xl border border-border/70 bg-surface p-4 gap-4 shadow-xs hover:border-brand/40 hover:shadow-md transition-all',
                    gridColClass
                  )}
                >
                  <Link
                    href={{ pathname: '/cards/[cardId]', params: { cardId: card.id, source: 'EXPLORE' } }}
                    asChild
                  >
                    <Pressable
                      accessibilityRole="link"
                      accessibilityLabel={`View saved ${card.title}`}
                      className="w-full items-center justify-center rounded-xl bg-neutral-100/80 dark:bg-neutral-900/40 py-4 shadow-inner active:opacity-80"
                    >
                      <ConnectedStatmanCard
                        card={card}
                        size="rail"
                        source="EXPLORE"
                        withDetailLink={false}
                        authState={{ isAuthenticated, isAuthLoading }}
                      />
                    </Pressable>
                  </Link>

                  <View className="gap-1">
                    <View className="flex-row items-center justify-between">
                      <Badge tone="muted-text">Bookmarked</Badge>
                      <Text variant="caption" className="text-xs font-semibold text-muted-text">
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
                    <Text variant="caption" className="text-xs text-muted-text" numberOfLines={1}>
                      {athleteFullName(card)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </Screen>
  )
}

/** Individual Metric Summary Tile for the Seller Performance Deck */
function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tone = 'neutral',
}: {
  icon: any
  label: string
  value: string
  detail: string
  tone?: 'brand' | 'verified' | 'neutral'
}) {
  const iconColor =
    tone === 'brand' ? '#2563eb' : tone === 'verified' ? '#16a34a' : '#64748b'
  const iconBg =
    tone === 'brand'
      ? 'bg-brand/10'
      : tone === 'verified'
      ? 'bg-emerald-500/10'
      : 'bg-neutral-100 dark:bg-neutral-800'

  return (
    <View className="flex-1 min-w-[220px] rounded-2xl border border-border/80 bg-surface p-5 gap-2 shadow-xs">
      <View className="flex-row items-center justify-between">
        <Text variant="caption" className="text-xs font-semibold text-muted-text uppercase tracking-wider">
          {label}
        </Text>
        <View className={cn('h-8 w-8 items-center justify-center rounded-xl', iconBg)}>
          <Icon size={16} color={iconColor} />
        </View>
      </View>
      <Text className="text-3xl font-extrabold tracking-tight text-text">
        {value}
      </Text>
      <Text variant="caption" className="text-xs text-muted-text">
        {detail}
      </Text>
    </View>
  )
}
