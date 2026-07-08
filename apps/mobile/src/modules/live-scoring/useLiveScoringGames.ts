import { useGames } from '@statman/sdk'

export function useLiveScoringGames() {
  const scheduledGamesQuery = useGames({ status: 'SCHEDULED' })
  const liveGamesQuery = useGames({ status: 'LIVE' })

  return {
    games: [...(liveGamesQuery.data?.data ?? []), ...(scheduledGamesQuery.data?.data ?? [])],
    isLoading: scheduledGamesQuery.isLoading,
    isError: scheduledGamesQuery.isError || liveGamesQuery.isError,
  }
}
