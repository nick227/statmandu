import { MediaService } from '../services/MediaService'

const mediaService = new MediaService()

export async function listMedia(request: any, reply: any) {
  const media = await mediaService.list(request.query.targetType, request.query.targetId)
  return reply.send({ data: media })
}

export async function attachYouTubeMedia(request: any, reply: any) {
  const media = await mediaService.attachYouTube(request.user.id, request.body)
  return reply.status(201).send({ data: media })
}
