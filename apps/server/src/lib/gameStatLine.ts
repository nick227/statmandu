import { db } from '@statman/db'

// Shared by GameService.getBoxScore (many players, one game — needs each
// row's playerName) and StatsService.listPlayerGames (one player, many
// games — needs each row's opponent + date). Batches the game/player
// lookups instead of querying per row, regardless of which direction the
// caller came from.
export async function withGameStatLineContext<T extends { gameId: string; playerId: string; teamId: string }>(
  lines: T[]
): Promise<Array<T & { playerName: string; gameOpponentName: string; gameScheduledAt: string }>> {
  if (lines.length === 0) return []

  const gameIds = [...new Set(lines.map((l) => l.gameId))]
  const playerIds = [...new Set(lines.map((l) => l.playerId))]

  const [games, players] = await Promise.all([
    db.game.findMany({ where: { id: { in: gameIds } }, include: { gameTeams: { include: { team: true } } } }),
    db.player.findMany({ where: { id: { in: playerIds } }, include: { athleteProfile: true } }),
  ])

  const gameById = new Map(games.map((g) => [g.id, g]))
  const playerById = new Map(players.map((p) => [p.id, p]))

  return lines.map((line) => {
    const game = gameById.get(line.gameId)
    const player = playerById.get(line.playerId)
    const opponentTeam = game?.gameTeams.find((gt) => gt.teamId !== line.teamId)?.team
    return {
      ...line,
      playerName: player ? `${player.athleteProfile.firstName} ${player.athleteProfile.lastName}` : '',
      gameOpponentName: opponentTeam?.name ?? '',
      gameScheduledAt: (game?.scheduledAt ?? new Date()).toISOString(),
    }
  })
}
