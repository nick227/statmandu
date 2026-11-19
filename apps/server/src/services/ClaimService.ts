import { db } from '@statman/db'
import type { ClaimStatus } from '@statman/db'
import { activeAccount, lockPerson } from './PublishingAuthority'

export class ClaimService {
  async claimPlayer(playerId: string, userId: string, verificationNote?: string) {
    const player = await db.player.findUnique({ where: { id: playerId } })
    if (!player) throw { statusCode: 404, message: 'Player not found' }
    return this.claimPerson(player.athleteProfileId, userId, verificationNote)
  }

  async claimPerson(personId: string, userId: string, verificationNote?: string) {
    return db.$transaction(async tx => {
      const person = await lockPerson(tx, personId)
      await activeAccount(tx, userId)
      if (person.claimedByUserId && person.claimedByUserId !== userId) throw { statusCode: 409, message: 'Profile is already claimed' }
      const approved = await tx.claim.findFirst({ where: { athleteProfileId: personId, requestedByUserId: userId, status: 'APPROVED', revokedAt: null } })
      if (approved) throw { statusCode: 409, message: 'Existing approved claim requires admin revalidation if publishing authority is missing' }
      const pending = await tx.claim.findFirst({ where: { athleteProfileId: personId, requestedByUserId: userId, status: 'PENDING' } })
      return pending ?? tx.claim.create({ data: { athleteProfileId: personId, requestedByUserId: userId, verificationNote } })
    }, { isolationLevel: 'ReadCommitted' })
  }

  listClaims(status?: string) {
    return db.claim.findMany({ where: status ? { status: status as ClaimStatus } : undefined, orderBy: { createdAt: 'desc' } })
  }

  async reviewClaim(adminUserId: string, claimId: string, data: { status: ClaimStatus; verificationNote?: string }) {
    if (!['APPROVED', 'REJECTED'].includes(data.status)) throw { statusCode: 400, message: 'Review requires APPROVED or REJECTED' }
    const locator = await db.claim.findUnique({ where: { id: claimId } })
    if (!locator) throw { statusCode: 404, message: 'Claim not found' }
    return db.$transaction(async tx => {
      const person = await lockPerson(tx, locator.athleteProfileId)
      // Fixed account lock order also covers two admins reviewing opposing claims.
      for (const id of [...new Set([adminUserId, locator.requestedByUserId])].sort()) await activeAccount(tx, id, id === adminUserId)
      const claim = await tx.claim.findUniqueOrThrow({ where: { id: claimId } })
      const revalidation = claim.status === 'APPROVED' && !claim.publishingApprovedAt && !claim.revokedAt && data.status === 'APPROVED'
      if (claim.status !== 'PENDING' && !revalidation) throw { statusCode: 409, message: 'Claim already reviewed; revoked authority requires a new claim' }
      if (data.status === 'APPROVED' && adminUserId === claim.requestedByUserId) throw { statusCode: 403, message: 'A different administrator must review self-publishing authority' }
      if (person.claimedByUserId && person.claimedByUserId !== claim.requestedByUserId) throw { statusCode: 409, message: 'Profile already controlled by another user' }
      const now = new Date()
      if (data.status === 'APPROVED') {
        const grant = await tx.claim.findFirst({ where: { athleteProfileId: person.id, id: { not: claimId }, status: 'APPROVED', revokedAt: null, publishingApprovedAt: { not: null } } })
        if (grant) throw { statusCode: 409, message: 'Revoke the existing publishing grant before approving another' }
        const other = await tx.personProfile.findFirst({ where: { claimedByUserId: claim.requestedByUserId, id: { not: person.id } } })
        if (other) throw { statusCode: 409, message: 'Account already controls another person' }
        await tx.personProfile.update({ where: { id: person.id }, data: { claimedByUserId: claim.requestedByUserId } })
        await tx.claim.updateMany({ where: { athleteProfileId: person.id, id: { not: claimId }, status: 'PENDING' }, data: { status: 'REJECTED', reviewedByUserId: adminUserId, reviewedAt: now, verificationNote: 'Another claim was approved.' } })
        if (!revalidation) await tx.feedItem.create({ data: { type: 'PROFILE_CLAIMED', targetType: 'ATHLETE_PROFILE', targetId: person.id, summary: `${person.displayName || [person.firstName, person.lastName].join(' ')}'s profile was claimed.`, occurredAt: now } })
      }
      const updated = await tx.claim.update({ where: { id: claimId }, data: {
        status: data.status,
        ...(!revalidation ? { verificationNote: data.verificationNote, reviewedByUserId: adminUserId, reviewedAt: now } : {}),
        ...(data.status === 'APPROVED' ? { publishingApprovedAt: now, publishingApprovedByUserId: adminUserId } : {}),
      } })
      await tx.adminAuditLog.create({ data: { actorUserId: adminUserId, subjectUserId: claim.requestedByUserId, method: 'PATCH', path: `/claims/${claimId}`, targetType: 'ATHLETE_PROFILE', targetId: person.id, diffJson: { claimId, status: data.status, publishingAuthority: data.status === 'APPROVED', revalidation } } })
      return updated
    }, { isolationLevel: 'ReadCommitted' })
  }

  async revokeClaim(actorId: string, claimId: string, reason: string) {
    if (!reason?.trim() || reason.length > 1000) throw { statusCode: 400, message: 'A revocation reason is required (maximum 1000 characters)' }
    const locator = await db.claim.findUnique({ where: { id: claimId } })
    if (!locator) throw { statusCode: 404, message: 'Claim not found' }
    return db.$transaction(async tx => {
      const person = await lockPerson(tx, locator.athleteProfileId, true)
      const actor = await activeAccount(tx, actorId)
      const claim = await tx.claim.findUniqueOrThrow({ where: { id: claimId } })
      if (actor.role !== 'ADMIN' && actor.id !== claim.requestedByUserId) throw { statusCode: 403, message: 'Only the claimant or an administrator may revoke authority' }
      if (claim.status === 'REVOKED') return claim
      if (claim.status !== 'APPROVED') throw { statusCode: 409, message: 'Only approved claims can be revoked' }
      const updated = await tx.claim.update({ where: { id: claimId }, data: { status: 'REVOKED', revokedAt: new Date(), revokedByUserId: actorId, revocationReason: reason.trim() } })
      const remaining = await tx.claim.count({ where: { athleteProfileId: person.id, requestedByUserId: claim.requestedByUserId, status: 'APPROVED', revokedAt: null } })
      if (!remaining) await tx.personProfile.updateMany({ where: { id: person.id, claimedByUserId: claim.requestedByUserId }, data: { claimedByUserId: null } })
      await tx.adminAuditLog.create({ data: { actorUserId: actorId, subjectUserId: claim.requestedByUserId, method: 'POST', path: `/claims/${claimId}/revoke`, targetType: 'ATHLETE_PROFILE', targetId: person.id, diffJson: { claimId, status: 'REVOKED' } } })
      return updated
    }, { isolationLevel: 'ReadCommitted' })
  }
}
