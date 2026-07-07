import { useState } from 'react'
import { useClaimPlayer } from '@statman/sdk'

export function usePlayerClaim(playerId: string) {
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const claim = useClaimPlayer(playerId)

  async function submitClaim() {
    await claim.mutateAsync({ verificationNote: note || undefined })
    setSubmitted(true)
  }

  return {
    claim,
    note,
    setNote,
    submitted,
    submitClaim,
  }
}
