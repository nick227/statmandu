import { FeedService } from '../services/FeedService'

const feedService = new FeedService()

export async function getFeed(request: any, reply: any) {
  const result = await feedService.list(request.query ?? {})
  return reply.send(result)
}
