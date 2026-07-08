import { MediaService } from '../services/MediaService'

const mediaService = new MediaService()

function mapMedia(media: any) {
  const { uploadedByUser, ...rest } = media
  return { ...rest, uploadedBy: uploadedByUser || undefined }
}

export async function listMedia(request: any, reply: any) {
  const media = await mediaService.list(request.query.targetType, request.query.targetId)
  return reply.send({ data: media.map(mapMedia) })
}

export async function listRecentMedia(request: any, reply: any) {
  const limit = Number(request.query.limit ?? 20)
  const media = await mediaService.listRecent(Number.isFinite(limit) ? limit : 20)
  return reply.send({ data: media.map(mapMedia) })
}

export async function attachYouTubeMedia(request: any, reply: any) {
  const media = await mediaService.attachYouTube(request.user.id, request.body)
  return reply.status(201).send({ data: media })
}
