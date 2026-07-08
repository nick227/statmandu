import { useMemo } from 'react'
import { useCreateGameReaction } from '@statman/sdk'

export function useSpectatorGameReaction(gameId: string) {
  const createReaction = useCreateGameReaction(gameId)
  const deviceId = useMemo(() => Math.random().toString(36).slice(2), [])

  async function sendReaction(type: 'LIKE' | 'FIRE' | 'CLAP') {
    await createReaction.mutateAsync({ type, deviceId })
  }

  return {
    isSending: createReaction.isPending,
    sendReaction,
  }
}
