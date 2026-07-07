import { GameService } from '../services/GameService'

const gameService = new GameService()

export async function listGames(request: any, reply: any) {
  const games = await gameService.list(request.query ?? {})
  return reply.send({ data: games })
}

export async function createGame(request: any, reply: any) {
  const game = await gameService.create(request.body)
  return reply.status(201).send({ data: game })
}

export async function getGame(request: any, reply: any) {
  const game = await gameService.get(request.params.gameId)
  return reply.send({ data: game })
}
