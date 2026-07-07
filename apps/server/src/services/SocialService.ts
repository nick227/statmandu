import { db } from '@statman/db'

export class SocialService {
  listFollows(targetType: string, targetId: string) {
    return db.follow.findMany({ where: { targetType: targetType as any, targetId } })
  }

  async createFollow(userId: string, data: { targetType: string; targetId: string }) {
    return db.follow.upsert({
      where: {
        followerId_targetType_targetId: { followerId: userId, targetType: data.targetType as any, targetId: data.targetId },
      },
      update: {},
      create: { followerId: userId, targetType: data.targetType as any, targetId: data.targetId },
    })
  }

  async deleteFollow(userId: string, followId: string) {
    const follow = await db.follow.findUnique({ where: { id: followId } })
    if (!follow) throw { statusCode: 404, message: 'Follow not found' }
    if (follow.followerId !== userId) throw { statusCode: 403, message: 'Not the owner of this follow' }
    await db.follow.delete({ where: { id: followId } })
  }

  async getReactionCounts(targetType: string, targetId: string) {
    const reactions = await db.reaction.findMany({ where: { targetType: targetType as any, targetId } })
    const byType: Record<string, number> = {}
    for (const r of reactions) byType[r.type] = (byType[r.type] ?? 0) + 1
    return { total: reactions.length, byType }
  }

  async createReaction(userId: string, data: { targetType: string; targetId: string; type: string }) {
    return db.reaction.upsert({
      where: {
        userId_targetType_targetId: { userId, targetType: data.targetType as any, targetId: data.targetId },
      },
      update: { type: data.type as any },
      create: { userId, targetType: data.targetType as any, targetId: data.targetId, type: data.type as any },
    })
  }

  async deleteReaction(userId: string, reactionId: string) {
    const reaction = await db.reaction.findUnique({ where: { id: reactionId } })
    if (!reaction) throw { statusCode: 404, message: 'Reaction not found' }
    if (reaction.userId !== userId) throw { statusCode: 403, message: 'Not the owner of this reaction' }
    await db.reaction.delete({ where: { id: reactionId } })
  }
}
