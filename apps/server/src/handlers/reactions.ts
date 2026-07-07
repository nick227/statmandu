import { SocialService } from '../services/SocialService'

const socialService = new SocialService()

export async function getReactionCounts(request: any, reply: any) {
  const counts = await socialService.getReactionCounts(request.query.targetType, request.query.targetId)
  return reply.send({ data: counts })
}

export async function createReaction(request: any, reply: any) {
  const reaction = await socialService.createReaction(request.user.id, request.body)
  return reply.status(201).send({ data: reaction })
}

export async function deleteReaction(request: any, reply: any) {
  await socialService.deleteReaction(request.user.id, request.params.reactionId)
  return reply.send({ data: null })
}
