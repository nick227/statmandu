import { useCallback, useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Screen } from '@/shared/layout/Screen'
import { Text } from '@/shared/ui/Text'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { LoadingState } from '@/shared/ui/LoadingState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { cn } from '@/lib/utils'
import { CardBuilderStepShell } from './CardBuilderStepShell'
import { SubjectPicker } from './SubjectPicker'
import { PhotoPicker } from './PhotoPicker'
import { useCardBuilderState } from './useCardBuilderState'
import { CardTypePicker } from './CardTypePicker'
import { CardStylePicker } from './CardStylePicker'
import { CardPreviewStage } from './CardPreviewStage'
import { CardReleasePicker } from './CardReleasePicker'
import { useCardStudioSdk } from './useCardStudioSdk'
import { useCardBuilderData } from './useCardBuilderData'
import { useCardStudioBootstrap } from './useCardStudioBootstrap'
import { CARD_FRAMES } from './builderConstants'
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
  const progressLabel = `Step ${stepIndex + 1} of ${STEPS.length}`

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
          description="Choose a person to celebrate, or add someone new."
          onNext={() => {
            if (builderData.hasSelectedPlayer) next()
          }}
          onBack={undefined}
          isNextDisabled={!builderData.hasSelectedPlayer}
          progressLabel={progressLabel}
        >
          <SubjectPicker builderData={builderData} />
        </CardBuilderStepShell>
      </Screen>
    )
  }

  if (step === 'photo') {
    return (
      <Screen title="Card Studio" withBack>
        <CardBuilderStepShell
          title="Select Photo"
          description="Upload to the athlete gallery or reuse an existing gallery image."
          onNext={next}
          onBack={back}
          isNextDisabled={!state.sourceImageUrl}
          progressLabel={progressLabel}
        >
          <PhotoPicker builderData={builderData} state={state} updateState={updateState} />
        </CardBuilderStepShell>
      </Screen>
    )
  }

  if (step === 'type') {
    return (
      <Screen title="Card Studio" withBack>
        <CardBuilderStepShell
          title="Card Type"
          description="Choose the story this card should tell."
          onNext={next}
          onBack={back}
          isNextDisabled={!state.cardType}
          progressLabel={progressLabel}
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
          description="Choose a frame family and palette. You can still flip the preview before release."
          onNext={next}
          onBack={back}
          isNextDisabled={!state.stylePreset}
          progressLabel={progressLabel}
        >
          <View className="gap-md">
            <View className="gap-sm">
              <Text className="font-semibold text-text">Frame</Text>
              <View className="flex-row flex-wrap gap-sm">
                {CARD_FRAMES.map((frame) => {
                  const selected = state.framePreset === frame.value
                  return (
                    <Pressable
                      key={frame.value}
                      onPress={() => updateState({ framePreset: frame.value })}
                      className={cn('w-44 rounded-md border p-sm', selected ? 'border-brand bg-brand/10' : 'border-border bg-canvas')}
                    >
                      <Text className={cn('font-semibold', selected ? 'text-brand' : 'text-text')}>{frame.label}</Text>
                      <Text variant="caption" numberOfLines={2}>{frame.description}</Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>
            <View className="gap-sm">
              <Text className="font-semibold text-text">Palette</Text>
              <CardStylePicker selected={state.stylePreset} onSelect={(stylePreset) => updateState({ stylePreset })} />
            </View>
          </View>
        </CardBuilderStepShell>
      </Screen>
    )
  }

  if (step === 'preview') {
    return (
      <Screen title="Card Studio" withBack>
        <CardBuilderStepShell
          title="Preview"
          description="Edit the front stats and card-back copy, then flip both sides."
          onNext={next}
          onBack={back}
          nextLabel="Looks Good, Continue"
          progressLabel={progressLabel}
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
              <Input value={state.setName} onChangeText={(setName) => updateState({ setName })} placeholder="Set name" />
              <Input value={state.cardNumber} onChangeText={(cardNumber) => updateState({ cardNumber })} placeholder="Card number" />
              <Input value={state.promptHelper} onChangeText={(promptHelper) => updateState({ promptHelper })} placeholder="Creative direction" />
              <Input value={state.backCopy} onChangeText={(backCopy) => updateState({ backCopy })} placeholder="Back-side bio or description" />
            </View>
            <CardPreviewStage state={state} isLoading={false} onSideChange={(side) => updateState({ side })} />
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
          progressLabel={progressLabel}
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
          router.replace({ pathname: '/cards/[cardId]', params: { cardId: result.id, source: 'CARD_STUDIO' } })
        }}
        onBack={back}
        nextLabel={isDraft ? 'Save Draft' : 'Generate & Publish'}
        isLoading={isBusy}
        progressLabel={progressLabel}
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
