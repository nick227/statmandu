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

export async function getTeamSeasonStats(request: any, reply: any) {
  const stats = await statsService.getTeamSeasonStats(request.params.teamSlug)
  return reply.send({ data: stats })
}

export async function getPlayerLeaderboard(request: any, reply: any) {
  const leaderboard = await statsService.getPlayerLeaderboard(request.query)
  return reply.send({ data: leaderboard })
}

export async function getTeamLeaderboard(request: any, reply: any) {
  const leaderboard = await statsService.getTeamLeaderboard(request.query)
  return reply.send({ data: leaderboard })
}
