import { useMemo, useState } from 'react'
import { Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useImages, usePeople, useUploadImage, useCreatePerson } from '@statman/sdk'
import type { components } from '@statman/sdk'
import type { CardBuilderState } from './cardBuilderTypes'

type Player = components['schemas']['PersonProfile']
type ImageAsset = components['schemas']['ImageAsset']

export interface CardBuilderPlayerOption {
  id: string
  athleteProfileId: string | null
  name: string
  teamName: string
  selected: boolean
}

function supportedContentType(value?: string): 'image/jpeg' | 'image/png' | 'image/webp' {
  if (value === 'image/png' || value === 'image/webp') return value
  return 'image/jpeg'
}

function athleteName(person?: Player | null) { return person?.displayName ?? null }
function teamName(_person?: Player | null) { return 'Person' }

export function useCardBuilderData(
  state: CardBuilderState,
  updateState: (updates: Partial<CardBuilderState>) => void,
) {
  const [athleteQuery, setAthleteQuery] = useState('')
  const createPerson = useCreatePerson()
  async function addPerson() {
    const result = await createPerson.mutateAsync({ displayName: athleteQuery.trim() })
    selectPlayer({ athleteProfileId: result.data.id, name: result.data.displayName, teamName: 'Person' })
  }
  const playersQuery = usePeople(athleteQuery)
  const players = useMemo(() => playersQuery.data?.data ?? [], [playersQuery.data])
  const selectedPlayer = useMemo(
    () => players.find((p) => p.id === state.athleteProfileId) ?? null,
    [players, state.athleteProfileId]
  )

  const playerOptions = useMemo<CardBuilderPlayerOption[]>(
    () =>
      players.map((player) => ({
        id: player.id,
        athleteProfileId: player.id,
        name: athleteName(player) ?? 'Person',
        teamName: teamName(player) ?? 'Person profile',
        selected: Boolean(state.athleteProfileId && player.id === state.athleteProfileId),
      })),
    [players, state.athleteProfileId]
  )

  const athleteProfileId = state.athleteProfileId ?? ''
  const galleryQuery = useImages('ATHLETE_PROFILE', athleteProfileId, 'GALLERY')
  const gallery = galleryQuery.data?.data ?? []
  const selectedGalleryImage = useMemo(() => gallery.find((g) => g.id === state.sourceImageAssetId) ?? null, [gallery, state.sourceImageAssetId])
  const uploadImage = useUploadImage()

  function selectPlayer(option: Pick<CardBuilderPlayerOption, 'athleteProfileId' | 'name' | 'teamName'>) {
    updateState({
      athleteProfileId: option.athleteProfileId,
      athleteName: option.name,
      athleteTeamName: option.teamName,
    })
  }

  async function pickAndUploadPhoto() {
    if (!state.athleteProfileId) {
      Alert.alert('Select person', 'Choose a person before adding a gallery photo.')
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

    const contentType = supportedContentType(asset.mimeType)
    const uploaded = await uploadImage.mutateAsync({
      targetType: 'ATHLETE_PROFILE',
      targetId: state.athleteProfileId,
      usage: 'GALLERY',
      contentType,
      file: {
        uri: asset.uri,
        name: asset.fileName ?? `card-gallery.${contentType.split('/')[1]}`,
        type: contentType,
      },
      originalFilename: asset.fileName ?? undefined,
      width: asset.width,
      height: asset.height,
    })

    const image = uploaded.data as ImageAsset
    updateState({ sourceImageAssetId: image.id, sourceImageUrl: image.url })
  }

  return {
    createPerson, addPerson,
    athleteQuery,
    setAthleteQuery,
    playerOptions,
    hasSelectedPlayer: Boolean(state.athleteProfileId),
    selectedPlayer,
    selectPlayer,
    gallery,
    galleryQuery,
    selectedGalleryImage,
    pickAndUploadPhoto,
    isUploading: uploadImage.isPending,
  }
}
