import { GameService } from '../services/GameService'

const gameService = new GameService()

export async function joinGameAsReporter(request: any, reply: any) {
  const reporter = await gameService.joinAsReporter(request.params.gameId, request.user.id, request.body)
  return reply.status(201).send({ data: reporter })
}

export async function startLiveGame(request: any, reply: any) {
  const game = await gameService.startLive(request.params.gameId, request.user.id)
  return reply.send({ data: game })
}

export async function submitGameEvent(request: any, reply: any) {
  const event = await gameService.submitEvent(request.params.gameId, request.user.id, request.body)
  return reply.status(201).send({ data: event })
}

export async function undoGameEvent(request: any, reply: any) {
  const event = await gameService.undoEvent(request.params.gameId, request.user.id, request.params.eventId)
  return reply.send({ data: event })
}

export async function getGameSnapshot(request: any, reply: any) {
  const snapshot = await gameService.getSnapshot(request.params.gameId)
  return reply.send({ data: snapshot })
}

export async function finalizeGame(request: any, reply: any) {
  const game = await gameService.finalize(request.params.gameId, request.user.id)
  return reply.send({ data: game })
}
