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

export async function recordGameScore(request: any, reply: any) {
  const game = await gameService.recordScore(request.params.gameId, request.user.id, request.body)
  return reply.send({ data: game })
}

import { buildShareMetadata } from '../lib/shareMetadata'

export async function getGameSpectator(request: any, reply: any) {
  const { gameId } = request.params
  const game = await gameService.get(gameId)
  if (!game) return reply.status(404).send({ error: 'Not found' })

  const shareMetadata = buildShareMetadata('game', gameId, game)

  return reply.send({
    data: {
      game,
      topPerformers: [],
      timelineEvents: [],
      mediaSummary: [],
      shareMetadata
    }
  })
}
