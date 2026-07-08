import { useMemo, useState } from 'react'
import { Platform } from 'react-native'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { useAttachYouTubeMedia, useCreatePlayer } from '@statman/sdk'

const STEPS = ['Identity', 'Sport Fit', 'Team', 'Proof', 'Media', 'Preview'] as const

export type AthleteOnboardingStep = typeof STEPS[number]

export const PLAYER_POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'] as const

function safeHaptic() {
  if (Platform.OS === 'web') return
  Haptics.selectionAsync()
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' ') || 'Athlete',
  }
}

function optionalBoundedNumber(value: string, min: number, max: number) {
  if (!value.trim()) return undefined
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return undefined
  return Math.min(max, Math.max(min, Math.round(parsed)))
}

export function useAthleteOnboarding() {
  const router = useRouter()
  const createPlayer = useCreatePlayer()
  const attachMedia = useAttachYouTubeMedia()
  const [stepIndex, setStepIndex] = useState(0)
  const [name, setName] = useState('')
  const [hometown, setHometown] = useState('')
  const [bio, setBio] = useState('')
  const [position, setPosition] = useState<string | null>(null)
  const [classYear, setClassYear] = useState('')
  const [heightInches, setHeightInches] = useState(72)
  const [jerseyNumber, setJerseyNumber] = useState('')
  const [teamName, setTeamName] = useState('')
  const [proofNote, setProofNote] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [createdPlayerId, setCreatedPlayerId] = useState<string | null>(null)
  const [createdPlayerName, setCreatedPlayerName] = useState<string | null>(null)
  const [mediaAttached, setMediaAttached] = useState(false)

  const step = STEPS[stepIndex]
  const canGoBack = stepIndex > 0
  const isLastStep = stepIndex === STEPS.length - 1
  const completion = useMemo(() => {
    const checks = [name, hometown, bio, position, classYear, heightInches, jerseyNumber, teamName, proofNote, mediaUrl]
    return Math.round((checks.filter(Boolean).length / checks.length) * 100)
  }, [bio, classYear, heightInches, hometown, jerseyNumber, mediaUrl, name, position, proofNote, teamName])

  function goBack() {
    if (!canGoBack) return
    safeHaptic()
    setStepIndex((value) => value - 1)
  }

  function goNext() {
    if (isLastStep) return
    safeHaptic()
    setStepIndex((value) => value + 1)
  }

  function selectPosition(value: string) {
    safeHaptic()
    setPosition(value)
  }

  function adjustHeight(delta: number) {
    safeHaptic()
    setHeightInches((value) => Math.min(96, Math.max(48, value + delta)))
  }

  async function publish() {
    const { firstName, lastName } = splitName(name)
    let playerId = createdPlayerId
    let playerName = createdPlayerName

    if (!playerId) {
      const result = await createPlayer.mutateAsync({
        firstName,
        lastName,
        sportSlug: 'basketball',
        bio: bio || undefined,
        hometown: hometown || undefined,
        position: position ?? undefined,
        classYear: classYear || undefined,
        jerseyNumber: optionalBoundedNumber(jerseyNumber, 0, 99),
        heightInches,
      })
      playerId = result.data.id
      playerName = `${firstName} ${lastName}`
      setCreatedPlayerId(playerId)
      setCreatedPlayerName(playerName)
    }

    if (mediaUrl.trim() && !mediaAttached) {
      await attachMedia.mutateAsync({
        targetType: 'PLAYER',
        targetId: playerId,
        youtubeUrl: mediaUrl.trim(),
        title: `${playerName ?? `${firstName} ${lastName}`} highlight`,
      })
      setMediaAttached(true)
    }
    router.replace({ pathname: '/players/[playerId]', params: { playerId } })
  }

  return {
    bio,
    canGoBack,
    classYear,
    completion,
    isPublishing: createPlayer.isPending || attachMedia.isPending,
    publishError: createPlayer.error ?? attachMedia.error,
    createPlayer,
    attachMedia,
    goBack,
    goNext,
    heightInches,
    hometown,
    isLastStep,
    jerseyNumber,
    mediaUrl,
    name,
    position,
    proofNote,
    publish,
    selectPosition,
    setBio,
    setClassYear,
    setHometown,
    setJerseyNumber,
    setMediaUrl,
    setName,
    setProofNote,
    setTeamName,
    step,
    stepIndex,
    steps: STEPS,
    teamName,
    adjustHeight,
  }
}
