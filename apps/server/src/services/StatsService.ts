import { db } from '@statman/db'
import { getSportDefinition, readStatValue } from '@statman/sports'
import { CLAIMED_BY_USER_INCLUDE, withClaimFields } from '../lib/athleteProfile'
import { withGameStatLineContext } from '../lib/gameStatLine'

const PLAYER_INCLUDE = {
  sport: true,
  athleteProfile: { include: CLAIMED_BY_USER_INCLUDE },
  rosterMemberships: {
    where: { isActive: true },
    include: { team: true },
    orderBy: { joinedAt: 'desc' as const },
    take: 1,
  },
}

function serializePlayer(player: any) {
  const { rosterMemberships, athleteProfile, ...rest } = player
  return { ...rest, athleteProfile: withClaimFields(athleteProfile), currentTeam: rosterMemberships?.[0]?.team ?? null }
}

function normalizeLeaderboardLimit(limit?: number) {
  const parsed = Number(limit ?? 25)
  if (!Number.isFinite(parsed)) return 25
  return Math.min(Math.max(Math.floor(parsed), 1), 100)
}

function rankRows<T extends { value: number }>(rows: T[]) {
  let previousValue: number | null = null
  let previousRank = 0
  return rows.map((row, index) => {
    const rank = previousValue === row.value ? previousRank : index + 1
    previousValue = row.value
    previousRank = rank
    return { rank, ...row }
  })
}

export class StatsService {
  async listPlayerGames(playerId: string) {
    const player = await db.player.findUnique({ where: { id: playerId } })
    if (!player) throw { statusCode: 404, message: 'Player not found' }

    const lines = await db.gameStatLine.findMany({
      where: { playerId },
      orderBy: { createdAt: 'desc' },
    })
    return withGameStatLineContext(lines)
  }

  async getPlayerSeasonStats(playerId: string) {
    const player = await db.player.findUnique({ where: { id: playerId } })
    if (!player) throw { statusCode: 404, message: 'Player not found' }

    return db.playerSeasonStat.findMany({
      where: { playerId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getTeamSeasonStats(teamSlug: string) {
    const team = await db.team.findUnique({ where: { slug: teamSlug } })
    if (!team) throw { statusCode: 404, message: 'Team not found' }

    return db.teamSeasonStat.findMany({
      where: { teamId: team.id },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getPlayerLeaderboard(opts: { sportSlug: string; stat: string; seasonId?: string; limit?: number }) {
    const definition = getSportDefinition(opts.sportSlug)
    if (!definition.playerStatFields[opts.stat]) {
      throw { statusCode: 400, message: `Unsupported player stat for ${opts.sportSlug}: ${opts.stat}` }
    }

    const rows = await db.playerSeasonStat.findMany({
      where: {
        ...(opts.seasonId ? { seasonId: opts.seasonId } : {}),
        player: { sport: { slug: opts.sportSlug } },
      },
      include: { player: { include: PLAYER_INCLUDE } },
    })

    return rankRows(
      rows
        .map((row) => ({
          player: serializePlayer(row.player),
          seasonStat: row,
          stat: opts.stat,
          value: Number(readStatValue(definition, row as any, opts.stat) ?? 0),
        }))
        .sort((a, b) => b.value - a.value || a.player.athleteProfile.lastName.localeCompare(b.player.athleteProfile.lastName))
    ).slice(0, normalizeLeaderboardLimit(opts.limit))
  }

  async getTeamLeaderboard(opts: { sportSlug: string; stat: string; seasonId?: string; limit?: number }) {
    const definition = getSportDefinition(opts.sportSlug)
    if (!definition.teamStatFields[opts.stat]) {
      throw { statusCode: 400, message: `Unsupported team stat for ${opts.sportSlug}: ${opts.stat}` }
    }

    const rows = await db.teamSeasonStat.findMany({
      where: {
        ...(opts.seasonId ? { seasonId: opts.seasonId } : {}),
        team: { sport: { slug: opts.sportSlug } },
      },
      include: { team: { include: { league: true, sport: true } } },
    })

    return rankRows(
      rows
        .map((row) => ({
          team: row.team,
          seasonStat: row,
          stat: opts.stat,
          value: Number(readStatValue(definition, row as any, opts.stat) ?? 0),
        }))
        .sort((a, b) => b.value - a.value || a.team.name.localeCompare(b.team.name))
    ).slice(0, normalizeLeaderboardLimit(opts.limit))
  }
}
