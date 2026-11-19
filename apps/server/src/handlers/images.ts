import { personTargetType } from '../lib/personTarget'
import { db } from '@statman/db'
import { ImageService } from '../services/ImageService'
import { contentTypeForObjectKey, readStoredImage } from '../lib/imageStorage'
import { optionalUser } from '../lib/optionalUser'

const imageService = new ImageService()

export async function listImages(request: any, reply: any) {
  const user = await optionalUser(request)
  const images = await imageService.list(request.query.targetType, request.query.targetId, request.query.usage, user?.id, user?.role === 'ADMIN')
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
    targetType: personTargetType(fieldValue('targetType')) as any,
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
  await requireImageServeAccess(objectKey, request)
  reply.header('Cache-Control', 'private, no-store')
  reply.header('Vary', 'Cookie, Authorization')
  reply.type(contentTypeForObjectKey(objectKey))
  return reply.send(await readStoredImage(objectKey))
}

// Storage proxies enforce source privacy and generated-card visibility for all providers.
async function requireImageServeAccess(objectKey: string, request: any) {
  const asset = await db.imageAsset.findFirst({ where: { objectKey, deletedAt: null } })
  if (!asset) throw { statusCode: 404, message: 'Not found' }
  const user = await optionalUser(request)
  if (asset.targetType === 'CARD_TEMPLATE') {
    const card = await db.cardRelease.findUnique({ where: { id: asset.targetId } })
    if (!card) throw { statusCode: 404, message: 'Not found' }
    if (card.visibility === 'PUBLIC' && card.status === 'PUBLISHED') return
    if (user && (user.role === 'ADMIN' || user.id === card.createdByUserId)) return
    throw { statusCode: 404, message: 'Not found' }
  }
  if (asset.visibility === 'PUBLIC' || (user && (user.role === 'ADMIN' || user.id === asset.uploadedByUserId))) return
  throw { statusCode: 404, message: 'Not found' }
}
