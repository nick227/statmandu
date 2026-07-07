import { db } from '@statman/db'
import { FeedService } from './FeedService'

const feedService = new FeedService()

export class ClaimService {
  async claimPlayer(playerId: string, userId: string, verificationNote?: string) {
    const player = await db.player.findUnique({ where: { id: playerId }, include: { athleteProfile: true } })
    if (!player) throw { statusCode: 404, message: 'Player not found' }

    if (player.athleteProfile.claimedByUserId) {
      throw { statusCode: 409, message: 'This profile has already been claimed' }
    }

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

  async reviewClaim(adminUserId: string, claimId: string, data: { status: string; verificationNote?: string }) {
    const claim = await db.claim.findUnique({ where: { id: claimId } })
    if (!claim) throw { statusCode: 404, message: 'Claim not found' }

    const updated = await db.claim.update({
      where: { id: claimId },
      data: {
        status: data.status as any,
        verificationNote: data.verificationNote,
        reviewedByUserId: adminUserId,
        reviewedAt: new Date(),
      },
    })

    if (data.status === 'APPROVED') {
      const profile = await db.athleteProfile.update({
        where: { id: claim.athleteProfileId },
        data: { claimedByUserId: claim.requestedByUserId },
      })

      await feedService.record({
        type: 'PROFILE_CLAIMED',
        targetType: 'ATHLETE_PROFILE',
        targetId: profile.id,
        summary: `${profile.firstName} ${profile.lastName}'s profile was claimed.`,
      })
    }

    return updated
  }
}
