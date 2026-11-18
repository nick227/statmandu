import { ActivityIndicator, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Screen } from '@/shared/layout/Screen'
import { Text } from '@/shared/ui/Text'
import { Button } from '@/shared/ui/Button'
import { Card1AStage } from './Card1A'
import { CARD_GEOMETRY } from './cardGeometry'
import { cardFaceDataFromCard, CARD_STATUS_LABEL } from './cardDisplay'
import { useCardReview } from './useCardReview'

// The curation step of "athlete keeps all generations, curates what's
// public" — every card in the batch already exists as a private draft the
// moment CardBatchGenerateScreen kicked generation off (see
// CardService.generateBatch), so nothing here can lose work: this screen's
// only job is picking which of them go public. Anything left unselected
// simply stays a private draft, browsable later from Trading Cards.
export function CardReviewScreen() {
  const router = useRouter()
  const { cardIds, cards, selectedIds, toggle, publishSelected, isPublishing, retry, isRetrying } = useCardReview()

  const stillGenerating = cards.some((card) => card.status === 'GENERATING' || card.status === 'DRAFT')
  const readyCards = cards.filter((card) => card.status === 'READY')

  async function handlePublish() {
    await publishSelected()
    router.replace('/cards')
  }

  if (cardIds.length === 0) {
    return (
      <Screen title="Review Card Set" withBack>
        <View className="flex-1 items-center justify-center p-lg">
          <Text variant="caption">No cards to review.</Text>
        </View>
      </Screen>
    )
  }

  return (
    <Screen title="Review Card Set" withBack scroll contentClassName="gap-md px-xs py-lg">
      <View className="gap-xs">
        <Text variant="entityName">Pick your favorites</Text>
        <Text variant="caption">
          Every pose you generated is saved privately. Select the ones you want fans to see, then publish — the rest
          stay in your drafts for later.
        </Text>
      </View>

      {stillGenerating ? (
        <View className="flex-row items-center gap-sm rounded-md border border-border bg-surface p-md">
          <ActivityIndicator size="small" />
          <Text variant="caption">Generating your card set — this can take a little while, keep this screen open.</Text>
        </View>
      ) : null}

      <View className="items-center gap-lg">
        {cards.map((card) => {
          const selected = selectedIds.has(card.id)
          const isReady = card.status === 'READY'
          const isFailed = card.status === 'FAILED'

          return (
            <View
              key={card.id}
              className="w-full gap-xs"
            >
              {isReady ? (
                <Card1AStage data={cardFaceDataFromCard(card)} />
              ) : (
                <View style={{ width: CARD_GEOMETRY.displayPixels.width, maxWidth: '100%', alignSelf: 'center' }}>
                  <View
                    className="items-center justify-center gap-sm rounded-lg border border-border bg-surface p-md"
                    style={{ width: '100%', aspectRatio: CARD_GEOMETRY.aspectRatio }}
                  >
                    {isFailed ? (
                      <Text variant="caption" className="text-center">Generation failed</Text>
                    ) : (
                      <>
                        <ActivityIndicator size="small" />
                        <Text variant="caption">{CARD_STATUS_LABEL[card.status]}</Text>
                      </>
                    )}
                  </View>
                </View>
              )}
              <Text variant="caption" numberOfLines={1} className="text-center">{card.title}</Text>
              {isReady ? (
                <Button size="sm" variant={selected ? 'secondary' : 'ghost'} onPress={() => toggle(card.id)}>
                  {selected ? 'Selected' : 'Select card'}
                </Button>
              ) : null}
              {isFailed ? (
                <Button size="sm" variant="ghost" isLoading={isRetrying} onPress={() => retry(card.id)}>
                  Retry
                </Button>
              ) : null}
            </View>
          )
        })}
      </View>

      <Button
        size="lg"
        isLoading={isPublishing}
        disabled={selectedIds.size === 0 || readyCards.length === 0}
        onPress={handlePublish}
      >
        {selectedIds.size > 0 ? `Publish ${selectedIds.size} Card${selectedIds.size === 1 ? '' : 's'}` : 'Select cards to publish'}
      </Button>
      <Button variant="ghost" onPress={() => router.replace('/cards')}>
        Skip for now — keep everything private
      </Button>
    </Screen>
  )
}
