import { useGames } from '@statman/sdk'

export function useAdminGames() {
  const games = useGames({})
  return { games }
}

