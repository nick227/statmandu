import { db } from '@statman/db'
import type { Prisma } from '@prisma/client'

export async function lockPerson(tx: Prisma.TransactionClient, personId: string) {
  await tx.$queryRaw`SELECT id FROM AthleteProfile WHERE id = ${personId} FOR UPDATE`
  const person = await tx.personProfile.findUnique({ where: { id: personId } })
  if (!person || person.deletedAt) throw { statusCode: 404, message: 'Person not found' }
  return person
}

export async function activeAccount(tx: Prisma.TransactionClient, userId: string, admin = false) {
  await tx.$queryRaw`SELECT id FROM User WHERE id = ${userId} FOR UPDATE`
  const user = await tx.user.findUnique({ where: { id: userId } })
  if (!user || user.deletedAt || user.suspendedAt || (admin && user.role !== 'ADMIN')) throw { statusCode: 403, message: 'Active authorized account required' }
  return user
}

// Call only after locking this person's row. Review/revocation follow the same protocol.
export async function officialAuthority(tx: Prisma.TransactionClient, personId: string, userId: string) {
  const person = await tx.personProfile.findUnique({ where: { id: personId } })
  if (!person || person.deletedAt || person.claimedByUserId !== userId) return null
  return tx.claim.findFirst({ where: { athleteProfileId: personId, requestedByUserId: userId, status: 'APPROVED', revokedAt: null, publishingApprovedAt: { not: null }, publishingApprovedByUserId: { not: null } }, orderBy: { publishingApprovedAt: 'desc' } })
}

export async function publishingAuthorityState(personId: string, userId: string) {
  return db.$transaction(async tx => {
    await lockPerson(tx, personId)
    await activeAccount(tx, userId)
    const claim = await officialAuthority(tx, personId, userId)
    return { personProfileId: personId, userId, canPublishOfficial: Boolean(claim), claimId: claim?.id ?? null, approvedAt: claim?.publishingApprovedAt ?? null, basis: claim ? 'REVIEWED_SELF_CLAIM' as const : 'NONE' as const }
  })
}
