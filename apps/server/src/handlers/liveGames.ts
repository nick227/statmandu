import { GameService } from '../services/GameService'

const gameService = new GameService()

export async function joinGameAsReporter(request: any, reply: any) {
  const reporter = await gameService.joinAsReporter(request.params.gameId, request.user.id, request.body)
  return reply.status(201).send({ data: reporter })
}

export async function inviteGameReporter(request: any, reply: any) {
  const reporter = await gameService.inviteReporter(request.params.gameId, request.user.id, request.body)
  return reply.status(201).send({ data: reporter })
}

export async function updateGameReporter(request: any, reply: any) {
  const reporter = await gameService.updateReporter(request.params.gameId, request.user.id, request.params.reporterId, request.body)
  return reply.send({ data: reporter })
}

export async function removeGameReporter(request: any, reply: any) {
  await gameService.removeReporter(request.params.gameId, request.user.id, request.params.reporterId)
  return reply.send({ data: null })
}

export async function startLiveGame(request: any, reply: any) {
  const game = await gameService.startLive(request.params.gameId, request.user.id)
  return reply.send({ data: game })
}

export async function listGameEvents(request: any, reply: any) {
  const events = await gameService.listEvents(request.params.gameId)
  return reply.send({ data: events })
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

export async function createGameReaction(request: any, reply: any) {
  const reaction = await gameService.createReaction(request.params.gameId, request.body)
  return reply.status(201).send({ data: reaction })
}

export async function finalizeGame(request: any, reply: any) {
  const game = await gameService.finalize(request.params.gameId, request.user.id)
  return reply.send({ data: game })
}

export async function listGameConflicts(request: any, reply: any) {
  const conflicts = await gameService.listConflicts(request.params.gameId, request.user.id)
  return reply.send({ data: conflicts })
}

export async function resolveGameConflict(request: any, reply: any) {
  const conflict = await gameService.resolveConflict(request.params.gameId, request.user.id, request.params.conflictId, request.body)
  return reply.send({ data: conflict })
}

export async function markGameConflictDisputed(request: any, reply: any) {
  const conflict = await gameService.markConflictDisputed(request.params.gameId, request.user.id, request.params.conflictId)
  return reply.send({ data: conflict })
}
