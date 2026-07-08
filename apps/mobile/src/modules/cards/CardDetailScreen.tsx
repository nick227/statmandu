import { useState } from 'react'
import { Pressable, Share, View } from 'react-native'
import { Link } from 'expo-router'
import { Text } from '@/shared/ui/Text'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { BackButton } from '@/shared/ui/BackButton'
import { LoadingState } from '@/shared/ui/LoadingState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Screen } from '@/shared/layout'
import { SmartImage } from '@/shared/media/SmartImage'
import { useCardDetail } from './useCardDetail'
import { ConnectedCardClaimButton } from './ConnectedCardClaimButton'
import { CardAuthenticitySheet } from './CardAuthenticitySheet'
import {
  CARD_STATUS_LABEL,
  CARD_STATUS_TONE,
  CARD_TYPE_LABEL,
  athleteFullName,
  cardImageUri,
  editionLabel,
} from './cardDisplay'

export function CardDetailScreen({ cardId }: { cardId: string }) {
  const { card, isLoading, isError, markDownloaded } = useCardDetail(cardId)
  const [authenticityVisible, setAuthenticityVisible] = useState(false)

  if (isError) {
    return (
      <Screen>
        <View className="px-lg pb-md"><BackButton tone="dark" /></View>
        <ErrorState className="flex-1 items-center justify-center gap-sm p-lg" message="This card couldn't be loaded." />
      </Screen>
    )
  }

  if (isLoading || !card) {
    return (
      <Screen>
        <View className="px-lg pb-md"><BackButton tone="dark" /></View>
        <LoadingState />
      </Screen>
    )
  }

  const imageUri = cardImageUri(card)
  const issueId = card.currentUserIssue?.id
  const alreadyDownloaded = card.currentUserIssue?.status === 'DOWNLOADED'

  async function handleDownload() {
    if (!issueId) return
    const result = await markDownloaded.mutateAsync(issueId)
    // No on-device file-save yet — expo-file-system/expo-media-library
    // aren't installed in this app. Share sheet (image URL + authenticity
    // text) is the UI/action boundary for MVP; swap in a real save-to-disk
    // call once that native module is added.
    await Share.share({ message: result.data.authenticity.text, url: card!.frontImage?.url ?? undefined })
  }

  return (
    <>
      <Screen scroll>
        <View className="px-lg pb-md"><BackButton tone="dark" /></View>

        <View className="mx-lg overflow-hidden rounded-lg bg-black" style={{ height: 420 }}>
          {imageUri ? (
            <SmartImage uri={imageUri} className="h-full w-full" resizeMode="cover" />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-white/60">No image yet</Text>
            </View>
          )}
        </View>

        <View className="gap-md px-lg pt-lg">
          <View className="flex-row items-center justify-between">
            <Badge tone="muted-text">{CARD_TYPE_LABEL[card.cardType]}</Badge>
            <Badge tone={CARD_STATUS_TONE[card.status]}>{CARD_STATUS_LABEL[card.status]}</Badge>
          </View>

          <View className="gap-xs">
            <Text className="text-2xl font-bold">{card.title}</Text>
            {/* Athlete name only, not linked — Card only carries athleteProfileId,
                and the player profile route is keyed on the separate Player.id
                (AthleteProfile:Player isn't 1:1 in the schema). Resolving that
                needs a backend join this workstream doesn't own; deferred
                rather than guessing, same call as hometown/@username on the
                player profile itself. */}
            <Text variant="caption">{athleteFullName(card)}</Text>
          </View>

          <View className="flex-row flex-wrap gap-sm">
            {card.team ? (
              <Link href={{ pathname: '/teams/[teamId]', params: { teamId: card.team.id } }} asChild>
                <Button variant="secondary" size="sm">{`View ${card.team.name}`}</Button>
              </Link>
            ) : null}
            {card.game ? (
              <Link href={{ pathname: '/games/[gameId]', params: { gameId: card.game.id } }} asChild>
                <Button variant="secondary" size="sm">View game</Button>
              </Link>
            ) : null}
          </View>

          <View className="gap-xs rounded-md border border-border bg-surface p-md">
            <Text variant="caption">Edition</Text>
            <Text className="font-semibold">{editionLabel(card)}</Text>
          </View>

          {card.originHash ? (
            <Pressable
              onPress={() => setAuthenticityVisible(true)}
              className="flex-row items-center justify-between rounded-md border border-border bg-surface p-md active:opacity-70"
            >
              <View className="flex-1 pr-sm">
                <Text variant="caption">Origin hash</Text>
                <Text className="font-mono" numberOfLines={1}>{card.originHash}</Text>
              </View>
              <Text variant="caption" className="font-semibold text-brand">What's this?</Text>
            </Pressable>
          ) : null}

          <ConnectedCardClaimButton card={card} />

          {card.currentUserHasClaimed && issueId ? (
            <Button variant="secondary" isLoading={markDownloaded.isPending} onPress={handleDownload}>
              {alreadyDownloaded ? 'Share again' : 'Download'}
            </Button>
          ) : null}
        </View>
      </Screen>

      <CardAuthenticitySheet
        visible={authenticityVisible}
        onClose={() => setAuthenticityVisible(false)}
        originHash={card.originHash}
      />
    </>
  )
}
