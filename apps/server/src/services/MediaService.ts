import { db } from '@statman/db'
import type { EntityType } from '@statman/db'
import { FeedService } from './FeedService'
import { EntityTargetService } from './EntityTargetService'

const feedService = new FeedService()
const targetService = new EntityTargetService()

// Accepts youtu.be short links, watch?v=, and embed URLs.
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([\w-]{11})/,
    /youtube\.com\/watch\?v=([\w-]{11})/,
    /youtube\.com\/embed\/([\w-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1] ?? null
  }
  return null
}

export class MediaService {
  async list(targetType: EntityType, targetId: string) {
    await targetService.requireTarget(targetType, targetId)
    return db.mediaAsset.findMany({
      where: { targetType, targetId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: { uploadedByUser: { include: { profile: true } } },
    })
  }

  async listRecent(limit = 20) {
    const take = Math.min(Math.max(limit, 1), 50)
    return db.mediaAsset.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take,
      include: { uploadedByUser: { include: { profile: true } } },
    })
  }

  async attachYouTube(userId: string, data: { targetType: EntityType; targetId: string; youtubeUrl: string; title?: string }) {
    const videoId = extractYouTubeId(data.youtubeUrl)
    if (!videoId) throw { statusCode: 400, message: 'Could not parse a YouTube video id from that URL' }
    await targetService.requireTarget(data.targetType, data.targetId)

    const media = await db.mediaAsset.create({
      data: {
        type: 'YOUTUBE',
        youtubeVideoId: videoId,
        title: data.title,
        targetType: data.targetType,
        targetId: data.targetId,
        uploadedByUserId: userId,
      },
    })

    await feedService.record({
      type: 'MEDIA_ADDED',
      targetType: data.targetType,
      targetId: data.targetId,
      summary: data.title ? `New video: ${data.title}` : 'New video added',
    })

    return media
  }
}
