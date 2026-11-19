import { describe, it, expect, vi } from 'vitest'
import { createHash, createPublicKey, generateKeyPairSync, verify } from 'node:crypto'
import { db } from '@statman/db'
import { CardService } from '../services/CardService'
import { ClaimService } from '../services/ClaimService'
import { AuthenticityService } from '../services/AuthenticityService'
import { canonicalManifest, MANIFEST_DOMAIN } from '../services/ReleaseSigning'
import * as authority from '../services/PublishingAuthority'
import { asAuth, buildTestApp, testUserId, testOtherUserId, validateResponse } from './helpers'
const app = buildTestApp()
const cards = new CardService()
const claims = new ClaimService()
const inspections = new AuthenticityService()
const actor = { id: testUserId, role: 'USER' as const }
async function setup() {
  await db.user.update({ where: { id: testOtherUserId }, data: { role: 'ADMIN' } })
  const person = await db.personProfile.create({ data: { slug: 'creator', displayName: 'Musician', createdByUserId: testUserId } })
  const draft = await cards.createDraftCard(testUserId, { personProfileId: person.id, title: 'Debut', cardType: 'PROFILE', stylePreset: 'classic', editionMode: 'LIMITED', editionSize: 2 })
  const claim = await claims.claimPerson(person.id, testUserId, 'private review material')
  return { person, draft, claim }
}
async function approve(claimId: string) { return claims.reviewClaim(testOtherUserId, claimId, { status: 'APPROVED' }) }
const official = (id: string) => cards.publishCard(actor, id, { publicationType: 'OFFICIAL' })

describe('Official publishing and platform attestations', () => {
  it('requires a reviewed grant, signs a canonical manifest, and verifies release and issue separately', async () => {
    const { person, draft, claim } = await setup()
    await expect(official(draft.id)).rejects.toMatchObject({ statusCode: 403 })
    await db.personProfile.update({ where: { id: person.id }, data: { claimedByUserId: testUserId } })
    await expect(official(draft.id)).rejects.toMatchObject({ statusCode: 403 })
    await approve(claim.id)
    const state = await app.inject({ method: 'GET', url: `/people/${person.id}/publishing-authority`, headers: asAuth(testUserId) })
    expect(state.json().data.canPublishOfficial).toBe(true)
    await validateResponse('getPublishingAuthority', 200, state.json())
    await cards.generateCard(actor, draft.id)
    const response = await app.inject({ method: 'POST', url: `/releases/${draft.id}/publish`, headers: asAuth(testUserId), payload: { publicationType: 'OFFICIAL' } })
    expect(response.statusCode, response.body).toBe(200)
    const record = await db.cardRelease.findUniqueOrThrow({ where: { id: draft.id } })
    const manifest = record.manifestJson as any
    expect(manifest.authorization.claimId).toBe(claim.id)
    expect(JSON.stringify(manifest)).not.toContain('private review material')
    expect(manifest.assets[0].sha256).toMatch(/^[0-9a-f]{64}$/)
    const ring = JSON.parse(process.env.RARE_SIGNING_KEYS_JSON!)
    expect(verify(null, Buffer.from(MANIFEST_DOMAIN + canonicalManifest(manifest)), createPublicKey(ring.keys[0].publicKeyPem), Buffer.from(record.manifestSignature!, 'base64'))).toBe(true)
    const inspected = await app.inject({ method: 'GET', url: `/releases/${draft.id}/authenticity` })
    expect(inspected.statusCode, inspected.body).toBe(200)
    await validateResponse('inspectReleaseAuthenticity', 200, inspected.json())
    expect(inspected.json().data).toMatchObject({ platformAttestation: 'VALID', officialAtPublication: 'VERIFIED', currentAuthority: 'ACTIVE' })
    const issue = await cards.claimCard(draft.id, testUserId)
    const issueResponse = await app.inject({ method: 'GET', url: `/card-issues/${issue.id}/authenticity` })
    expect(issueResponse.json().data.bindingStatus).toBe('LEDGER_MATCH')
    await validateResponse('inspectIssueAuthenticity', 200, issueResponse.json())
    const originalIssue = await db.cardIssue.findUniqueOrThrow({ where: { id: issue.id } })
    await claims.revokeClaim(testUserId, claim.id, 'Account owner withdrew authority')
    const revoked = await inspections.release(draft.id)
    expect(revoked).toMatchObject({ platformAttestation: 'VALID', officialAtPublication: 'VERIFIED', currentAuthority: 'REVOKED', withdrawalStatus: 'PUBLISHED' })
    const after = await db.cardRelease.findUniqueOrThrow({ where: { id: draft.id } })
    expect(after).toEqual(record)
    expect(await db.cardIssue.findUnique({ where: { id: issue.id } })).toEqual(originalIssue)
    await cards.updateDraftCard(actor, draft.id, { status: 'ARCHIVED' })
    expect(await inspections.release(draft.id)).toMatchObject({ platformAttestation: 'VALID', officialAtPublication: 'VERIFIED', withdrawalStatus: 'WITHDRAWN' })
    expect((await inspections.issue(issue.id)).bindingStatus).toBe('LEDGER_MATCH')
  })

  it('does not upgrade historical approvals, and rejected or revoked claims cannot publish', async () => {
    const { person, draft, claim } = await setup()
    await db.claim.update({ where: { id: claim.id }, data: { status: 'APPROVED', reviewedByUserId: testOtherUserId, reviewedAt: new Date() } })
    await db.personProfile.update({ where: { id: person.id }, data: { claimedByUserId: testUserId } })
    await expect(official(draft.id)).rejects.toMatchObject({ statusCode: 403 })
    await approve(claim.id) // Explicit revalidation, preserving original review metadata.
    await claims.revokeClaim(testOtherUserId, claim.id, 'Review withdrawn')
    await expect(official(draft.id)).rejects.toMatchObject({ statusCode: 403 })
    await expect(approve(claim.id)).rejects.toMatchObject({ statusCode: 409 })
    const next = await claims.claimPerson(person.id, testUserId)
    await claims.reviewClaim(testOtherUserId, next.id, { status: 'REJECTED' })
    await expect(official(draft.id)).rejects.toMatchObject({ statusCode: 403 })
  })

  it('keeps subject control separate from creator privacy and denies unauthorized revocation', async () => {
    const { person, claim } = await setup()
    await approve(claim.id)
    const other = await cards.createDraftCard(testOtherUserId, { personProfileId: person.id, title: 'Other private card', cardType: 'PROFILE', stylePreset: 'classic' })
    await expect(cards.getCard(other.id, testUserId)).rejects.toMatchObject({ statusCode: 404 })
    await expect(official(other.id)).rejects.toMatchObject({ statusCode: 403 })
    await db.user.update({ where: { id: testOtherUserId }, data: { role: 'USER' } })
    const revoked = await app.inject({ method: 'POST', url: `/claims/${claim.id}/revoke`, headers: asAuth(testOtherUserId), payload: { reason: 'Not mine' } })
    expect(revoked.statusCode).toBe(403)
    expect((await app.inject({ method: 'GET', url: `/releases/${other.id}/authenticity` })).statusCode).toBe(404)
    const result = await app.inject({ method: 'POST', url: `/claims/${claim.id}/revoke`, headers: asAuth(testUserId), payload: { reason: 'Withdraw' } })
    expect(result.statusCode, result.body).toBe(200)
    await validateResponse('revokeClaim', 200, result.json())
  })

  it('reports tampering, missing signatures, unsigned history and unavailable/revoked keys distinctly', async () => {
    const { draft } = await setup()
    await cards.publishCard(actor, draft.id)
    const original = await db.cardRelease.findUniqueOrThrow({ where: { id: draft.id } })
    expect(await inspections.release(draft.id)).toMatchObject({ platformAttestation: 'VALID', officialAtPublication: 'NOT_APPLICABLE', publicationType: 'COMMUNITY' })
    await db.cardRelease.update({ where: { id: draft.id }, data: { editionSize: 9 } })
    expect((await inspections.release(draft.id)).platformAttestation).toBe('INVALID')
    await db.cardRelease.update({ where: { id: draft.id }, data: { editionSize: 2, manifestSignature: null } })
    expect((await inspections.release(draft.id)).platformAttestation).toBe('MISSING_EVIDENCE')
    await db.cardRelease.update({ where: { id: draft.id }, data: { manifestSignature: original.manifestSignature } })
    const ring = JSON.parse(process.env.RARE_SIGNING_KEYS_JSON!)
    const newKey = generateKeyPairSync('ed25519')
    ring.keys[0].privateKeyPem = undefined
    ring.keys.push({ id: 'rotated', publicKeyPem: newKey.publicKey.export({ type: 'spki', format: 'pem' }), privateKeyPem: newKey.privateKey.export({ type: 'pkcs8', format: 'pem' }) })
    ring.activeKeyId = 'rotated'
    process.env.RARE_SIGNING_KEYS_JSON = JSON.stringify(ring)
    expect((await inspections.release(draft.id)).platformAttestation).toBe('VALID')
    ring.keys[0].revokedAt = new Date().toISOString()
    process.env.RARE_SIGNING_KEYS_JSON = JSON.stringify(ring)
    expect((await inspections.release(draft.id)).platformAttestation).toBe('KEY_REVOKED')
    delete process.env.RARE_SIGNING_KEYS_JSON
    expect((await inspections.release(draft.id)).platformAttestation).toBe('KEY_UNAVAILABLE')
    await db.cardRelease.update({ where: { id: draft.id }, data: { attestationVersion: null, manifestJson: (await import('@prisma/client')).Prisma.DbNull, manifestHash: null, manifestSignature: null, signingKeyId: null } })
    expect((await inspections.release(draft.id)).platformAttestation).toBe('UNSIGNED')
    expect((await db.cardRelease.findUniqueOrThrow({ where: { id: draft.id } })).originHash).toBe(original.originHash)
  })

  it('fails closed without managed keys and never allows admin self-approval', async () => {
    const { draft, claim } = await setup()
    delete process.env.RARE_SIGNING_KEYS_JSON
    await expect(cards.publishCard(actor, draft.id)).rejects.toMatchObject({ statusCode: 503 })
    expect((await db.cardRelease.findUniqueOrThrow({ where: { id: draft.id } })).publishedAt).toBeNull()
    await db.user.update({ where: { id: testUserId }, data: { role: 'ADMIN' } })
    await expect(claims.reviewClaim(testUserId, claim.id, { status: 'APPROVED' })).rejects.toMatchObject({ statusCode: 403 })
  })

  for (const first of ['publication', 'revocation'] as const) it(`serializes a real publication/revocation race when ${first} acquires the person lock first`, async () => {
    const { person, draft, claim } = await setup()
    await approve(claim.id)
    let acquired!: () => void, resume!: () => void
    const locked = new Promise<void>(resolve => { acquired = resolve })
    const gate = new Promise<void>(resolve => { resume = resolve })
    const original = authority.lockPerson
    const spy = vi.spyOn(authority, 'lockPerson').mockImplementationOnce(async (tx, id) => {
      const person = await original(tx, id)
      acquired()
      await gate
      return person
    })
    const publish = () => official(draft.id)
    const revoke = () => claims.revokeClaim(testOtherUserId, claim.id, 'Concurrent revocation')
    try {
      const winner = (first === 'publication' ? publish() : revoke()).then(value => ({ value }), error => ({ error }))
      await locked
      const follower = (first === 'publication' ? revoke() : publish()).then(value => ({ value }), error => ({ error }))
      resume()
      const results = await Promise.all([winner, follower])
      expect(results[0]).toHaveProperty('value')
      if (first === 'publication') {
        expect(results[1]).toHaveProperty('value')
        expect(await inspections.release(draft.id)).toMatchObject({ officialAtPublication: 'VERIFIED', currentAuthority: 'REVOKED' })
      } else {
        expect(results[1]).toMatchObject({ error: { statusCode: 403 } })
        expect((await db.cardRelease.findUniqueOrThrow({ where: { id: draft.id } })).publishedAt).toBeNull()
      }
      expect((await authority.publishingAuthorityState(person.id, testUserId)).canPublishOfficial).toBe(false)
    } finally { resume(); spy.mockRestore() }
  })
})
