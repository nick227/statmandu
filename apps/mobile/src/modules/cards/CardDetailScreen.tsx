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
  creatorDisplayHandle,
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
                  {card.createdByUserId ? `Created by ${creatorDisplayHandle(card.createdByUserId)}` : 'Community release'}
                  {card.publishedByUserId && card.publishedByUserId !== card.createdByUserId
                    ? ` · Published by ${creatorDisplayHandle(card.publishedByUserId)}`
                    : ''}
                </Text>
              </View>
            </View>

            {/* Edition Metadata Strip */}
            <View className="flex-row items-center justify-between rounded-xl border border-border/80 bg-surface px-4 py-3 shadow-xs">
              <View className="gap-0.5">
                <Text variant="caption" className="font-semibold text-muted-text uppercase tracking-wider text-[10px]">
                  Edition Mode
                </Text>
                <Text className="text-base font-bold text-text">{editionLabel(card)}</Text>
              </View>
              {card.game?.seasonName ? (
                <Text variant="caption" className="text-xs font-medium text-muted-text">
                  {card.game.seasonName} season
                </Text>
              ) : null}
            </View>

            {/* Primary Collecting Action (Dominant call to action) */}
            <View className="gap-sm pt-xs">
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

            {/* Compact Cryptographic Origin Hash & Authenticity Verification */}
            {card.originHash ? (
              <Pressable
                onPress={() => setAuthenticityVisible(true)}
                className="flex-row items-center justify-between rounded-xl border border-border/60 bg-canvas px-3.5 py-2.5 active:opacity-70 hover:border-brand/40 transition-all mt-1"
              >
                <View className="flex-1 pr-sm gap-0.5">
                  <Text variant="caption" className="font-semibold text-muted-text uppercase tracking-wider text-[10px]">
                    Cryptographic Origin
                  </Text>
                  <Text className="font-mono text-xs text-muted-text" numberOfLines={1}>
                    {card.originHash.slice(0, 16)}...{card.originHash.slice(-8)}
                  </Text>
                </View>
                <Text variant="caption" className="font-semibold text-brand text-xs">
                  Verify authenticity →
                </Text>
              </Pressable>
            ) : null}

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
