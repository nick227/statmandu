import { db } from '@statman/db'

export class SportsService {
  listSports() {
    return db.sport.findMany({ orderBy: { name: 'asc' } })
  }

  listLeagues(sportSlug?: string) {
    return db.league.findMany({
      where: sportSlug ? { sport: { slug: sportSlug } } : undefined,
      include: { sport: true },
      orderBy: { name: 'asc' },
    })
  }

  async getLeague(leagueSlug: string) {
    const league = await db.league.findUnique({
      where: { slug: leagueSlug },
      include: { sport: true },
    })
    if (!league) throw { statusCode: 404, message: 'League not found' }
    return league
  }
}
