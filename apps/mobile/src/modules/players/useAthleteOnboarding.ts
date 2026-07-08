import { useMemo, useState } from 'react'
import { Platform } from 'react-native'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { useCreatePlayer } from '@statman/sdk'

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

export function useAthleteOnboarding() {
  const router = useRouter()
  const createPlayer = useCreatePlayer()
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
    const result = await createPlayer.mutateAsync({
      firstName,
      lastName,
      sportSlug: 'basketball',
      bio: bio || undefined,
      hometown: hometown || undefined,
      position: position ?? undefined,
      classYear: classYear || undefined,
      jerseyNumber: jerseyNumber ? Number(jerseyNumber) : undefined,
      heightInches,
    })
    router.replace({ pathname: '/players/[playerId]', params: { playerId: result.data.id } })
  }

  return {
    bio,
    canGoBack,
    classYear,
    completion,
    createPlayer,
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
