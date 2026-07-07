import { db } from '@statman/db'
import { FeedService } from './FeedService'

const feedService = new FeedService()

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
  list(targetType: string, targetId: string) {
    return db.mediaAsset.findMany({
      where: { targetType: targetType as any, targetId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    })
  }

  async attachYouTube(userId: string, data: { targetType: string; targetId: string; youtubeUrl: string; title?: string }) {
    const videoId = extractYouTubeId(data.youtubeUrl)
    if (!videoId) throw { statusCode: 400, message: 'Could not parse a YouTube video id from that URL' }

    const media = await db.mediaAsset.create({
      data: {
        type: 'YOUTUBE',
        youtubeVideoId: videoId,
        title: data.title,
        targetType: data.targetType as any,
        targetId: data.targetId,
        uploadedByUserId: userId,
      },
    })

    await feedService.record({
      type: 'MEDIA_ADDED',
      targetType: data.targetType as any,
      targetId: data.targetId,
      summary: data.title ? `New video: ${data.title}` : 'New video added',
    })

    return media
  }
}
