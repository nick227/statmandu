import { db } from '@statman/db'

export class TeamService {
  listTeams(leagueSlug?: string) {
    return db.team.findMany({
      where: leagueSlug ? { league: { slug: leagueSlug } } : undefined,
      include: { league: true },
      orderBy: { name: 'asc' },
    })
  }

  async getTeam(teamSlug: string) {
    const team = await db.team.findUnique({
      where: { slug: teamSlug },
      include: { league: true },
    })
    if (!team) throw { statusCode: 404, message: 'Team not found' }
    return team
  }

  async getRoster(teamSlug: string) {
    const team = await db.team.findUnique({ where: { slug: teamSlug } })
    if (!team) throw { statusCode: 404, message: 'Team not found' }

    return db.rosterMembership.findMany({
      where: { teamId: team.id, isActive: true },
      include: { player: { include: { athleteProfile: true } } },
      orderBy: { jerseyNumber: 'asc' },
    })
  }

  async addRosterMember(teamId: string, data: { playerId: string; seasonId: string; jerseyNumber?: number }) {
    const team = await db.team.findUnique({ where: { id: teamId } })
    if (!team) throw { statusCode: 404, message: 'Team not found' }

    const player = await db.player.findUnique({ where: { id: data.playerId } })
    if (!player) throw { statusCode: 404, message: 'Player not found' }

    const season = await db.season.findUnique({ where: { id: data.seasonId } })
    if (!season) throw { statusCode: 404, message: 'Season not found' }

    return db.rosterMembership.create({
      data: {
        teamId,
        playerId: data.playerId,
        seasonId: data.seasonId,
        jerseyNumber: data.jerseyNumber,
      },
      include: { player: { include: { athleteProfile: true } } },
    })
  }
}
