import { ImageService } from '../services/ImageService'
import { contentTypeForObjectKey, readStoredImage } from '../lib/imageStorage'

const imageService = new ImageService()

export async function listImages(request: any, reply: any) {
  const images = await imageService.list(request.query.targetType, request.query.targetId, request.query.usage)
  return reply.send({ data: images })
}

export async function uploadImage(request: any, reply: any) {
  const image = await imageService.upload(request.user.id, request.user.role === 'ADMIN', request.body)
  return reply.status(201).send({ data: image })
}

export async function serveUploadedImage(request: any, reply: any) {
  const objectKey = request.params['*']
  reply.type(contentTypeForObjectKey(objectKey))
  return reply.send(await readStoredImage(objectKey))
}
