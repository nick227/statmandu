import { db } from '@statman/db'
import type { DisputeStatus, EntityType, ReferenceSourceType, SourceStatus } from '@statman/db'
import { FeedService } from './FeedService'
import { EntityTargetService } from './EntityTargetService'
import { CLAIMED_BY_USER_INCLUDE, withClaimFields } from '../lib/athleteProfile'

const feedService = new FeedService()
const targetService = new EntityTargetService()
const HUMAN_SOURCE_TYPES = new Set<ReferenceSourceType>([
  'VERIFIED_TEAM_ACCOUNT',
  'TEAM_MANAGER',
  'OFFICIAL_SCORER',
  'PLAYER_REPORT',
  'SPECTATOR_REPORT',
  'MULTI_SPECTATOR_REPORT',
])

export class VerificationService {
  async listSources(targetType: EntityType, targetId: string) {
    await targetService.requireTarget(targetType, targetId)
    return db.sourceReference.findMany({ where: { targetType, targetId } })
  }

  async createSource(data: { targetType: EntityType; targetId: string; sourceType: ReferenceSourceType; url?: string; label?: string }) {
    await targetService.requireTarget(data.targetType, data.targetId)
    return db.sourceReference.create({
      data: {
        targetType: data.targetType,
        targetId: data.targetId,
        sourceType: data.sourceType,
        url: data.url,
        label: data.label,
        importedAt: HUMAN_SOURCE_TYPES.has(data.sourceType) ? null : new Date(),
      },
    })
  }

  async listDisputes(targetType: EntityType, targetId: string) {
    await targetService.requireTarget(targetType, targetId)
    return db.dispute.findMany({ where: { targetType, targetId }, orderBy: { createdAt: 'desc' } })
  }

  async openDispute(userId: string, data: { targetType: EntityType; targetId: string; fieldName?: string; description: string; proposedValue?: string }) {
    await targetService.requireTarget(data.targetType, data.targetId)
    return db.dispute.create({
      data: {
        targetType: data.targetType,
        targetId: data.targetId,
        fieldName: data.fieldName,
        description: data.description,
        proposedValue: data.proposedValue,
        submittedByUserId: userId,
        status: 'OPEN',
      },
    })
  }

  async resolveDispute(adminUserId: string, disputeId: string, data: { status: DisputeStatus; resolutionNote?: string }) {
    const dispute = await db.dispute.findUnique({ where: { id: disputeId } })
    if (!dispute) throw { statusCode: 404, message: 'Dispute not found' }

    const resolved = await db.dispute.update({
      where: { id: disputeId },
      data: {
        status: data.status,
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

  async verifyPlayer(playerId: string, sourceStatus: SourceStatus) {
    const player = await db.player.findUnique({ where: { id: playerId } })
    if (!player) throw { statusCode: 404, message: 'Player not found' }

    await db.athleteProfile.update({
      where: { id: player.athleteProfileId },
      data: { sourceStatus },
    })

    const updated = await db.player.findUniqueOrThrow({
      where: { id: playerId },
      include: { athleteProfile: { include: CLAIMED_BY_USER_INCLUDE } },
    })
    return { ...updated, athleteProfile: withClaimFields(updated.athleteProfile) }
  }
}
