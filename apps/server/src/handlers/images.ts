import { db } from '@statman/db'
import { ImageService } from '../services/ImageService'
import { contentTypeForObjectKey, readStoredImage } from '../lib/imageStorage'
import { optionalUser } from '../lib/optionalUser'

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
  await requireImageServeAccess(objectKey, request)
  reply.type(contentTypeForObjectKey(objectKey))
  return reply.send(await readStoredImage(objectKey))
}

// Every other ImageAsset targetType (avatars, logos, gallery photos,
// article thumbnails, dispute evidence) is intentionally public today —
// this only restricts the one case that's actually supposed to be
// private: a non-public card's own generated art. Local/Railway-volume
// storage only — an R2-backed deployment serves images straight from R2's
// own public bucket URL, bypassing this route entirely; securing that
// needs a provider-specific fix (signed URLs) not attempted here since R2
// isn't configured/active.
async function requireImageServeAccess(objectKey: string, request: any) {
  const asset = await db.imageAsset.findFirst({ where: { objectKey }, select: { targetType: true, targetId: true } })
  if (!asset || asset.targetType !== 'CARD_TEMPLATE') return

  const card = await db.cardTemplate.findUnique({
    where: { id: asset.targetId },
    select: { visibility: true, createdByUserId: true, athleteProfile: { select: { claimedByUserId: true } } },
  })
  if (!card || card.visibility === 'PUBLIC') return

  const user = await optionalUser(request)
  const isAuthorized = Boolean(
    user && (user.role === 'ADMIN' || user.id === card.createdByUserId || user.id === card.athleteProfile?.claimedByUserId)
  )
  if (!isAuthorized) throw { statusCode: 404, message: 'Not found' }
}
