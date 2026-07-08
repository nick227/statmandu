import { useMemo, useState } from 'react'
import { Alert, Image, Pressable, ScrollView, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import type { components } from '@statman/sdk'
import { useRouter } from 'expo-router'
import { Screen } from '@/shared/layout/Screen'
import { Text } from '@/shared/ui/Text'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { cn } from '@/lib/utils'
import { CardBuilderStepShell } from './CardBuilderStepShell'
import { useCardBuilderState } from './useCardBuilderState'
import { CardTypePicker } from './CardTypePicker'
import { CardStylePicker } from './CardStylePicker'
import { CardPreviewStage } from './CardPreviewStage'
import { CardReleasePicker } from './CardReleasePicker'
import { useCardStudioSdk } from './useCardStudioSdk'
import { useCardBuilderData } from './useCardBuilderData'

type Player = components['schemas']['Player']
type ImageAsset = components['schemas']['ImageAsset']

type BuilderStep = 'subject' | 'photo' | 'type' | 'style' | 'preview' | 'release' | 'publish'

const STEPS: BuilderStep[] = ['subject', 'photo', 'type', 'style', 'preview', 'release', 'publish']

function supportedContentType(value?: string): 'image/jpeg' | 'image/png' | 'image/webp' {
  if (value === 'image/png' || value === 'image/webp') return value
  return 'image/jpeg'
}

function athleteName(player?: Player | null) {
  const profile = player?.athleteProfile
  return profile ? `${profile.firstName} ${profile.lastName}` : null
}

function teamName(player?: Player | null) {
  return player?.currentTeam?.name ?? player?.sport?.name ?? null
}

export function CardBuilderScreen() {
  const router = useRouter()
  const { state, updateState } = useCardBuilderState()
  const studio = useCardStudioSdk()
  const [stepIndex, setStepIndex] = useState(0)

  const step = STEPS[stepIndex]

  const [athleteQuery, setAthleteQuery] = useState('')
  const data = useCardBuilderData({ athleteQuery, athleteProfileId: state.athleteProfileId })
  const players = data.players
  const selectedPlayer = useMemo(() => data.findDefaultPlayer(state.athleteProfileId), [data, state.athleteProfileId])
  const gallery = data.gallery
  const galleryQuery = data.galleryQuery
  const uploadImage = data.uploadImage

  function next() {
    setStepIndex((v) => Math.min(v + 1, STEPS.length - 1))
  }

  function back() {
    setStepIndex((v) => Math.max(v - 1, 0))
  }

  async function pickAndUploadPhoto() {
    if (!state.athleteProfileId) {
      Alert.alert('Select athlete', 'Choose an athlete before adding a gallery photo.')
      return
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Alert.alert('Photo access needed', 'Photo library access is needed to choose an image.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9, allowsEditing: false })
    if (result.canceled) return
    const asset = result.assets[0]
    if (!asset?.uri) return

    const uploaded = await uploadImage.mutateAsync({
      targetType: 'ATHLETE_PROFILE',
      targetId: state.athleteProfileId,
      usage: 'GALLERY',
      contentType: supportedContentType(asset.mimeType),
      file: {
        uri: asset.uri,
        name: asset.fileName ?? `card-gallery.${supportedContentType(asset.mimeType).split('/')[1]}`,
        type: supportedContentType(asset.mimeType),
      },
      originalFilename: asset.fileName ?? undefined,
      width: asset.width,
      height: asset.height,
    })

    const image = uploaded.data as ImageAsset
    updateState({ sourceImageAssetId: image.id, sourceImageUrl: image.url })
  }

  const selectedGalleryImage = useMemo(() => gallery.find((g) => g.id === state.sourceImageAssetId) ?? null, [gallery, state.sourceImageAssetId])

  const isBusy = studio.isBusy || uploadImage.isPending

  if (step === 'subject') {
    return (
      <Screen title="Card Studio">
        <CardBuilderStepShell
          title="Choose Subject"
          description="Who is this card for?"
          onNext={() => {
            const player = selectedPlayer
            if (!player?.athleteProfileId) return
            updateState({
              athleteProfileId: player.athleteProfileId,
              athleteName: athleteName(player),
              athleteTeamName: teamName(player),
            })
            next()
          }}
          onBack={undefined}
          isNextDisabled={!selectedPlayer?.athleteProfileId}
        >
          <View className="gap-md">
            <Input value={athleteQuery} onChangeText={setAthleteQuery} placeholder="Search athletes" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {players.map((player) => {
                const selected = player.athleteProfileId === state.athleteProfileId || (!state.athleteProfileId && player.id === selectedPlayer?.id)
                return (
                  <Pressable
                    key={player.id}
                    onPress={() =>
                      updateState({
                        athleteProfileId: player.athleteProfileId,
                        athleteName: athleteName(player),
                        athleteTeamName: teamName(player),
                      })
                    }
                    className={cn('min-w-44 rounded-md border p-sm', selected ? 'border-brand bg-brand/10' : 'border-border bg-canvas')}
                  >
                    <Text className={cn('font-semibold', selected ? 'text-brand' : 'text-text')}>{athleteName(player) ?? 'Athlete'}</Text>
                    <Text variant="caption" numberOfLines={1}>{teamName(player) ?? 'Athlete profile'}</Text>
                  </Pressable>
                )
              })}
            </ScrollView>
          </View>
        </CardBuilderStepShell>
      </Screen>
    )
  }

  if (step === 'photo') {
    return (
      <Screen title="Card Studio">
        <CardBuilderStepShell
          title="Select Photo"
          description="Choose the main image for the card."
          onNext={next}
          onBack={back}
          isNextDisabled={!state.sourceImageUrl}
        >
          <View className="gap-md">
            <Button variant="secondary" isLoading={uploadImage.isPending} onPress={pickAndUploadPhoto}>
              Upload to gallery
            </Button>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {gallery.map((image) => {
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
            {galleryQuery.isLoading ? <Text variant="caption">Loading gallery…</Text> : null}
            {galleryQuery.isError ? <Text variant="caption">Gallery couldn’t be loaded.</Text> : null}
          </View>
        </CardBuilderStepShell>
      </Screen>
    )
  }

  if (step === 'type') {
    return (
      <Screen title="Card Studio">
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
      <Screen title="Card Studio">
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
      <Screen title="Card Studio">
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
      <Screen title="Card Studio">
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

  return (
    <Screen title="Card Studio">
      <CardBuilderStepShell
        title="Ready to Publish"
        description="Your draft will be created/updated, generated, then published."
        onNext={async () => {
          const result = await studio.publish(state)
          if (result?.id) router.replace({ pathname: '/cards/[cardId]', params: { cardId: result.id } })
        }}
        onBack={back}
        nextLabel={state.release === 'draft' ? 'Save Draft' : 'Publish Card'}
        isLoading={isBusy}
      >
        <View className="gap-md">
          <CardPreviewStage state={state} isLoading={isBusy} />
          <View className="gap-sm p-md bg-surface border border-white/5 rounded-lg">
            <Text className="text-center font-bold text-text">Summary</Text>
            <Text className="text-center text-muted-text">Athlete: {state.athleteName ?? '—'}</Text>
            <Text className="text-center text-muted-text">Type: {state.cardType}</Text>
            <Text className="text-center text-muted-text">Style: {state.stylePreset}</Text>
            <Text className="text-center text-muted-text">Release: {state.release}</Text>
            {selectedGalleryImage?.url ? <Text className="text-center text-muted-text">Photo: selected</Text> : null}
          </View>
        </View>
      </CardBuilderStepShell>
    </Screen>
  )
}

