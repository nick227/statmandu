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

import { buildShareMetadata } from '../lib/shareMetadata'

export async function getPlayerAggregate(request: any, reply: any) {
  const { playerId } = request.params
  // For MVP aggregate we fetch player, recent games, and generate share metadata
  const player = await playerService.get(playerId)
  if (!player) return reply.status(404).send({ error: 'Not found' })

  const recentGames: unknown[] = [] // Placeholder for recent games query if needed
  const recentMedia: unknown[] = []
  const relatedCards: unknown[] = []

  const shareMetadata = buildShareMetadata('player', playerId, player)

  return reply.send({
    data: {
      player,
      recentGames,
      recentMedia,
      relatedCards,
      recentActivity: [],
      shareMetadata
    }
  })
}
