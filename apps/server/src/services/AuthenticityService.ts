import { createHash } from 'node:crypto'
import { db } from '@statman/db'
import { canonicalManifest, inspectSignature } from './ReleaseSigning'

export class AuthenticityService {
  async release(id: string) {
    // No subject-owner shortcut, including on verification paths. Withdrawn
    // previously-public signed releases remain inspectable as historical attestations.
    const release = await db.cardRelease.findUnique({ where: { id }, include: { authorizationClaim: true, athleteProfile: true, publishedByUser: true } })
    const manifest = release?.manifestJson as any
    if (!release?.publishedAt || !((release.status === 'PUBLISHED' && release.visibility === 'PUBLIC') || (release.status === 'ARCHIVED' && manifest?.publicationVisibility === 'PUBLIC'))) throw { statusCode: 404, message: 'Public release not found' }
    const signatureStatus = inspectSignature(release)
    let contentMatches = false
    try {
      contentMatches = Boolean(manifest && manifest.releaseId === release.id && manifest.personProfileId === release.athleteProfileId && manifest.createdByUserId === release.createdByUserId && manifest.publishedByUserId === release.publishedByUserId && manifest.publicationType === release.publicationType && manifest.edition?.mode === release.editionMode && manifest.edition?.size === release.editionSize && manifest.publishedAt === release.publishedAt.toISOString() && manifest.originHash === release.originHash && canonicalManifest(manifest.content) === canonicalManifest(release.contentSnapshotJson) && manifest.rendererVersion === ((release.templateSnapshotJson as any)?.rendererVersion ?? 'legacy-card-v1') && canonicalManifest(manifest.content?.design ?? null) === canonicalManifest(release.templateSnapshotJson))
    } catch { /* Malformed evidence is never reported valid. */ }
    const claim = release.authorizationClaim
    const evidence = manifest?.authorization
    const evidenceMatches = Boolean(claim && evidence && evidence.claimId === claim.id && evidence.basis === 'REVIEWED_SELF_CLAIM' && evidence.policyVersion === 1 && evidence.personProfileId === release.athleteProfileId && evidence.userId === release.publishedByUserId && claim.athleteProfileId === release.athleteProfileId && claim.requestedByUserId === release.publishedByUserId && evidence.approvedAt === claim.publishingApprovedAt?.toISOString() && evidence.reviewedByUserId === claim.publishingApprovedByUserId && claim.publishingApprovedAt && claim.publishingApprovedAt <= release.publishedAt && (!claim.revokedAt || claim.revokedAt >= release.publishedAt))
    const platformAttestation = signatureStatus === 'VALID' && !contentMatches ? 'INVALID' : signatureStatus
    const officialAtPublication = release.publicationType === 'COMMUNITY' ? 'NOT_APPLICABLE' : platformAttestation === 'VALID' && evidenceMatches ? 'VERIFIED' : 'MISSING_OR_INVALID_EVIDENCE'
    const currentAuthority = release.publicationType === 'COMMUNITY' ? 'NOT_APPLICABLE' : !evidenceMatches ? 'UNKNOWN' : claim?.revokedAt || claim?.status === 'REVOKED' ? 'REVOKED' : claim?.status === 'APPROVED' && release.athleteProfile.claimedByUserId === release.publishedByUserId && !release.athleteProfile.deletedAt && release.publishedByUser && !release.publishedByUser.suspendedAt && !release.publishedByUser.deletedAt ? 'ACTIVE' : 'INACTIVE'
    return { releaseId: id, publicationType: release.publicationType, platformAttestation, officialAtPublication, currentAuthority, withdrawalStatus: release.status === 'ARCHIVED' ? 'WITHDRAWN' : 'PUBLISHED', manifest: ['VALID', 'KEY_REVOKED'].includes(signatureStatus) ? manifest : null, manifestHash: release.manifestHash, signature: release.manifestSignature, keyId: release.signingKeyId, authorizationClaimId: release.authorizationClaimId, authorityRevokedAt: claim?.revokedAt ?? null, assetVerification: manifest ? 'DIGESTS_AT_PUBLICATION_NOT_RECHECKED' : 'UNAVAILABLE', disclaimer: 'Platform attestation of a release record; not a personal signature or independent verification of its facts.' }
  }

  async issue(id: string) {
    const issue = await db.cardIssue.findUnique({ where: { id }, include: { release: true } })
    if (!issue) throw { statusCode: 404, message: 'Issue not found' }
    const release = await this.release(issue.releaseId)
    const expected = createHash('sha256').update(JSON.stringify({ cardTemplateId: issue.releaseId, originHash: issue.release.originHash, issueNumber: issue.issueNumber, claimedByUserId: issue.claimedByUserId })).digest('hex')
    const bindingStatus = release.platformAttestation === 'UNSIGNED' ? 'UNVERIFIABLE_LEGACY' : expected === issue.issueHash && issue.issueNumber !== null && issue.issueNumber > 0 && issue.issueNumber <= issue.release.issuedCount && (issue.release.editionSize === null || issue.issueNumber <= issue.release.editionSize) ? 'LEDGER_MATCH' : 'INVALID'
    return { issueId: id, releaseId: issue.releaseId, issueNumber: issue.issueNumber, issueHash: issue.issueHash, status: issue.status, bindingStatus, release, disclaimer: 'Issue membership is checked against the platform ledger; the cryptographic signature covers the release manifest, not this individual issue or its current owner.' }
  }
}
