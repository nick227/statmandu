import { describe, it, expect } from 'vitest'
import { db } from '@statman/db'
import { CardService } from '../services/CardService'
import { optionalUser } from '../lib/optionalUser'
import { storeImage } from '../lib/imageStorage'
import { ImageService } from '../services/ImageService'
import { asAuth, buildTestApp, testOtherUserId, testUserId, validateResponse } from './helpers'
import { cardGenerationExecutor } from '../jobs/GenerationExecutor'

const app = buildTestApp()
const cards = new CardService()
const actor = { id: testUserId, role: 'USER' as const }

async function person(name = 'Unknown Musician') {
  const response = await app.inject({ method: 'POST', url: '/people', headers: asAuth(testUserId), payload: { displayName: name } })
  expect(response.statusCode).toBe(201)
  await validateResponse('createPerson', 201, response.json())
  expect(response.json().data.claimedByUserId).toBeNull()
  return response.json().data
}
async function draft(subjectId: string) {
  const response = await app.inject({ method: 'POST', url: '/cards', headers: asAuth(testUserId), payload: { personProfileId: subjectId, title: 'First release', cardType: 'PROFILE', stylePreset: 'portrait', statsSnapshotJson: { achievement: 'First release' } } })
  expect(response.statusCode).toBe(201)
  return response.json().data
}
async function source(subjectId: string, userId = testUserId) {
  return new ImageService().upload(userId, false, { targetType: 'ATHLETE_PROFILE', targetId: subjectId, usage: 'GALLERY', contentType: 'image/png', fileBuffer: Buffer.from('fixture') })
}

describe('MR1/MR2 no-sports architectural proof', () => {
  it.each(['Musician', 'Actor', 'Custom geologist / driver'])('completes the community lifecycle for %s with no sports data', async name => {
    const subject = await person(name)
    const card = await draft(subject.id)
    await cards.generateCard(actor, card.id)
    const published = await cards.publishCard(actor, card.id)
    expect(published.publicationType).toBe('COMMUNITY')
    expect(published.publishedByUserId).toBe(testUserId)
    expect(published.person.displayName).toBe(name)
    const issued = await cards.claimCard(card.id, testOtherUserId)
    await cards.saveCard(testOtherUserId, card.id)
    const download = await cards.markCardDownloaded(issued.id, testOtherUserId)
    expect(download.authenticity.json.athleteName).toBe(name)
    expect((await cards.listCardsForUser(testOtherUserId)).claimed).toHaveLength(1)
    const shared = await app.inject({ method: 'GET', url: `/people/${subject.id}` })
    expect(shared.json().data.canonicalUrl).toContain(`/people/${subject.id}`)
    const search = await app.inject({ method: 'GET', url: `/people?q=${encodeURIComponent(name)}` })
    expect(search.json().data.map((p: any) => p.id)).toContain(subject.id)
    const publicCards = await app.inject({ method: 'GET', url: `/people/${subject.id}/cards` })
    expect(publicCards.json().data.map((c: any) => c.id)).toContain(card.id)
    for (const count of await Promise.all([db.player.count(), db.sport.count(), db.team.count(), db.game.count(), db.season.count()])) expect(count).toBe(0)
  })

  it('preserves publication snapshots after profile edits and later claims', async () => {
    const subject = await person()
    const card = await draft(subject.id)
    const published = await cards.publishCard(actor, card.id)
    const issue = await cards.claimCard(card.id, testOtherUserId)
    await db.personProfile.update({ where: { id: subject.id }, data: { displayName: 'Changed', claimedByUserId: testOtherUserId } })
    const again = await cards.getCard(card.id)
    expect(again.person.displayName).toBe('Unknown Musician')
    expect(again.originHash).toBe(published.originHash)
    expect(again.publicationType).toBe('COMMUNITY')
    expect((await cards.markCardDownloaded(issue.id, testOtherUserId)).authenticity.json.athleteName).toBe('Unknown Musician')
    await expect(cards.publishCard({ id: testOtherUserId, role: 'USER' }, card.id, { publicationType: 'OFFICIAL' })).rejects.toMatchObject({ statusCode: 403 })
    await expect(cards.updateDraftCard(actor, card.id, { title: 'Rewrite' })).rejects.toMatchObject({ statusCode: 409 })
  })

  it('serializes concurrent issuance without exceeding a limited edition', async () => {
    const subject = await person()
    const card = await draft(subject.id)
    await cards.publishCard(actor, card.id, { editionMode: 'LIMITED', editionSize: 2 })
    const results = await Promise.allSettled(Array.from({ length: 6 }, () => cards.claimCard(card.id, testOtherUserId)))
    expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(2)
    const issues = await db.cardIssue.findMany({ where: { releaseId: card.id }, orderBy: { issueNumber: 'asc' } })
    expect(issues.map(i => i.issueNumber)).toEqual([1, 2])
    expect((await db.cardRelease.findUniqueOrThrow({ where: { id: card.id } })).issuedCount).toBe(2)
  })

  it('deduplicates concurrent batch retries and isolates creator keys and sources', async () => {
    const subject = await person()
    const image = await source(subject.id)
    const input = { sourceImageAssetId: image.id, batchRequestId: 'same-key' }
    const [a, b] = await Promise.all([cards.generateBatch(actor, subject.id, input), cards.generateBatch(actor, subject.id, input)])
    expect(a.map(c => c.id)).toEqual(b.map(c => c.id))
    await cardGenerationExecutor.drain()
    expect(await db.cardGenerationJob.count()).toBe(1)
    await expect(cards.generateBatch({ id: testOtherUserId, role: 'USER' }, subject.id, input)).rejects.toMatchObject({ statusCode: 403 })
    const ownImage = await source(subject.id, testOtherUserId)
    const other = await cards.generateBatch({ id: testOtherUserId, role: 'USER' }, subject.id, { ...input, sourceImageAssetId: ownImage.id })
    expect(other[0]!.id).not.toBe(a[0]!.id)
    await cardGenerationExecutor.drain()
    expect(await db.cardGenerationJob.count()).toBe(2)
  })

  it('uses a neutral portrait for people with an unregistered sport', async () => {
    const subject = await person('Climber and musician')
    const sport = await db.sport.create({ data: { slug: 'climbing', name: 'Climbing' } })
    await db.player.create({ data: { athleteProfileId: subject.id, sportId: sport.id } })
    const image = await source(subject.id)
    await expect(cards.generateBatch(actor, subject.id, { sourceImageAssetId: image.id, poseIds: ['unknown-pose'] })).rejects.toMatchObject({ statusCode: 400 })
    const batch = await cards.generateBatch(actor, subject.id, { sourceImageAssetId: image.id })
    expect(batch).toHaveLength(1)
    expect(batch[0]!.title).toBe('Portrait')
    await cardGenerationExecutor.drain()
    expect((await cards.getCard(batch[0]!.id, actor.id)).status).toBe('READY')
    expect(await db.player.count()).toBe(1)
  })

  it('keeps uploaded source images private in listings and direct serving', async () => {
    const subject = await person()
    const image = await source(subject.id)
    expect((await new ImageService().list('ATHLETE_PROFILE', subject.id))).toEqual([])
    expect((await new ImageService().list('ATHLETE_PROFILE', subject.id, undefined, testOtherUserId))).toEqual([])
    expect((await new ImageService().list('ATHLETE_PROFILE', subject.id, undefined, testUserId))).toHaveLength(1)
    const denied = await app.inject({ method: 'GET', url: `/uploads/images/${image.objectKey}`, headers: asAuth(testOtherUserId) })
    expect(denied.statusCode).toBe(404)
    const allowed = await app.inject({ method: 'GET', url: `/uploads/images/${image.objectKey}`, headers: asAuth(testUserId) })
    expect(allowed.statusCode).toBe(200)
  })

  it('fails closed when private R2 storage is not configured', async () => {
    const previous = process.env.IMAGE_STORAGE_DRIVER
    const previousBucket = process.env.R2_PRIVATE_BUCKET
    process.env.IMAGE_STORAGE_DRIVER = 'r2'
    delete process.env.R2_PRIVATE_BUCKET
    try {
      await expect(storeImage({ private: true, targetType: 'ATHLETE_PROFILE', targetId: 'person', usage: 'GALLERY', buffer: Buffer.from('private'), contentType: 'image/png' })).rejects.toMatchObject({ statusCode: 503 })
    } finally {
      if (previous === undefined) delete process.env.IMAGE_STORAGE_DRIVER
      else process.env.IMAGE_STORAGE_DRIVER = previous
      if (previousBucket === undefined) delete process.env.R2_PRIVATE_BUCKET
      else process.env.R2_PRIVATE_BUCKET = previousBucket
    }
  })

  it('withdrawal preserves origin and blocks further issuance or regeneration', async () => {
    const subject = await person()
    const draftCard = await draft(subject.id)
    const published = await cards.publishCard(actor, draftCard.id)
    const issue = await cards.claimCard(published.id, testOtherUserId)
    const withdrawn = await cards.updateDraftCard(actor, published.id, { status: 'ARCHIVED' })
    expect(withdrawn.originHash).toBe(published.originHash)
    expect(withdrawn.contentSnapshotJson).toEqual(published.contentSnapshotJson)
    expect((await db.cardIssue.findUniqueOrThrow({ where: { id: issue.id } })).issueHash).toBe(issue.issueHash)
    await expect(cards.claimCard(published.id, testOtherUserId)).rejects.toMatchObject({ statusCode: 409 })
    await expect(cards.generateCard(actor, published.id)).rejects.toMatchObject({ statusCode: 409 })
  })

  it('requires actual sessions on optional-auth routes and rejects suspended accounts', async () => {
    expect(await optionalUser({ headers: { authorization: `Bearer ${testUserId}` } })).toBeNull()
    await db.session.create({ data: { userId: testUserId, token: 'real-session', expiresAt: new Date(Date.now() + 60000) } })
    expect((await optionalUser({ headers: { authorization: 'Bearer real-session' } }))?.id).toBe(testUserId)
    await db.user.update({ where: { id: testUserId }, data: { suspendedAt: new Date() } })
    expect(await optionalUser({ headers: { authorization: 'Bearer real-session' } })).toBeNull()
    const subject = await db.personProfile.create({ data: { slug: 'subject', displayName: 'Subject' } })
    await expect(cards.createDraftCard(testUserId, { personProfileId: subject.id, title: 'Blocked', cardType: 'PROFILE', stylePreset: 'portrait' })).rejects.toMatchObject({ statusCode: 403 })
  })

  it('normalizes person targets so legacy and general follows share one record', async () => {
    const subject = await person()
    for (const targetType of ['PERSON_PROFILE', 'ATHLETE_PROFILE']) {
      const response = await app.inject({ method: 'POST', url: '/follows', headers: asAuth(testUserId), payload: { targetType, targetId: subject.id } })
      expect([200, 201]).toContain(response.statusCode)
    }
    expect(await db.follow.count()).toBe(1)
  })

  it('allows an existing controller to seek actual verification without a player', async () => {
    const subject = await person()
    await db.personProfile.update({ where: { id: subject.id }, data: { claimedByUserId: testUserId } })
    const response = await app.inject({ method: 'POST', url: `/people/${subject.id}/claim`, headers: asAuth(testUserId), payload: { verificationNote: 'Review evidence' } })
    expect(response.statusCode).toBe(201)
    expect(response.json().data.status).toBe('PENDING')
    const capabilities = await app.inject({ method: 'GET', url: '/auth/me/capabilities', headers: asAuth(testUserId) })
    expect(capabilities.json().data.personProfile.id).toBe(subject.id)
    expect(capabilities.json().data.athleteProfiles).toEqual([])
  })

  it('records the actual publisher independently of creator and preserves unknown legacy publishers', async () => {
    const subject = await person()
    const card = await draft(subject.id)
    await db.user.update({ where: { id: testOtherUserId }, data: { role: 'ADMIN' } })
    const published = await cards.publishCard({ id: testOtherUserId, role: 'ADMIN' }, card.id)
    expect(published.createdByUserId).toBe(testUserId)
    expect(published.publishedByUserId).toBe(testOtherUserId)
    const legacy = await db.cardRelease.create({ data: { athleteProfileId: subject.id, createdByUserId: testUserId, title: 'Legacy', cardType: 'PROFILE', stylePreset: 'portrait', statsSnapshotJson: {}, originHash: 'old-hash', publishedAt: new Date(), status: 'PUBLISHED', visibility: 'PUBLIC' } })
    expect((await cards.getCard(legacy.id)).publishedByUserId).toBeNull()
    expect((await cards.getCard(legacy.id)).originHash).toBe('old-hash')
  })
})
