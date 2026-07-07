import { SocialService } from '../services/SocialService'

const socialService = new SocialService()

export async function listFollows(request: any, reply: any) {
  const follows = await socialService.listFollows(request.query.targetType, request.query.targetId)
  return reply.send({ data: follows })
}

export async function createFollow(request: any, reply: any) {
  const follow = await socialService.createFollow(request.user.id, request.body)
  return reply.status(201).send({ data: follow })
}

export async function deleteFollow(request: any, reply: any) {
  await socialService.deleteFollow(request.user.id, request.params.followId)
  return reply.send({ data: null })
}
