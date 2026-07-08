import { useMemo } from 'react'
import { useImages, usePlayers, useUploadImage } from '@statman/sdk'
import type { components } from '@statman/sdk'

type Player = components['schemas']['Player']

export function useCardBuilderData({ athleteQuery, athleteProfileId }: { athleteQuery: string; athleteProfileId: string | null }) {
  const playersQuery = usePlayers({ q: athleteQuery || undefined, limit: 20 })
  const players = useMemo(() => playersQuery.data?.pages.flatMap((p) => p.data) ?? [], [playersQuery.data])

  const galleryQuery = useImages('ATHLETE_PROFILE', athleteProfileId ?? '', 'GALLERY')
  const gallery = galleryQuery.data?.data ?? []

  const uploadImage = useUploadImage()

  function findDefaultPlayer(currentAthleteProfileId: string | null) {
    if (!players.length) return null
    if (!currentAthleteProfileId) return players[0] ?? null
    return (players.find((p) => p.athleteProfileId === currentAthleteProfileId) ?? players[0]) as Player
  }

  return {
    playersQuery,
    players,
    galleryQuery,
    gallery,
    uploadImage,
    findDefaultPlayer,
  }
}

