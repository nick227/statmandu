import { useCallback, useState } from 'react'
import { Image, Pressable, ScrollView, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Screen } from '@/shared/layout/Screen'
import { Text } from '@/shared/ui/Text'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { LoadingState } from '@/shared/ui/LoadingState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { cn } from '@/lib/utils'
import { CardBuilderStepShell } from './CardBuilderStepShell'
import { useCardBuilderState } from './useCardBuilderState'
import { CardTypePicker } from './CardTypePicker'
import { CardStylePicker } from './CardStylePicker'
import { CardPreviewStage } from './CardPreviewStage'
import { CardReleasePicker } from './CardReleasePicker'
import { useCardStudioSdk } from './useCardStudioSdk'
import { useCardBuilderData } from './useCardBuilderData'
import { useCardStudioBootstrap } from './useCardStudioBootstrap'
import type { CardBuilderState } from './cardBuilderTypes'
import type { components } from '@statman/sdk'

type Card = components['schemas']['Card']
type BuilderStep = 'subject' | 'photo' | 'type' | 'style' | 'preview' | 'release' | 'publish'

const STEPS: BuilderStep[] = ['subject', 'photo', 'type', 'style', 'preview', 'release', 'publish']

export function CardBuilderScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ cardId?: string }>()
  const cardId = typeof params.cardId === 'string' ? params.cardId : undefined
  const { state, setState, updateState } = useCardBuilderState()
  const studio = useCardStudioSdk()
  const { setSavedCard } = studio
  const builderData = useCardBuilderData(state, updateState)
  const [stepIndex, setStepIndex] = useState(0)

  const onLoadExisting = useCallback(
    (card: Card, nextState: CardBuilderState) => {
      setSavedCard(card)
      setState(nextState)
      // Jump past subject/photo when the draft already has both.
      setStepIndex(nextState.sourceImageAssetId ? 2 : nextState.athleteProfileId ? 1 : 0)
    },
    [setSavedCard, setState],
  )

  const bootstrap = useCardStudioBootstrap(cardId, onLoadExisting)

  const step = STEPS[stepIndex]
  const isBusy = studio.isBusy || builderData.isUploading

  function next() {
    setStepIndex((v) => Math.min(v + 1, STEPS.length - 1))
  }

  function back() {
    setStepIndex((v) => Math.max(v - 1, 0))
  }

  if (bootstrap.isLoading) {
    return (
      <Screen title="Card Studio" withBack>
        <LoadingState label="Loading card" />
      </Screen>
    )
  }

  if (bootstrap.isError) {
    return (
      <Screen title="Card Studio" withBack>
        <ErrorState message="This card couldn't be loaded for editing." />
      </Screen>
    )
  }

  if (bootstrap.isLocked) {
    return (
      <Screen title="Card Studio" withBack scroll contentClassName="gap-md p-lg">
        <ErrorState message="Published cards can't be reopened in the studio." />
        <Button variant="secondary" onPress={() => router.replace('/cards')}>
          Back to Trading Cards
        </Button>
      </Screen>
    )
  }

  if (step === 'subject') {
    return (
      <Screen title="Card Studio" withBack>
        <CardBuilderStepShell
          title="Choose Subject"
          description="Who is this card for?"
          onNext={() => {
            if (builderData.selectDefaultPlayer()) next()
          }}
          onBack={undefined}
          isNextDisabled={!builderData.hasSelectablePlayer}
        >
          <View className="gap-md">
            <Input value={builderData.athleteQuery} onChangeText={builderData.setAthleteQuery} placeholder="Search athletes" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {builderData.playerOptions.map((player) => (
                <Pressable
                  key={player.id}
                  onPress={() => builderData.selectPlayer(player)}
                  className={cn('min-w-44 rounded-md border p-sm', player.selected ? 'border-brand bg-brand/10' : 'border-border bg-canvas')}
                >
                  <Text className={cn('font-semibold', player.selected ? 'text-brand' : 'text-text')}>{player.name}</Text>
                  <Text variant="caption" numberOfLines={1}>{player.teamName}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </CardBuilderStepShell>
      </Screen>
    )
  }

  if (step === 'photo') {
    return (
      <Screen title="Card Studio" withBack>
        <CardBuilderStepShell
          title="Select Photo"
          description="Choose the main image for the card."
          onNext={next}
          onBack={back}
          isNextDisabled={!state.sourceImageUrl}
        >
          <View className="gap-md">
            <Button variant="secondary" isLoading={builderData.isUploading} onPress={builderData.pickAndUploadPhoto}>
              Upload to gallery
            </Button>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {builderData.gallery.map((image) => {
                const selected = image.id === state.sourceImageAssetId
                return (
                  <Pressable
                    key={image.id}
                    onPress={() => updateState({ sourceImageAssetId: image.id, sourceImageUrl: image.url })}
                    className={cn('h-24 w-24 overflow-hidden rounded-md border', selected ? 'border-brand' : 'border-border')}
                  >
                    <Image source={{ uri: image.url }} className="h-full w-full" resizeMode="cover" />
                  </Pressable>
                )
              })}
            </ScrollView>
            {builderData.galleryQuery.isLoading ? <Text variant="caption">Loading gallery...</Text> : null}
            {builderData.galleryQuery.isError ? <Text variant="caption">Gallery couldn't be loaded.</Text> : null}
          </View>
        </CardBuilderStepShell>
      </Screen>
    )
  }

  if (step === 'type') {
    return (
      <Screen title="Card Studio" withBack>
        <CardBuilderStepShell
          title="Card Type"
          description="What kind of card are you creating?"
          onNext={next}
          onBack={back}
          isNextDisabled={!state.cardType}
        >
          <CardTypePicker selected={state.cardType} onSelect={(cardType) => updateState({ cardType })} />
        </CardBuilderStepShell>
      </Screen>
    )
  }

  if (step === 'style') {
    return (
      <Screen title="Card Studio" withBack>
        <CardBuilderStepShell
          title="Card Style"
          description="Choose a visual preset."
          onNext={next}
          onBack={back}
          isNextDisabled={!state.stylePreset}
        >
          <CardStylePicker selected={state.stylePreset} onSelect={(stylePreset) => updateState({ stylePreset })} />
        </CardBuilderStepShell>
      </Screen>
    )
  }

  if (step === 'preview') {
    return (
      <Screen title="Card Studio" withBack>
        <CardBuilderStepShell
          title="Preview"
          description="Flip the card and make sure everything looks right."
          onNext={next}
          onBack={back}
          nextLabel="Looks Good, Continue"
        >
          <View className="gap-md">
            <View className="flex-row justify-center gap-sm">
              <Button size="sm" variant={state.side === 'front' ? 'secondary' : 'ghost'} onPress={() => updateState({ side: 'front' })}>
                Front
              </Button>
              <Button size="sm" variant={state.side === 'back' ? 'secondary' : 'ghost'} onPress={() => updateState({ side: 'back' })}>
                Back
              </Button>
            </View>
            <View className="gap-sm">
              <Input value={state.title} onChangeText={(title) => updateState({ title })} placeholder="Card title" />
              <View className="flex-row gap-sm">
                <Input className="flex-1" value={state.statOne} onChangeText={(statOne) => updateState({ statOne })} placeholder="24 PTS" />
                <Input className="flex-1" value={state.statTwo} onChangeText={(statTwo) => updateState({ statTwo })} placeholder="8 REB" />
                <Input className="flex-1" value={state.statThree} onChangeText={(statThree) => updateState({ statThree })} placeholder="5 AST" />
              </View>
            </View>
            <CardPreviewStage state={state} isLoading={false} />
          </View>
        </CardBuilderStepShell>
      </Screen>
    )
  }

  if (step === 'release') {
    return (
      <Screen title="Card Studio" withBack>
        <CardBuilderStepShell
          title="Release Settings"
          description="How should this card be released?"
          onNext={next}
          onBack={back}
          isNextDisabled={!state.release}
          nextLabel="Review & Publish"
        >
          <CardReleasePicker
            selected={state.release}
            editionSize={state.editionSize}
            onSelect={(release, editionSize) => updateState({ release, editionSize: editionSize ?? state.editionSize })}
          />
        </CardBuilderStepShell>
      </Screen>
    )
  }

  const isDraft = state.release === 'draft'

  return (
    <Screen title="Card Studio" withBack>
      <CardBuilderStepShell
        title={isDraft ? 'Save Draft' : 'Ready to Publish'}
        description={
          isDraft
            ? 'Saves your studio work privately — generate & publish later from Trading Cards.'
            : 'Create/update the draft, generate artwork, then publish for fans to claim.'
        }
        onNext={async () => {
          const result = await studio.publish(state)
          if (!result?.id) return
          if (isDraft) {
            router.replace('/cards')
            return
          }
          router.replace({ pathname: '/cards/[cardId]', params: { cardId: result.id } })
        }}
        onBack={back}
        nextLabel={isDraft ? 'Save Draft' : 'Generate & Publish'}
        isLoading={isBusy}
      >
        <View className="gap-md">
          <CardPreviewStage state={state} isLoading={isBusy} />
          <View className="gap-sm rounded-lg border border-border bg-surface p-md">
            <Text className="text-center font-bold text-text">Summary</Text>
            <Text className="text-center text-muted-text">Athlete: {state.athleteName ?? '—'}</Text>
            <Text className="text-center text-muted-text">Type: {state.cardType}</Text>
            <Text className="text-center text-muted-text">Style: {state.stylePreset}</Text>
            <Text className="text-center text-muted-text">Release: {state.release}</Text>
            {state.sourceImageUrl ? <Text className="text-center text-muted-text">Photo: selected</Text> : null}
          </View>
        </View>
      </CardBuilderStepShell>
    </Screen>
  )
}
