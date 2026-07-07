import { db } from '@statman/db'

export class StatsService {
  async listPlayerGames(playerId: string) {
    const player = await db.player.findUnique({ where: { id: playerId } })
    if (!player) throw { statusCode: 404, message: 'Player not found' }

    return db.gameStatLine.findMany({
      where: { playerId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getPlayerSeasonStats(playerId: string) {
    const player = await db.player.findUnique({ where: { id: playerId } })
    if (!player) throw { statusCode: 404, message: 'Player not found' }

    return db.playerSeasonStat.findMany({
      where: { playerId },
      orderBy: { createdAt: 'desc' },
    })
  }
}
