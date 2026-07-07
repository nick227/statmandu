import { useState } from 'react'
import { useOpenDispute } from '@statman/sdk'

export const DISPUTE_TARGET_TYPES = ['ATHLETE_PROFILE', 'GAME_STAT_LINE'] as const

export function useDisputeForm() {
  const [targetType, setTargetType] = useState<typeof DISPUTE_TARGET_TYPES[number]>('ATHLETE_PROFILE')
  const [targetId, setTargetId] = useState('')
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const openDispute = useOpenDispute()

  async function submitDispute() {
    await openDispute.mutateAsync({ targetType, targetId, description })
    setSubmitted(true)
  }

  return {
    description,
    openDispute,
    setDescription,
    setTargetId,
    setTargetType,
    submitted,
    submitDispute,
    targetId,
    targetType,
    targetTypes: DISPUTE_TARGET_TYPES,
  }
}
