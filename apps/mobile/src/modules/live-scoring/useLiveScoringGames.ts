import { useGames } from '@statman/sdk'

export function useLiveScoringGames() {
  const scheduledGamesQuery = useGames({ status: 'SCHEDULED' })
  const liveGamesQuery = useGames({ status: 'LIVE' })
  const finalGamesQuery = useGames({ status: 'FINAL' })

  return {
    games: [
      ...(liveGamesQuery.data?.data ?? []),
      ...(scheduledGamesQuery.data?.data ?? []),
      ...(finalGamesQuery.data?.data ?? []),
    ],
    isLoading: scheduledGamesQuery.isLoading || liveGamesQuery.isLoading || finalGamesQuery.isLoading,
    isError: scheduledGamesQuery.isError || liveGamesQuery.isError || finalGamesQuery.isError,
  }
}
