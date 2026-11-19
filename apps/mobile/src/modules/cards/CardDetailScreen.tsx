import { useState } from 'react'
import { Pressable, Share, View } from 'react-native'
import { Link, useLocalSearchParams } from 'expo-router'
import { Text } from '@/shared/ui/Text'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { BackButton } from '@/shared/ui/BackButton'
import { LoadingState } from '@/shared/ui/LoadingState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Screen } from '@/shared/layout'
import { Card1AStage } from './Card1A'
import { CardCompositionRenderer } from './CardCompositionRenderer'
import { ConnectedCardClaimButton } from './ConnectedCardClaimButton'
import { ConnectedCardSaveButton } from './ConnectedCardSaveButton'
import { CardAuthenticitySheet } from './CardAuthenticitySheet'
import { CardRail } from './CardRail'
import { useCardDetail } from './useCardDetail'
import { sharePublicEntity } from '@/shared/share/sharePublicEntity'
import {
  CARD_STATUS_LABEL,
  CARD_STATUS_TONE,
  CARD_TYPE_LABEL,
  athleteFullName,
  cardFaceDataFromCard,
  editionLabel,
} from './cardDisplay'

export function CardDetailScreen({ cardId }: { cardId: string }) {
  const { card, isLoading, isError, markDownloaded, relatedCards } = useCardDetail(cardId)
  const [authenticityVisible, setAuthenticityVisible] = useState(false)
  // Which surface linked into this card — carried through to
  // markCardDownloaded so the athlete's distribution panel can show
  // downloads broken down by where they actually came from. No param (a
  // bookmarked/typed URL) reports DIRECT server-side.
  const { source } = useLocalSearchParams<{ source?: 'PROFILE' | 'HOME' | 'EXPLORE' | 'CARD_STUDIO' | 'SHARED_LINK' }>()

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

  const issueId = card.currentUserIssue?.id
  const alreadyDownloaded = card.currentUserIssue?.status === 'DOWNLOADED'

  async function handleDownload() {
    if (!issueId) return
    const result = await markDownloaded.mutateAsync({ issueId, context: source })
    // No on-device file-save yet — expo-file-system/expo-media-library
    // aren't installed in this app. Share sheet (image URL + authenticity
    // text) is the UI/action boundary for MVP; swap in a real save-to-disk
    // call once that native module is added.
    await Share.share({ message: result.data.authenticity.text, url: card!.frontImage?.url ?? undefined })
  }

  // Independent of download — sharing doesn't require a claimed issue or
  // the authenticity payload, just the card's own public info.
  function handleShare() {
    void sharePublicEntity({
      title: card!.title,
      message: [athleteFullName(card!), card!.team?.name].filter(Boolean).join(' · '),
      path: `/cards/${card!.id}`,
    })
  }

  return (
    <>
      <Screen scroll>
        <View className="px-lg pb-md"><BackButton tone="dark" /></View>

        <View className="items-center px-sm">
          {card.templateSnapshot?.composition ? (
            <CardCompositionRenderer
              composition={card.templateSnapshot.composition}
              person={card.person ?? card.templateSnapshot.person}
              assets={card.templateSnapshot.assets}
              issue={card.currentUserIssue}
              width={320}
            />
          ) : (
            <Card1AStage data={cardFaceDataFromCard(card)} />
          )}
        </View>

        <View className="gap-md px-lg pt-lg">
          <View className="flex-row items-center justify-between">
            <Badge tone="muted-text">{CARD_TYPE_LABEL[card.cardType]}</Badge>
            <Badge tone={CARD_STATUS_TONE[card.status]}>{CARD_STATUS_LABEL[card.status]}</Badge>
          </View>

          <View className="gap-xs">
            <Text className="text-2xl font-bold">{card.title}</Text>
            <Text variant="caption">{athleteFullName(card)}</Text>
            <View className="flex-row flex-wrap items-center gap-xs">
              <Badge tone={card.publicationType === 'OFFICIAL' ? 'verified' : 'muted-text'}>
                {card.publicationType === 'OFFICIAL' ? 'Official Release' : 'Community Edition'}
              </Badge>
              <Text variant="caption">
                {card.createdByUserId ? `Created by @${card.createdByUserId}` : 'Community release'}
                {card.publishedByUserId && card.publishedByUserId !== card.createdByUserId
                  ? ` · Published by @${card.publishedByUserId}`
                  : ''}
              </Text>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-sm">
            {card.personProfileId ? (
              <Link href={{ pathname: '/people/[personId]', params: { personId: card.personProfileId } }} asChild>
                <Button variant="secondary" size="sm">View person profile</Button>
              </Link>
            ) : null}
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

          <View className="flex-row flex-wrap gap-sm">
            <Button variant="secondary" size="sm" onPress={handleShare}>Share</Button>
            <ConnectedCardSaveButton cardTemplateId={card.id} compact />
          </View>

          <View className="gap-xs rounded-md border border-border bg-surface p-md">
            <Text variant="caption">Edition</Text>
            <Text className="font-semibold">{editionLabel(card)}</Text>
          </View>

          {card.game?.seasonName ? (
            <Text variant="caption">{card.game.seasonName} season</Text>
          ) : null}

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

        {relatedCards.length > 0 ? (
          <View className="gap-sm pt-xl">
            <Text className="px-lg text-lg font-semibold">More from {athleteFullName(card)}</Text>
            <CardRail cards={relatedCards} />
          </View>
        ) : null}
      </Screen>

      <CardAuthenticitySheet
        visible={authenticityVisible}
        onClose={() => setAuthenticityVisible(false)}
        originHash={card.originHash}
      />
    </>
  )
}
