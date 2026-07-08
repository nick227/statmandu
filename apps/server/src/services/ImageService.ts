import { db } from '@statman/db'
import type { EntityType, ImageAssetUsage } from '@statman/db'
import { EntityTargetService } from './EntityTargetService'
import { storeImage } from '../lib/imageStorage'

const targetService = new EntityTargetService()
const ALLOWED_CONTENT_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_IMAGE_BYTES = Number(process.env.IMAGE_UPLOAD_MAX_BYTES ?? 5 * 1024 * 1024)

export class ImageService {
  async list(targetType: EntityType, targetId: string, usage?: ImageAssetUsage) {
    await targetService.requireTarget(targetType, targetId)
    return db.imageAsset.findMany({
      where: { targetType, targetId, ...(usage ? { usage } : {}), deletedAt: null },
      orderBy: { createdAt: 'desc' },
    })
  }

  async upload(userId: string, isAdmin: boolean, data: {
    targetType: EntityType
    targetId: string
    usage: ImageAssetUsage
    contentType: string
    fileBuffer: Buffer
    originalFilename?: string
    width?: number
    height?: number
  }) {
    if (!ALLOWED_CONTENT_TYPES.has(data.contentType)) throw { statusCode: 400, message: 'Unsupported image type' }
    await targetService.requireTarget(data.targetType, data.targetId)
    await this.requireUploadPermission(userId, isAdmin, data.targetType, data.targetId, data.usage)

    const buffer = data.fileBuffer
    if (buffer.byteLength === 0) throw { statusCode: 400, message: 'Image payload is empty' }
    if (buffer.byteLength > MAX_IMAGE_BYTES) throw { statusCode: 413, message: 'Image is too large' }

    const stored = await storeImage({
      buffer,
      contentType: data.contentType,
      originalFilename: data.originalFilename,
      targetType: data.targetType,
      targetId: data.targetId,
      usage: data.usage,
    })

    const image = await db.imageAsset.create({
      data: {
        targetType: data.targetType,
        targetId: data.targetId,
        usage: data.usage,
        storageProvider: stored.provider,
        objectKey: stored.objectKey,
        url: stored.url,
        originalFilename: data.originalFilename,
        contentType: data.contentType,
        byteSize: buffer.byteLength,
        width: data.width,
        height: data.height,
        uploadedByUserId: userId,
      },
    })

    if (data.usage === 'AVATAR' && data.targetType === 'PLAYER') {
      const player = await db.player.findUnique({ where: { id: data.targetId } })
      if (player) {
        await db.athleteProfile.update({
          where: { id: player.athleteProfileId },
          data: { avatarUrl: image.url },
        })
      }
    }

    if (data.usage === 'LOGO' && data.targetType === 'TEAM') {
      await db.team.update({ where: { id: data.targetId }, data: { logoUrl: image.url } })
    }

    return image
  }

  private async requireUploadPermission(
    userId: string,
    isAdmin: boolean,
    targetType: EntityType,
    targetId: string,
    usage: ImageAssetUsage
  ) {
    if (isAdmin) return

    if (usage === 'AVATAR' && targetType === 'PLAYER') {
      const player = await db.player.findUnique({ where: { id: targetId }, include: { athleteProfile: true } })
      if (player?.athleteProfile.claimedByUserId === userId) return
      throw { statusCode: 403, message: 'Forbidden' }
    }

    if (usage === 'LOGO' && targetType === 'TEAM') {
      // Durable team-management roles are not modeled yet; admins own this path
      // until team-role claims land.
      throw { statusCode: 403, message: 'Forbidden' }
    }
  }
}
