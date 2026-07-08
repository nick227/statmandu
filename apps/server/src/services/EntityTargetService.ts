import { db } from '@statman/db'
import type { EntityType } from '@statman/db'

export type EntityTarget = {
  targetType: EntityType
  targetId: string
}

export class EntityTargetService {
  async requireTarget(targetType: EntityType, targetId: string) {
    const exists = await this.exists(targetType, targetId)
    if (!exists) throw { statusCode: 404, message: `${this.labelFor(targetType)} target not found` }
  }

  private async exists(targetType: EntityType, targetId: string) {
    switch (targetType) {
      case 'PLAYER':
        return Boolean(await db.player.findUnique({ where: { id: targetId }, select: { id: true } }))
      case 'TEAM':
        return Boolean(await db.team.findUnique({ where: { id: targetId }, select: { id: true } }))
      case 'GAME':
        return Boolean(await db.game.findUnique({ where: { id: targetId }, select: { id: true } }))
      case 'FEED_ITEM':
        return Boolean(await db.feedItem.findUnique({ where: { id: targetId }, select: { id: true } }))
      case 'ATHLETE_PROFILE':
        return Boolean(await db.athleteProfile.findUnique({ where: { id: targetId }, select: { id: true } }))
      case 'GAME_STAT_LINE':
        return Boolean(await db.gameStatLine.findUnique({ where: { id: targetId }, select: { id: true } }))
      case 'GAME_EVENT':
        return Boolean(await db.gameEvent.findUnique({ where: { id: targetId }, select: { id: true } }))
      case 'SOURCE_REFERENCE':
        return Boolean(await db.sourceReference.findUnique({ where: { id: targetId }, select: { id: true } }))
      case 'PLAYER_SEASON_STAT':
        return Boolean(await db.playerSeasonStat.findUnique({ where: { id: targetId }, select: { id: true } }))
      case 'TEAM_SEASON_STAT':
        return Boolean(await db.teamSeasonStat.findUnique({ where: { id: targetId }, select: { id: true } }))
      case 'PROFILE_FIELD':
        throw { statusCode: 400, message: 'PROFILE_FIELD targets require field-level context and are not supported here' }
      default:
        return false
    }
  }

  private labelFor(targetType: EntityType) {
    return targetType.toLowerCase().replaceAll('_', ' ')
  }
}
