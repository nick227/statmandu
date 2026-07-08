import { ImageService } from '../services/ImageService'
import { contentTypeForObjectKey, readStoredImage } from '../lib/imageStorage'

const imageService = new ImageService()

export async function listImages(request: any, reply: any) {
  const images = await imageService.list(request.query.targetType, request.query.targetId, request.query.usage)
  return reply.send({ data: images })
}

export async function uploadImage(request: any, reply: any) {
  const fieldValue = (name: string) => request.body[name]?.value ?? request.body[name]
  const optionalNumber = (name: string) => {
    const value = fieldValue(name)
    if (value == null || value === '') return undefined
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  const fileField = Array.isArray(request.body.file) ? request.body.file[0] : request.body.file
  if (!fileField?.toBuffer) throw { statusCode: 400, message: 'Image file is required' }
  const fileBuffer = await fileField.toBuffer()

  const data = {
    targetType: fieldValue('targetType'),
    targetId: fieldValue('targetId'),
    usage: fieldValue('usage'),
    contentType: fieldValue('contentType'),
    fileBuffer,
    originalFilename: fieldValue('originalFilename') ?? fileField.filename,
    width: optionalNumber('width'),
    height: optionalNumber('height'),
  }

  const image = await imageService.upload(request.user.id, request.user.role === 'ADMIN', data)
  return reply.status(201).send({ data: image })
}

export async function serveUploadedImage(request: any, reply: any) {
  const objectKey = request.params['*']
  reply.type(contentTypeForObjectKey(objectKey))
  return reply.send(await readStoredImage(objectKey))
}
