import { useState } from 'react'
import { Pressable, Share, View, useWindowDimensions } from 'react-native'
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
  const { width } = useWindowDimensions()
  const isDesktop = width >= 1024
  const cardWidth = isDesktop ? 440 : Math.min(340, width - 32)

  const { card, isLoading, isError, markDownloaded, relatedCards } = useCardDetail(cardId)
  const [authenticityVisible, setAuthenticityVisible] = useState(false)
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
    await Share.share({ message: result.data.authenticity.text, url: card!.frontImage?.url ?? undefined })
  }

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
        <View className="pb-md">
          <BackButton tone="dark" />
        </View>

        {/* Responsive Layout: Adjacent on Desktop, Stacked on Mobile */}
        <View className={isDesktop ? 'flex-row items-start gap-2xl' : 'flex-col gap-xl'}>
          {/* Card Presentation Stage */}
          <View
            style={{ width: isDesktop ? 500 : '100%' }}
            className="items-center justify-center rounded-3xl bg-neutral-100 dark:bg-neutral-900/60 p-lg md:p-xl shadow-sm"
          >
            <View className="shadow-2xl">
              {card.templateSnapshot?.composition ? (
                <CardCompositionRenderer
                  composition={card.templateSnapshot.composition}
                  person={card.person ?? card.templateSnapshot.person}
                  assets={card.templateSnapshot.assets}
                  issue={card.currentUserIssue}
                  width={cardWidth}
                />
              ) : (
                <Card1AStage data={cardFaceDataFromCard(card)} />
              )}
            </View>
          </View>

          {/* Adjacent Detail Information & Actions */}
          <View className="flex-1 gap-md">
            {/* Status & Type Badges */}
            <View className="flex-row items-center justify-between">
              <Badge tone="muted-text">{CARD_TYPE_LABEL[card.cardType]}</Badge>
              <Badge tone={CARD_STATUS_TONE[card.status]}>{CARD_STATUS_LABEL[card.status]}</Badge>
            </View>

            {/* Title & Attribution */}
            <View className="gap-xs">
              <Text className="text-3xl font-extrabold tracking-tight text-text md:text-4xl">
                {card.title}
              </Text>
              <Text variant="caption" className="text-base font-semibold text-text">
                {athleteFullName(card)}
              </Text>
              <View className="flex-row flex-wrap items-center gap-xs pt-xs">
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

            {/* Edition Details Card */}
            <View className="gap-xs rounded-2xl border border-border bg-surface p-md shadow-sm">
              <Text variant="caption" className="font-semibold text-muted-text uppercase tracking-wider text-[11px]">
                Edition
              </Text>
              <Text className="text-lg font-bold text-text">{editionLabel(card)}</Text>
            </View>

            {card.game?.seasonName ? (
              <Text variant="caption">{card.game.seasonName} season</Text>
            ) : null}

            {/* Cryptographic Origin Hash & Authenticity Verification */}
            {card.originHash ? (
              <Pressable
                onPress={() => setAuthenticityVisible(true)}
                className="flex-row items-center justify-between rounded-2xl border border-border bg-surface p-md active:opacity-70 hover:border-brand/40 shadow-sm transition-all"
              >
                <View className="flex-1 pr-sm gap-0.5">
                  <Text variant="caption" className="font-semibold text-muted-text uppercase tracking-wider text-[11px]">
                    Origin hash
                  </Text>
                  <Text className="font-mono text-xs text-text" numberOfLines={1}>
                    {card.originHash}
                  </Text>
                </View>
                <Text variant="caption" className="font-semibold text-brand">
                  Verify authenticity
                </Text>
              </Pressable>
            ) : null}

            {/* Primary & Secondary Actions */}
            <View className="gap-sm pt-sm">
              <ConnectedCardClaimButton card={card} />

              <View className="flex-row flex-wrap gap-sm">
                <Button variant="secondary" size="sm" onPress={handleShare}>
                  Share
                </Button>
                <ConnectedCardSaveButton cardTemplateId={card.id} compact />
                {card.currentUserHasClaimed && issueId ? (
                  <Button variant="secondary" size="sm" isLoading={markDownloaded.isPending} onPress={handleDownload}>
                    {alreadyDownloaded ? 'Share again' : 'Download'}
                  </Button>
                ) : null}
              </View>
            </View>

            {/* Context Navigation Pills */}
            <View className="flex-row flex-wrap gap-sm pt-xs border-t border-border mt-xs">
              {card.personProfileId ? (
                <Link href={{ pathname: '/people/[personId]', params: { personId: card.personProfileId } }} asChild>
                  <Button variant="ghost" size="sm">
                    View profile
                  </Button>
                </Link>
              ) : null}
              {card.team ? (
                <Link href={{ pathname: '/teams/[teamId]', params: { teamId: card.team.id } }} asChild>
                  <Button variant="ghost" size="sm">
                    {`View ${card.team.name}`}
                  </Button>
                </Link>
              ) : null}
              {card.game ? (
                <Link href={{ pathname: '/games/[gameId]', params: { gameId: card.game.id } }} asChild>
                  <Button variant="ghost" size="sm">
                    View game
                  </Button>
                </Link>
              ) : null}
            </View>
          </View>
        </View>

        {/* Related Collectibles Rail */}
        {relatedCards.length > 0 ? (
          <View className="gap-sm pt-2xl mt-xl border-t border-border">
            <Text className="text-xl font-bold text-text">More from {athleteFullName(card)}</Text>
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
