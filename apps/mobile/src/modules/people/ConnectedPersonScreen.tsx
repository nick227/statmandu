import React from 'react'
import { Pressable, View, useWindowDimensions } from 'react-native'
import { Link, useLocalSearchParams } from 'expo-router'
import { usePerson, useAthleteCards } from '@statman/sdk'
import { Plus, Share2, MapPin, CreditCard, Sparkles } from 'lucide-react-native'
import { Screen } from '@/shared/layout/Screen'
import { Text } from '@/shared/ui/Text'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { Avatar } from '@/shared/ui/Avatar'
import { LoadingState } from '@/shared/ui/LoadingState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ConnectedStatmanCard } from '@/modules/cards/ConnectedStatmanCard'
import { sharePublicEntity } from '@/shared/share/sharePublicEntity'
import { cn } from '@/lib/utils'

export function ConnectedPersonScreen() {
  const { personId } = useLocalSearchParams<{ personId: string }>()
  const { width } = useWindowDimensions()
  const personQuery = usePerson(personId)
  const cardsQuery = useAthleteCards(personId)

  const person = personQuery.data?.data
  const cards = cardsQuery.data?.data ?? []

  const isWide = width >= 768
  const isDesktop = width >= 1024
  const isLargeDesktop = width >= 1440

  const gridColClass =
    isLargeDesktop
      ? 'w-[23.5%]'
      : isDesktop
      ? 'w-[31.5%]'
      : isWide
      ? 'w-[48%]'
      : 'w-full'

  if (personQuery.isLoading) {
    return (
      <Screen title="Profile" withBack>
        <LoadingState label="Loading profile" />
      </Screen>
    )
  }

  if (personQuery.error || !person) {
    return (
      <Screen title="Profile" withBack>
        <ErrorState message={personQuery.error?.message ?? 'Person profile not found.'} />
      </Screen>
    )
  }

  function handleShare() {
    void sharePublicEntity({
      title: person!.displayName,
      message: person!.bio ?? undefined,
      path: `/people/${personId}`,
    }).catch(() => {})
  }

  return (
    <Screen title={person.displayName} withBack scroll>
      <View className="w-full gap-xl pb-xxl">
        {/* Profile Hero Header */}
        <View className="rounded-3xl border border-border bg-surface p-lg md:p-xl shadow-sm gap-md">
          <View className={cn('gap-md', isWide ? 'flex-row items-start justify-between' : 'flex-col')}>
            <View className="flex-row items-center gap-md flex-1 min-w-0">
              <Avatar
                uri={person.avatarUrl}
                fallback={person.displayName}
                size="xl"
                className="shadow-sm border-2 border-border"
              />
              <View className="flex-1 min-w-0 gap-xs">
                <View className="flex-row flex-wrap items-center gap-xs">
                  <Text className="text-2xl md:text-3xl font-extrabold tracking-tight text-text" numberOfLines={1}>
                    {person.displayName}
                  </Text>
                  {person.claimedByUserId ? (
                    <Badge tone="verified">Claimed</Badge>
                  ) : null}
                </View>

                {person.hometown ? (
                  <View className="flex-row items-center gap-1">
                    <MapPin size={14} className="text-muted-text" />
                    <Text variant="caption" className="text-xs text-muted-text">
                      {person.hometown}
                    </Text>
                  </View>
                ) : null}

                {person.aliases && person.aliases.length > 0 ? (
                  <View className="flex-row flex-wrap gap-xs pt-0.5">
                    {person.aliases.map((alias) => (
                      <Badge key={alias} tone="muted-text">
                        {alias}
                      </Badge>
                    ))}
                  </View>
                ) : null}
              </View>
            </View>

            {/* Actions */}
            <View className="flex-row items-center gap-sm">
              <Button
                variant="secondary"
                size="sm"
                icon={Share2}
                onPress={handleShare}
              >
                Share
              </Button>
              <Link
                href={{
                  pathname: '/cards/studio',
                  params: { athleteProfileId: person.id },
                }}
                asChild
              >
                <Button variant="primary" size="sm" icon={Plus}>
                  Create Card
                </Button>
              </Link>
            </View>
          </View>

          {/* Bio statement */}
          {person.bio ? (
            <View className="pt-xs border-t border-border/60">
              <Text className="text-sm md:text-base leading-relaxed text-text/90">
                {person.bio}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Collectibles Section */}
        <View className="gap-md">
          {/* Section Header */}
          <View className="flex-row items-center justify-between">
            <View className="gap-0.5">
              <Text className="text-xl md:text-2xl font-bold tracking-tight text-text">
                Published Collectibles
              </Text>
              <Text variant="caption" className="text-xs text-muted-text">
                {cards.length} {cards.length === 1 ? 'edition' : 'editions'} published for {person.displayName}
              </Text>
            </View>
            {cards.length > 0 ? (
              <Link
                href={{
                  pathname: '/cards/studio',
                  params: { athleteProfileId: person.id },
                }}
                asChild
              >
                <Button variant="ghost" size="sm" icon={Sparkles}>
                  New Edition
                </Button>
              </Link>
            ) : null}
          </View>

          {cardsQuery.isLoading ? (
            <LoadingState label="Loading collectibles" />
          ) : cards.length > 0 ? (
            <View className={cn('gap-lg', isWide && 'flex-row flex-wrap')}>
              {cards.map((card) => (
                <View
                  key={card.id}
                  className={cn(
                    'rounded-2xl border border-border bg-surface p-md shadow-sm hover:border-brand/40 hover:shadow-md transition-all',
                    gridColClass
                  )}
                >
                  <ConnectedStatmanCard card={card} size="rail" source="PROFILE" />
                </View>
              ))}
            </View>
          ) : (
            <View className="items-center py-md gap-md">
              <EmptyState
                icon={CreditCard}
                title={`No cards published yet for ${person.displayName}`}
                description="Be the first creator to honor this person with a dedicated collectible edition in Card Studio."
              />
              <Link
                href={{
                  pathname: '/cards/studio',
                  params: { athleteProfileId: person.id },
                }}
                asChild
              >
                <Button variant="primary" size="sm" icon={Plus}>
                  Create First Card
                </Button>
              </Link>
            </View>
          )}
        </View>
      </View>
    </Screen>
  )
}
