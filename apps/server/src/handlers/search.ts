import { SearchService } from '../services/SearchService'
import type { SearchResultType } from '../services/SearchService'

const searchService = new SearchService()

export async function search(request: any, reply: any) {
  const types = request.query.types
    ? (request.query.types.split(',') as SearchResultType[])
    : undefined
  const result = await searchService.search({
    q: request.query.q,
    types,
    cursor: request.query.cursor,
    limit: request.query.limit,
  })
  return reply.send(result)
}
