import { db } from '@statman/db'
import type { EntityType, ReactionType } from '@statman/db'
import { EntityTargetService } from './EntityTargetService'

const targetService = new EntityTargetService()

export class SocialService {
  async listFollows(targetType: EntityType, targetId: string) {
    await targetService.requireTarget(targetType, targetId)
    return db.follow.findMany({ where: { targetType, targetId } })
  }

  async createFollow(userId: string, data: { targetType: EntityType; targetId: string }) {
    await targetService.requireTarget(data.targetType, data.targetId)
    return db.follow.upsert({
      where: {
        followerId_targetType_targetId: { followerId: userId, targetType: data.targetType, targetId: data.targetId },
      },
      update: {},
      create: { followerId: userId, targetType: data.targetType, targetId: data.targetId },
    })
  }

  async deleteFollow(userId: string, followId: string) {
    const follow = await db.follow.findUnique({ where: { id: followId } })
    if (!follow) throw { statusCode: 404, message: 'Follow not found' }
    if (follow.followerId !== userId) throw { statusCode: 403, message: 'Not the owner of this follow' }
    await db.follow.delete({ where: { id: followId } })
  }

  async getReactionCounts(targetType: EntityType, targetId: string) {
    await targetService.requireTarget(targetType, targetId)
    const reactions = await db.reaction.findMany({ where: { targetType, targetId } })
    const byType: Record<string, number> = {}
    for (const r of reactions) byType[r.type] = (byType[r.type] ?? 0) + 1
    return { total: reactions.length, byType }
  }

  async createReaction(userId: string, data: { targetType: EntityType; targetId: string; type: ReactionType }) {
    await targetService.requireTarget(data.targetType, data.targetId)
    return db.reaction.upsert({
      where: {
        userId_targetType_targetId: { userId, targetType: data.targetType, targetId: data.targetId },
      },
      update: { type: data.type },
      create: { userId, targetType: data.targetType, targetId: data.targetId, type: data.type },
    })
  }

  async deleteReaction(userId: string, reactionId: string) {
    const reaction = await db.reaction.findUnique({ where: { id: reactionId } })
    if (!reaction) throw { statusCode: 404, message: 'Reaction not found' }
    if (reaction.userId !== userId) throw { statusCode: 403, message: 'Not the owner of this reaction' }
    await db.reaction.delete({ where: { id: reactionId } })
  }
}
