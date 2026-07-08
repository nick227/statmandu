import type { components } from '@statman/sdk'
import type { HomeMockActivity } from '@/modules/feed/homeContent'

type FeedItem = components['schemas']['FeedItem']
type MediaAsset = components['schemas']['MediaAsset']

export type CommunityPulseItem =
  | { kind: 'feed'; id: string; feed: FeedItem }
  | { kind: 'mock'; id: string; mock: HomeMockActivity }
  | { kind: 'video'; id: string; video: MediaAsset; videoIndex: number }

export function buildCommunityPulse(
  feed: FeedItem[],
  mock: HomeMockActivity[],
  videos: MediaAsset[],
  every = 2
): CommunityPulseItem[] {
  const result: CommunityPulseItem[] = []
  const activity: Array<{ kind: 'feed'; item: FeedItem } | { kind: 'mock'; item: HomeMockActivity }> = [
    ...feed.map((item) => ({ kind: 'feed' as const, item })),
    ...mock.map((item) => ({ kind: 'mock' as const, item })),
  ]

  let videoCursor = 0
  for (let i = 0; i < activity.length; i++) {
    const row = activity[i]!
    if (row.kind === 'feed') {
      result.push({ kind: 'feed', id: row.item.id, feed: row.item })
    } else {
      result.push({ kind: 'mock', id: row.item.id, mock: row.item })
    }

    if ((i + 1) % every === 0 && videoCursor < videos.length) {
      const video = videos[videoCursor]!
      result.push({ kind: 'video', id: video.id, video, videoIndex: videoCursor })
      videoCursor++
    }
  }

  return result
}
