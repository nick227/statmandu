import { db } from '@statman/db'
import { FeedService } from './FeedService'

const feedService = new FeedService()

export class VerificationService {
  listSources(targetType: string, targetId: string) {
    return db.sourceReference.findMany({ where: { targetType: targetType as any, targetId } })
  }

  createSource(data: { targetType: string; targetId: string; sourceType: string; url?: string; label?: string }) {
    return db.sourceReference.create({
      data: {
        targetType: data.targetType as any,
        targetId: data.targetId,
        sourceType: data.sourceType as any,
        url: data.url,
        label: data.label,
        importedAt: data.sourceType === 'MANUAL' ? null : new Date(),
      },
    })
  }

  listDisputes(targetType: string, targetId: string) {
    return db.dispute.findMany({ where: { targetType: targetType as any, targetId }, orderBy: { createdAt: 'desc' } })
  }

  openDispute(userId: string, data: { targetType: string; targetId: string; fieldName?: string; description: string; proposedValue?: string }) {
    return db.dispute.create({
      data: {
        targetType: data.targetType as any,
        targetId: data.targetId,
        fieldName: data.fieldName,
        description: data.description,
        proposedValue: data.proposedValue,
        submittedByUserId: userId,
        status: 'OPEN',
      },
    })
  }

  async resolveDispute(adminUserId: string, disputeId: string, data: { status: string; resolutionNote?: string }) {
    const dispute = await db.dispute.findUnique({ where: { id: disputeId } })
    if (!dispute) throw { statusCode: 404, message: 'Dispute not found' }

    const resolved = await db.dispute.update({
      where: { id: disputeId },
      data: {
        status: data.status as any,
        resolutionNote: data.resolutionNote,
        resolvedByUserId: adminUserId,
        resolvedAt: new Date(),
      },
    })

    if (data.status === 'RESOLVED') {
      await feedService.record({
        type: 'DISPUTE_RESOLVED',
        targetType: resolved.targetType,
        targetId: resolved.targetId,
        summary: 'A dispute was resolved.',
      })
    }

    return resolved
  }

  async verifyPlayer(playerId: string, sourceStatus: string) {
    const player = await db.player.findUnique({ where: { id: playerId } })
    if (!player) throw { statusCode: 404, message: 'Player not found' }

    await db.athleteProfile.update({
      where: { id: player.athleteProfileId },
      data: { sourceStatus: sourceStatus as any },
    })

    return db.player.findUniqueOrThrow({
      where: { id: playerId },
      include: { athleteProfile: true },
    })
  }
}
