import { PlayerService } from '../services/PlayerService'

const playerService = new PlayerService()

export async function listPlayers(request: any, reply: any) {
  const result = await playerService.list(request.query ?? {})
  return reply.send(result)
}

export async function createPlayer(request: any, reply: any) {
  const player = await playerService.create(request.user.id, request.body)
  return reply.status(201).send({ data: player })
}

export async function getPlayer(request: any, reply: any) {
  const player = await playerService.get(request.params.playerId)
  return reply.send({ data: player })
}

export async function updatePlayer(request: any, reply: any) {
  const isAdmin = request.user.role === 'ADMIN'
  const player = await playerService.update(request.user.id, isAdmin, request.params.playerId, request.body)
  return reply.send({ data: player })
}
