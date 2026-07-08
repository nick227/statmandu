import { db } from '@statman/db'
import type { ClaimStatus } from '@statman/db'

export class ClaimService {
  async claimPlayer(playerId: string, userId: string, verificationNote?: string) {
    const player = await db.player.findUnique({ where: { id: playerId }, include: { athleteProfile: true } })
    if (!player) throw { statusCode: 404, message: 'Player not found' }

    if (player.athleteProfile.claimedByUserId) {
      throw { statusCode: 409, message: 'This profile has already been claimed' }
    }

    const existingPending = await db.claim.findFirst({
      where: {
        athleteProfileId: player.athleteProfileId,
        requestedByUserId: userId,
        status: 'PENDING',
      },
    })
    if (existingPending) return existingPending

    return db.claim.create({
      data: {
        athleteProfileId: player.athleteProfileId,
        requestedByUserId: userId,
        verificationNote,
        status: 'PENDING',
      },
    })
  }

  listClaims(status?: string) {
    return db.claim.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { createdAt: 'desc' },
    })
  }

  async reviewClaim(adminUserId: string, claimId: string, data: { status: ClaimStatus; verificationNote?: string }) {
    if (data.status === 'PENDING') {
      throw { statusCode: 400, message: 'Claims can only be reviewed as APPROVED or REJECTED' }
    }

    const claim = await db.claim.findUnique({ where: { id: claimId }, include: { athleteProfile: true } })
    if (!claim) throw { statusCode: 404, message: 'Claim not found' }
    if (claim.status !== 'PENDING') {
      throw { statusCode: 409, message: 'This claim has already been reviewed' }
    }
    if (claim.athleteProfile.claimedByUserId && claim.athleteProfile.claimedByUserId !== claim.requestedByUserId) {
      throw { statusCode: 409, message: 'This profile has already been claimed by another user' }
    }

    return db.$transaction(async (tx) => {
      const updated = await tx.claim.update({
        where: { id: claimId },
        data: {
          status: data.status,
          verificationNote: data.verificationNote,
          reviewedByUserId: adminUserId,
          reviewedAt: new Date(),
        },
      })

      if (data.status === 'APPROVED') {
        const profileUpdate = await tx.athleteProfile.updateMany({
          where: { id: claim.athleteProfileId, claimedByUserId: null },
          data: { claimedByUserId: claim.requestedByUserId },
        })
        if (profileUpdate.count !== 1) {
          throw { statusCode: 409, message: 'This profile has already been claimed by another user' }
        }
        const profile = await tx.athleteProfile.findUniqueOrThrow({ where: { id: claim.athleteProfileId } })

        await tx.claim.updateMany({
          where: {
            athleteProfileId: claim.athleteProfileId,
            id: { not: claimId },
            status: 'PENDING',
          },
          data: {
            status: 'REJECTED',
            reviewedByUserId: adminUserId,
            reviewedAt: new Date(),
            verificationNote: 'Rejected automatically because another claim was approved.',
          },
        })

        await tx.feedItem.create({
          data: {
            type: 'PROFILE_CLAIMED',
            targetType: 'ATHLETE_PROFILE',
            targetId: profile.id,
            summary: `${profile.firstName} ${profile.lastName}'s profile was claimed.`,
            occurredAt: new Date(),
          },
        })
      }

      return updated
    })
  }
}
