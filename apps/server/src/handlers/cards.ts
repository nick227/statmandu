import { CardService } from '../services/CardService'
import { db } from '@statman/db'

const cardService = new CardService()

function actor(request: any) {
  return { id: request.user.id, role: request.user.role }
}

async function optionalUser(request: any) {
  if (request.user) return request.user
  const token =
    request.cookies?.token ??
    request.headers.authorization?.replace('Bearer ', '')
  if (!token) return null

  const directUser = await db.user.findUnique({ where: { id: token }, include: { profile: true } }).catch(() => null)
  if (directUser) return directUser

  const session = await db.session.findUnique({
    where: { token },
    include: { user: { include: { profile: true } } },
  }).catch(() => null)
  if (!session || session.expiresAt < new Date() || session.user.suspendedAt) return null
  return session.user
}

export async function createCard(request: any, reply: any) {
  const card = await cardService.createDraftCard(request.user.id, request.body)
  return reply.status(201).send({ data: card })
}

export async function listRecentPublicCards(request: any, reply: any) {
  const user = await optionalUser(request)
  const cards = await cardService.listRecentPublicCards(user?.id)
  return reply.send({ data: cards })
}

export async function getCard(request: any, reply: any) {
  const user = await optionalUser(request)
  const card = await cardService.getCard(request.params.cardId, user?.id, user?.role === 'ADMIN')
  return reply.send({ data: card })
}

export async function updateCard(request: any, reply: any) {
  const card = await cardService.updateDraftCard(actor(request), request.params.cardId, request.body)
  return reply.send({ data: card })
}

export async function generateCard(request: any, reply: any) {
  const card = await cardService.generateCard(actor(request), request.params.cardId)
  return reply.send({ data: card })
}

export async function publishCard(request: any, reply: any) {
  const card = await cardService.publishCard(actor(request), request.params.cardId, request.body ?? {})
  return reply.send({ data: card })
}

export async function claimCard(request: any, reply: any) {
  const issue = await cardService.claimCard(request.params.cardId, request.user.id)
  return reply.status(201).send({ data: issue })
}

export async function listCardsForAthlete(request: any, reply: any) {
  const user = await optionalUser(request)
  const cards = await cardService.listCardsForAthlete(request.params.athleteProfileId, user?.id, user?.role === 'ADMIN')
  return reply.send({ data: cards })
}

export async function listMyCards(request: any, reply: any) {
  const cards = await cardService.listCardsForUser(request.user.id)
  return reply.send({ data: cards })
}

export async function markCardDownloaded(request: any, reply: any) {
  const issue = await cardService.markCardDownloaded(request.params.issueId, request.user.id, request.user.role === 'ADMIN')
  return reply.send({ data: issue })
}
