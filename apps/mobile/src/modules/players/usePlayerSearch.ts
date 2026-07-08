import { useState } from 'react'
import { usePlayers } from '@statman/sdk'

export function usePlayerSearch() {
  const [q, setQ] = useState('')
  const playersQuery = usePlayers(q ? { q } : undefined)

  return {
    q,
    setQ,
    players: playersQuery.data?.pages.flatMap((p) => p.data) ?? [],
    isLoading: playersQuery.isLoading,
    isError: playersQuery.isError,
  }
}
