import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { useRouter } from 'expo-router'
import { getCardPoses, getSportDefinition } from '@statman/sports'
import { Screen } from '@/shared/layout/Screen'
import { Text } from '@/shared/ui/Text'
import { ErrorState } from '@/shared/ui/ErrorState'
import { cn } from '@/lib/utils'
import { CardBuilderStepShell } from './CardBuilderStepShell'
import { SubjectPicker } from './SubjectPicker'
import { PhotoPicker } from './PhotoPicker'
import { useCardBuilderState } from './useCardBuilderState'
import { useCardBuilderData } from './useCardBuilderData'
import { useCardBatchGenerate } from './useCardBatchGenerate'

type Step = 'subject' | 'photo' | 'poses'
const STEPS: Step[] = ['subject', 'photo', 'poses']

// "Athlete uploads a face photo, we generate the standard set of poses for
// their sport" — a separate, simpler wizard from CardBuilderScreen's
// single-card flow (no title/type/style/release steps: every generated
// card gets sport-appropriate defaults server-side, see
// CardService.generateBatch). Every generation is kept as a private draft
// ("waste not want not") — this screen's only job is kicking the batch off
// and handing control to the review/curate screen once it's created.
export function CardBatchGenerateScreen() {
  const router = useRouter()
  const { state, updateState } = useCardBuilderState()
  const builderData = useCardBuilderData(state, updateState)
  const [stepIndex, setStepIndex] = useState(0)
  const [selectedPoseIds, setSelectedPoseIds] = useState<string[] | null>(null)
  const generateBatch = useCardBatchGenerate()
  // Stable for the lifetime of this screen instance — a double-tap or a
  // retry of the same in-flight "Generate" attempt reuses it, so the
  // server's idempotency check (CardService.generateBatch) returns the
  // existing batch instead of creating a second one. A genuinely new visit
  // to this screen (new instance) naturally gets a new key.
  const [batchRequestId] = useState(() => `${Date.now()}-${Math.random().toString(36).slice(2)}`)

  const step = STEPS[stepIndex]
  const progressLabel = `Step ${stepIndex + 1} of ${STEPS.length}`
  const sportSlug = builderData.selectedPlayer?.sport?.slug ?? 'basketball'
  const poses = getCardPoses(getSportDefinition(sportSlug))
  const activePoseIds = selectedPoseIds ?? poses.map((pose) => pose.id)

  function next() {
    setStepIndex((v) => Math.min(v + 1, STEPS.length - 1))
  }
  function back() {
    setStepIndex((v) => Math.max(v - 1, 0))
  }
  function togglePose(poseId: string) {
    setSelectedPoseIds(activePoseIds.includes(poseId) ? activePoseIds.filter((id) => id !== poseId) : [...activePoseIds, poseId])
  }

  async function generate() {
    if (!state.athleteProfileId || !state.sourceImageAssetId) return
    try {
      const cards = await generateBatch.generate({
        athleteProfileId: state.athleteProfileId,
        sourceImageAssetId: state.sourceImageAssetId,
        poseIds: activePoseIds,
        batchRequestId,
      })
      router.replace({ pathname: '/cards/review', params: { cardIds: cards.map((card) => card.id).join(',') } } as never)
    } catch {
      // Surfaced inline below via generateBatch.errorMessage (rate limit,
      // concurrency cap, etc.) — nothing further to do here.
    }
  }

  if (step === 'subject') {
    return (
      <Screen title="Generate Card Set" withBack>
        <CardBuilderStepShell
          title="Choose Subject"
          description="Pick the athlete this card set is for."
          onNext={() => {
            if (builderData.hasSelectedPlayer) next()
          }}
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
      <Screen title="Generate Card Set" withBack>
        <CardBuilderStepShell
          title="Upload a Face Photo"
          description="One clear reference photo — we'll generate every pose from it, preserving likeness."
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

  return (
    <Screen title="Generate Card Set" withBack>
      <CardBuilderStepShell
        title="Choose Poses"
        description={`Standard ${getSportDefinition(sportSlug).name} trading-card poses. Every generation is kept privately — publish only the ones you like from Trading Cards afterward.`}
        onNext={generate}
        onBack={back}
        nextLabel={`Generate ${activePoseIds.length} Card${activePoseIds.length === 1 ? '' : 's'}`}
        isNextDisabled={activePoseIds.length === 0}
        isLoading={generateBatch.isPending}
        progressLabel={progressLabel}
      >
        <View className="gap-sm">
          {poses.map((pose) => {
            const selected = activePoseIds.includes(pose.id)
            return (
              <Pressable
                key={pose.id}
                onPress={() => togglePose(pose.id)}
                className={cn('flex-row items-center justify-between rounded-md border p-md', selected ? 'border-brand bg-brand/10' : 'border-border bg-canvas')}
              >
                <View className="flex-1 gap-xs pr-sm">
                  <Text className={cn('font-semibold', selected ? 'text-brand' : 'text-text')}>{pose.label}</Text>
                  <Text variant="caption" numberOfLines={1}>{pose.category === 'portrait' ? 'Portrait' : 'Action shot'}</Text>
                </View>
                <View className={cn('h-6 w-6 items-center justify-center rounded-full border-2', selected ? 'border-brand bg-brand' : 'border-border')}>
                  {selected ? <Text className="text-xs font-bold text-white">✓</Text> : null}
                </View>
              </Pressable>
            )
          })}
          {generateBatch.errorMessage ? <ErrorState message={generateBatch.errorMessage} /> : null}
        </View>
      </CardBuilderStepShell>
    </Screen>
  )
}
