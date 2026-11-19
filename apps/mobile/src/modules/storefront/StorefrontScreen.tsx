import React, { useState } from 'react'
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { Screen } from '@/shared/layout/Screen'
import { Text } from '@/shared/ui/Text'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Badge } from '@/shared/ui/Badge'
import { LoadingState } from '@/shared/ui/LoadingState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { SmartImage } from '@/shared/media/SmartImage'
import { StatmanCard } from '@/modules/cards/StatmanCard'
import {
  useStorefront,
  useStorefrontReleases,
  useUpdateMyStorefront,
  useStorefrontUser,
} from '@/modules/studio/hooks/useStorefront'
import { editionLabel } from '@/modules/cards/cardDisplay'
import { cn } from '@/lib/utils'
import { Store, Plus, Edit3, Check, X, ShieldCheck, Users } from 'lucide-react-native'

export interface StorefrontScreenProps {
  username: string
}

export function StorefrontScreen({ username }: StorefrontScreenProps) {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const isWide = width >= 768

  const { username: currentUsername } = useStorefrontUser()
  const isOwner = Boolean(currentUsername && currentUsername === username)

  const storefrontQuery = useStorefront(username)
  const releasesQuery = useStorefrontReleases(username)
  const updateStorefrontMutation = useUpdateMyStorefront()

  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [descriptionInput, setDescriptionInput] = useState('')

  const storefront = storefrontQuery.data
  const releases = releasesQuery.data?.releases ?? []

  if (storefrontQuery.isLoading || releasesQuery.isLoading) {
    return (
      <Screen title="Creator Storefront" withBack>
        <LoadingState label="Loading creator catalog" />
      </Screen>
    )
  }

  if (storefrontQuery.isError || !storefront) {
    return (
      <Screen title="Creator Storefront" withBack>
        <ErrorState message={`Storefront @${username} could not be loaded.`} />
      </Screen>
    )
  }

  async function handleSaveDescription() {
    await updateStorefrontMutation.mutateAsync({
      description: descriptionInput.trim() || null,
    })
    setIsEditingDescription(false)
  }

  return (
    <Screen title={`@${username} · Storefront`} withBack scroll>
      {/* Creator Header Profile Card */}
      <View className="mb-lg rounded-3xl border border-border bg-surface p-lg">
        <View className="flex-row items-center gap-md">
          {storefront.avatarUrl ? (
            <SmartImage
              uri={storefront.avatarUrl}
              className="h-20 w-20 rounded-2xl border border-border"
              resizeMode="cover"
            />
          ) : (
            <View className="h-20 w-20 items-center justify-center rounded-2xl border border-border bg-card-surface">
              <Store size={32} className="text-muted-text" />
            </View>
          )}

          <View className="flex-1 gap-xs">
            <View className="flex-row flex-wrap items-center gap-xs">
              <Text className="text-2xl font-bold text-text">
                {storefront.displayName || `@${storefront.username}`}
              </Text>
              <Badge tone="muted-text">Creator Catalog</Badge>
            </View>
            <Text className="text-sm font-semibold text-brand">@{storefront.username}</Text>
            <Text variant="caption">
              {releases.length} published {releases.length === 1 ? 'release' : 'releases'}
            </Text>
          </View>
        </View>

        {/* Creator Catalog Bio / Description */}
        {!isEditingDescription ? (
          <View className="mt-md border-t border-border pt-md">
            {storefront.description ? (
              <Text className="text-sm leading-relaxed text-text">{storefront.description}</Text>
            ) : (
              <Text variant="caption" className="italic">
                {isOwner
                  ? 'Add a creator statement or bio to introduce your collectible catalog.'
                  : 'No creator description provided.'}
              </Text>
            )}

            {isOwner && (
              <View className="mt-sm flex-row gap-xs">
                <Button
                  size="sm"
                  variant="ghost"
                  icon={Edit3}
                  onPress={() => {
                    setDescriptionInput(storefront.description || '')
                    setIsEditingDescription(true)
                  }}
                >
                  Edit Statement
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  icon={Plus}
                  onPress={() => router.push('/cards/studio')}
                >
                  New Release in Studio
                </Button>
              </View>
            )}
          </View>
        ) : (
          /* Editing description */
          <View className="mt-md gap-sm border-t border-border pt-md">
            <Text className="text-xs font-semibold uppercase text-muted-text">
              Creator Catalog Statement (max 2,000 characters)
            </Text>
            <Input
              testID="creator-statement-input"
              value={descriptionInput}
              onChangeText={(t) => setDescriptionInput(t.slice(0, 2000))}
              placeholder="Tell collectors about your work, creative vision, and editions..."
              multiline
              numberOfLines={4}
            />
            <View className="flex-row justify-end gap-xs">
              <Button size="sm" variant="ghost" icon={X} onPress={() => setIsEditingDescription(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                icon={Check}
                isLoading={updateStorefrontMutation.isPending}
                onPress={handleSaveDescription}
              >
                Save
              </Button>
            </View>
          </View>
        )}
      </View>

      {/* Catalog Releases Section */}
      <View className="gap-md pb-xl">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-text">Published Collectibles</Text>
          <Text variant="caption">Immutable Numbered Editions</Text>
        </View>

        {releases.length === 0 ? (
          <View className="items-center justify-center rounded-2xl border border-dashed border-border py-xl">
            <Store size={36} className="text-muted-text mb-sm" />
            <Text className="text-base font-semibold text-text">No releases published yet</Text>
            <Text variant="caption" className="mt-xs text-center max-w-sm">
              {isOwner
                ? 'Create reusable designs and publish your first collectible release in Card Studio.'
                : 'This creator has not published any public collectible editions yet.'}
            </Text>
            {isOwner && (
              <Button
                size="sm"
                variant="primary"
                icon={Plus}
                className="mt-md"
                onPress={() => router.push('/cards/studio')}
              >
                Go to Card Studio
              </Button>
            )}
          </View>
        ) : (
          <View className={cn('gap-lg', width >= 640 && 'flex-row flex-wrap')}>
            {releases.map((release) => {
              const subjectName = release.person?.displayName ?? release.athlete?.displayName ?? 'Subject'
              const isOfficial = release.publicationType === 'OFFICIAL'
              const colClass =
                width >= 1440
                  ? 'w-[23.5%]'
                  : width >= 1024
                  ? 'w-[31.5%]'
                  : width >= 640
                  ? 'w-[48%]'
                  : 'w-full'

              return (
                <View
                  key={release.id}
                  className={cn('rounded-2xl border border-border bg-surface p-md shadow-sm hover:border-brand/40 hover:shadow-md transition-all', colClass)}
                >
                  {/* Card Artwork */}
                  <Link
                    href={{ pathname: '/cards/[cardId]', params: { cardId: release.id } }}
                    asChild
                  >
                    <Pressable className="items-center py-xs">
                      <StatmanCard card={release} size={isWide ? 'detail' : 'featured'} />
                    </Pressable>
                  </Link>

                  {/* Metadata and Attribution */}
                  <View className="mt-sm gap-xs">
                    <Link href={{ pathname: '/cards/[cardId]', params: { cardId: release.id } }}>
                      <Text className="font-bold text-lg text-text">{release.title}</Text>
                    </Link>
                    <Text variant="caption">{subjectName}</Text>

                    <View className="mt-xs flex-row flex-wrap items-center justify-between gap-xs border-t border-border pt-xs">
                      <Badge tone={isOfficial ? 'verified' : 'muted-text'}>
                        {isOfficial ? 'Official Release' : 'Community Edition'}
                      </Badge>
                      <Text variant="caption" className="font-semibold">
                        {editionLabel(release)}
                      </Text>
                    </View>
                  </View>
                </View>
              )
            })}
          </View>
        )}
      </View>
    </Screen>
  )
}
