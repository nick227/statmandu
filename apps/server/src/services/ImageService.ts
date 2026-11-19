import { db } from '@statman/db'
import type { EntityType, ImageAssetUsage } from '@statman/db'
import { EntityTargetService } from './EntityTargetService'
import { storeImage } from '../lib/imageStorage'

const targetService = new EntityTargetService()
const ALLOWED_CONTENT_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_IMAGE_BYTES = Number(process.env.IMAGE_UPLOAD_MAX_BYTES ?? 5 * 1024 * 1024)

export class ImageService {
  async list(targetType: EntityType, targetId: string, usage?: ImageAssetUsage, viewerId?: string, isAdmin = false) {
    await targetService.requireTarget(targetType, targetId, true)
    if (targetType === 'CARD_DESIGN') {
      const design = await db.cardTemplate.findUnique({ where: { id: targetId } })
      if (!design || (!isAdmin && design.createdByUserId !== viewerId)) throw { statusCode: 404, message: 'Not found' }
    }
    if (targetType === 'CARD_TEMPLATE') {
      const card = await db.cardRelease.findUnique({ where: { id: targetId } })
      if (!card || (!isAdmin && card.createdByUserId !== viewerId && !(card.status === 'PUBLISHED' && card.visibility === 'PUBLIC'))) throw { statusCode: 404, message: 'Not found' }
    }
    return db.imageAsset.findMany({
      where: { targetType, targetId, ...(usage ? { usage } : {}), deletedAt: null, ...(isAdmin ? {} : { OR: [{ visibility: 'PUBLIC' }, ...(viewerId ? [{ uploadedByUserId: viewerId }] : [])] }) },
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
    await targetService.requireTarget(data.targetType, data.targetId, true)
    await this.requireUploadPermission(userId, isAdmin, data.targetType, data.targetId, data.usage)

    const buffer = data.fileBuffer
    if (buffer.byteLength === 0) throw { statusCode: 400, message: 'Image payload is empty' }
    if (buffer.byteLength > MAX_IMAGE_BYTES) throw { statusCode: 413, message: 'Image is too large' }

    const visibility = data.targetType === 'CARD_DESIGN' || data.targetType === 'CARD_TEMPLATE' || (data.targetType === 'ATHLETE_PROFILE' && data.usage === 'GALLERY') ? 'PRIVATE' : 'PUBLIC'
    const stored = await storeImage({
      private: visibility === 'PRIVATE',
      buffer,
      contentType: data.contentType,
      originalFilename: data.originalFilename,
      targetType: data.targetType,
      targetId: data.targetId,
      usage: data.usage,
    })

    const image = await db.imageAsset.create({
      data: {
        visibility,
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

    if (data.usage === 'AVATAR' && data.targetType === 'ATHLETE_PROFILE') await db.personProfile.update({ where: { id: data.targetId }, data: { avatarUrl: image.url } })

    if (data.usage === 'AVATAR' && data.targetType === 'PLAYER') {
      const player = await db.player.findUnique({ where: { id: data.targetId } })
      if (player) {
        await db.personProfile.update({
          where: { id: player.athleteProfileId },
          data: { avatarUrl: image.url },
        })
      }
    }

    if (data.usage === 'LOGO' && data.targetType === 'TEAM') {
      await db.team.update({ where: { id: data.targetId }, data: { logoUrl: image.url } })
    }

    if (data.usage === 'HERO' && data.targetType === 'ARTICLE') {
      await db.article.update({ where: { id: data.targetId }, data: { thumbnailUrl: image.url } })
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
    if (targetType === 'CARD_DESIGN') {
      const design = await db.cardTemplate.findUnique({ where: { id: targetId } })
      if (!design || design.archivedAt || (!isAdmin && design.createdByUserId !== userId)) throw { statusCode: 403, message: 'Forbidden' }
      return
    }
    if (isAdmin) return
    if (targetType === 'CARD_TEMPLATE') {
      const card = await db.cardRelease.findUnique({ where: { id: targetId } })
      if (!card || card.createdByUserId !== userId || card.publishedAt) throw { statusCode: 403, message: 'Forbidden' }
      return
    }
    if (targetType === 'ATHLETE_PROFILE' && usage !== 'GALLERY') {
      const person = await db.personProfile.findUnique({ where: { id: targetId } })
      if (!person || (person.claimedByUserId !== userId && !(person.claimedByUserId === null && person.createdByUserId === userId))) throw { statusCode: 403, message: 'Forbidden' }
      return
    }

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

    if (usage === 'HERO' && targetType === 'ARTICLE') {
      const article = await db.article.findUnique({ where: { id: targetId } })
      if (article?.authorUserId === userId) return
      throw { statusCode: 403, message: 'Forbidden' }
    }
  }
}
