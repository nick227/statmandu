import { GameService } from '../services/GameService'
import { StatsService } from '../services/StatsService'

const gameService = new GameService()
const statsService = new StatsService()

export async function getGameStats(request: any, reply: any) {
  const lines = await gameService.getBoxScore(request.params.gameId)
  return reply.send({ data: lines })
}

export async function listPlayerGames(request: any, reply: any) {
  const games = await statsService.listPlayerGames(request.params.playerId)
  return reply.send({ data: games })
}

export async function getPlayerSeasonStats(request: any, reply: any) {
  const stats = await statsService.getPlayerSeasonStats(request.params.playerId)
  return reply.send({ data: stats })
}
