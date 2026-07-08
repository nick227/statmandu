import { useMemo, useState } from 'react'
import { Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useImages, usePlayers, useUploadImage } from '@statman/sdk'
import type { components } from '@statman/sdk'
import type { CardBuilderState } from './cardBuilderTypes'

type Player = components['schemas']['Player']
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

function athleteName(player?: Player | null) {
  const profile = player?.athleteProfile
  return profile ? `${profile.firstName} ${profile.lastName}` : null
}

function teamName(player?: Player | null) {
  return player?.currentTeam?.name ?? player?.sport?.name ?? null
}

export function useCardBuilderData(
  state: CardBuilderState,
  updateState: (updates: Partial<CardBuilderState>) => void,
) {
  const [athleteQuery, setAthleteQuery] = useState('')
  const playersQuery = usePlayers({ q: athleteQuery || undefined, limit: 20 })
  const players = useMemo(() => playersQuery.data?.pages.flatMap((p) => p.data) ?? [], [playersQuery.data])
  const selectedPlayer = useMemo(
    () => players.find((p) => p.athleteProfileId === state.athleteProfileId) ?? players[0] ?? null,
    [players, state.athleteProfileId]
  )

  const playerOptions = useMemo<CardBuilderPlayerOption[]>(
    () =>
      players.map((player) => ({
        id: player.id,
        athleteProfileId: player.athleteProfileId,
        name: athleteName(player) ?? 'Athlete',
        teamName: teamName(player) ?? 'Athlete profile',
        selected: player.athleteProfileId === state.athleteProfileId || (!state.athleteProfileId && player.id === selectedPlayer?.id),
      })),
    [players, selectedPlayer?.id, state.athleteProfileId]
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

  function selectDefaultPlayer() {
    if (!selectedPlayer?.athleteProfileId) return false
    updateState({
      athleteProfileId: selectedPlayer.athleteProfileId,
      athleteName: athleteName(selectedPlayer),
      athleteTeamName: teamName(selectedPlayer),
    })
    return true
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
    athleteQuery,
    setAthleteQuery,
    playerOptions,
    hasSelectablePlayer: Boolean(selectedPlayer?.athleteProfileId),
    selectPlayer,
    selectDefaultPlayer,
    gallery,
    galleryQuery,
    selectedGalleryImage,
    pickAndUploadPhoto,
    isUploading: uploadImage.isPending,
  }
}
