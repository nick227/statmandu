import Fuse from 'fuse.js'
import { db } from '@statman/db'
import { normalizeLimit } from '../lib/pagination'
import { decodeOffsetCursor, encodeOffsetCursor } from '../lib/searchCursor'

export type SearchResultType = 'PLAYER' | 'TEAM' | 'GAME' | 'ARTICLE'

type SearchResultItem = {
  type: SearchResultType
  id: string
  title: string
  subtitle: string | null
  imageUrl: string | null
  score: number
}

// One entry per searchable entity. Adding a new searchable entity means
// adding one provider here — fetchCandidates/searchText/toResult — not
// touching the matching, scoring, or pagination logic below.
type SearchProvider = {
  type: SearchResultType
  fetchCandidates: () => Promise<{ searchText: string; item: any }[]>
  toResult: (item: any) => Omit<SearchResultItem, 'type' | 'score'>
}

const ALL_TYPES: SearchResultType[] = ['PLAYER', 'TEAM', 'GAME', 'ARTICLE']

// Small corpus (an MVP demo scale of dozens of rows per entity, not
// millions) makes fetch-everything-then-fuzzy-match-in-process both
// correct and fast, without needing DB-level FULLTEXT indexes or an
// external search engine. Revisit with a real index (or a dedicated search
// service) once any entity's row count stops being trivially small.
const providers: Record<SearchResultType, SearchProvider> = {
  PLAYER: {
    type: 'PLAYER',
    async fetchCandidates() {
      const players = await db.player.findMany({
        include: {
          athleteProfile: true,
          rosterMemberships: {
            where: { isActive: true },
            include: { team: true },
            orderBy: { joinedAt: 'desc' },
            take: 1,
          },
        },
      })
      return players.map((player) => ({
        searchText: `${player.athleteProfile.firstName} ${player.athleteProfile.lastName}`,
        item: player,
      }))
    },
    toResult(player) {
      const team = player.rosterMemberships[0]?.team ?? null
      return {
        id: player.id,
        title: `${player.athleteProfile.firstName} ${player.athleteProfile.lastName}`,
        subtitle: [player.position, team?.name].filter(Boolean).join(' · ') || null,
        imageUrl: player.athleteProfile.avatarUrl ?? null,
      }
    },
  },
  TEAM: {
    type: 'TEAM',
    async fetchCandidates() {
      const teams = await db.team.findMany({ include: { league: true } })
      return teams.map((team) => ({ searchText: team.name, item: team }))
    },
    toResult(team) {
      return {
        id: team.id,
        title: team.name,
        subtitle: team.league?.name ?? null,
        imageUrl: team.logoUrl ?? null,
      }
    },
  },
  GAME: {
    type: 'GAME',
    async fetchCandidates() {
      const games = await db.game.findMany({ include: { gameTeams: { include: { team: true } } } })
      return games.map((game) => {
        const home = game.gameTeams.find((gt) => gt.isHome)?.team
        const away = game.gameTeams.find((gt) => !gt.isHome)?.team
        return {
          searchText: [home?.name, away?.name].filter(Boolean).join(' vs '),
          item: { game, home, away },
        }
      })
    },
    toResult({ game, home, away }) {
      return {
        id: game.id,
        title: [home?.name ?? 'TBD', away?.name ?? 'TBD'].join(' vs '),
        subtitle: `${game.status} · ${game.scheduledAt.toISOString().slice(0, 10)}`,
        imageUrl: null,
      }
    },
  },
  // PUBLISHED only — search is a public-read surface, same as listArticles'
  // default (no authorUserId) behavior. Drafts/pending/rejected articles
  // never appear here regardless of who's searching.
  ARTICLE: {
    type: 'ARTICLE',
    async fetchCandidates() {
      const articles = await db.article.findMany({ where: { status: 'PUBLISHED' } })
      return articles.map((article) => ({ searchText: article.title, item: article }))
    },
    toResult(article) {
      const keywords = (article.keywords as string[] | null) ?? []
      return {
        id: article.id,
        title: article.title,
        subtitle: keywords[0] ?? null,
        imageUrl: article.thumbnailUrl ?? null,
      }
    },
  },
}

// Verified/claimed identities are a stronger signal of "this is who the
// searcher meant" than raw text similarity alone — a small tie-breaking
// boost, not a replacement for the text match.
function relevanceBoost(type: SearchResultType, item: any): number {
  if (type === 'PLAYER' && item.athleteProfile?.sourceStatus === 'VERIFIED_TEAM_ACCOUNT') return 0.05
  return 0
}

export class SearchService {
  async search(opts: { q: string; types?: SearchResultType[]; cursor?: string; limit?: number }) {
    const limit = normalizeLimit(opts.limit)
    const activeTypes = opts.types?.length ? opts.types : ALL_TYPES

    const results: SearchResultItem[] = []
    for (const type of activeTypes) {
      const provider = providers[type]
      if (!provider) continue
      const candidates = await provider.fetchCandidates()
      const fuse = new Fuse(candidates, { keys: ['searchText'], includeScore: true, threshold: 0.4, ignoreLocation: true })
      for (const match of fuse.search(opts.q)) {
        const textScore = 1 - (match.score ?? 0)
        const score = Math.min(1, textScore + relevanceBoost(type, match.item.item))
        results.push({ type, score, ...provider.toResult(match.item.item) })
      }
    }

    results.sort((a, b) => b.score - a.score)

    const offset = decodeOffsetCursor(opts.cursor)
    const page = results.slice(offset, offset + limit)
    const hasMore = offset + limit < results.length
    const nextCursor = hasMore ? encodeOffsetCursor(offset + limit) : null

    return { data: page, meta: { hasMore, nextCursor } }
  }
}
