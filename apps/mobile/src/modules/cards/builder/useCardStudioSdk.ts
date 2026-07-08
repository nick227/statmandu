import { useState } from 'react'
import { Alert } from 'react-native'
import { ApiError, useCreateCard, useGenerateCard, usePublishCard, useUpdateCard } from '@statman/sdk'
import type { components } from '@statman/sdk'
import type { CardBuilderState, ReleaseType } from './cardBuilderTypes'

type Card = components['schemas']['Card']
type CardEditionMode = components['schemas']['CardEditionMode']

function apiErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return 'Something went wrong.'
}

function mapRelease(release: ReleaseType, editionSize: string) {
  if (release === 'limited') return { visibility: 'PUBLIC' as const, editionMode: 'LIMITED' as const, editionSize: Number(editionSize) || 100 }
  if (release === 'one-of-one') return { visibility: 'PUBLIC' as const, editionMode: 'ONE_OF_ONE' as const, editionSize: 1 }
  return { visibility: 'PUBLIC' as const, editionMode: 'UNLIMITED' as const, editionSize: null }
}

export function useCardStudioSdk() {
  const createCard = useCreateCard()
  const generateCard = useGenerateCard()
  const publishCard = usePublishCard()

  const [savedCard, setSavedCard] = useState<Card | null>(null)
  const updateCard = useUpdateCard(savedCard?.id ?? '')

  async function saveDraft(state: CardBuilderState) {
    if (!state.athleteProfileId) {
      Alert.alert('Select athlete', 'Choose an athlete before saving.')
      return null
    }

    const statsSnapshotJson = {
      cardStudio: {
        framePreset: state.framePreset,
        setName: state.setName,
        cardNumber: state.cardNumber,
        backCopy: state.backCopy,
        promptHelper: state.promptHelper,
        photoAssetId: state.sourceImageAssetId,
        stats: [state.statOne, state.statTwo, state.statThree].filter(Boolean),
      },
    }

    const body = {
      athleteProfileId: state.athleteProfileId,
      title: state.title.trim() || 'Untitled Card',
      cardType: state.cardType,
      stylePreset: state.stylePreset,
      editionMode: state.release === 'one-of-one' ? ('ONE_OF_ONE' as const) : state.release === 'limited' ? ('LIMITED' as const) : ('UNLIMITED' as const),
      editionSize: state.release === 'limited' ? Number(state.editionSize) || 100 : state.release === 'one-of-one' ? 1 : null,
      sourceImageAssetId: state.sourceImageAssetId,
      statsSnapshotJson,
    } satisfies {
      athleteProfileId: string
      title: string
      cardType: CardBuilderState['cardType']
      stylePreset: string
      editionMode: CardEditionMode
      editionSize: number | null
      sourceImageAssetId: string | null
      statsSnapshotJson: unknown
    }

    try {
      const response = savedCard ? await updateCard.mutateAsync(body) : await createCard.mutateAsync(body)
      setSavedCard(response.data)
      return response.data
    } catch (error) {
      Alert.alert('Save failed', apiErrorMessage(error))
      return null
    }
  }

  async function generate(cardId: string) {
    try {
      const response = await generateCard.mutateAsync(cardId)
      setSavedCard(response.data)
      return response.data
    } catch (error) {
      Alert.alert('Generation failed', apiErrorMessage(error))
      return null
    }
  }

  async function publish(state: CardBuilderState) {
    const card = savedCard ?? (await saveDraft(state))
    if (!card) return null

    // Private draft stops after save — no generate/publish pipeline.
    if (state.release === 'draft') {
      return card
    }

    const generated = card.frontImage?.url ? card : await generate(card.id)
    if (!generated) return null

    try {
      const response = await publishCard.mutateAsync({ cardId: generated.id, body: mapRelease(state.release, state.editionSize) })
      setSavedCard(response.data)
      return response.data
    } catch (error) {
      Alert.alert('Publish failed', apiErrorMessage(error))
      return null
    }
  }

  const isBusy = createCard.isPending || updateCard.isPending || generateCard.isPending || publishCard.isPending

  return {
    savedCard,
    setSavedCard,
    saveDraft,
    publish,
    isBusy,
  }
}

