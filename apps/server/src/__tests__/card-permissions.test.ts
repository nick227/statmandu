import { describe, it, expect } from 'vitest'
import { db } from '@statman/db'
import { CardService } from '../services/CardService'
import { asAuth, buildTestApp, testOtherUserId, testUserId } from './helpers'

const app = buildTestApp()
const service = new CardService()

describe('community card isolation', () => {
  it('subject control grants neither private access nor card mutation', async () => {
    const person = await db.personProfile.create({ data: { slug: 'subject', firstName: 'Subject', lastName: 'Person', claimedByUserId: testOtherUserId } })
    const card = await service.createDraftCard(testUserId, { athleteProfileId: person.id, title: 'Private', cardType: 'PROFILE', stylePreset: 'portrait' })
    const subject = { id: testOtherUserId, role: 'USER' as const }
    await expect(service.getCard(card.id, subject.id)).rejects.toMatchObject({ statusCode: 404 })
    expect(await service.listCardsForAthlete(person.id, subject.id)).toEqual([])
    await expect(service.updateDraftCard(subject, card.id, { title: 'Hijacked' })).rejects.toMatchObject({ statusCode: 403 })
    await expect(service.publishCard(subject, card.id)).rejects.toMatchObject({ statusCode: 403 })
    await expect(service.generateCard(subject, card.id)).rejects.toMatchObject({ statusCode: 403 })
    expect((await service.getDistribution(subject, person.id)).totalDownloads).toBe(0)
    const asset = await db.imageAsset.create({ data: { targetType: 'CARD_TEMPLATE', targetId: card.id, usage: 'GALLERY', storageProvider: 'LOCAL', objectKey: 'private-test.png', url: '/uploads/images/private-test.png', contentType: 'image/png', byteSize: 1 } })
    const response = await app.inject({ method: 'GET', url: `/uploads/images/${asset.objectKey}`, headers: asAuth(subject.id) })
    expect(response.statusCode).toBe(404)
  })

  it('cannot bypass publication via generic patch or rewrite a publication', async () => {
    const person = await db.personProfile.create({ data: { slug: 'subject', firstName: 'Subject', lastName: 'Person' } })
    const card = await service.createDraftCard(testUserId, { athleteProfileId: person.id, title: 'Original', cardType: 'PROFILE', stylePreset: 'portrait' })
    const actor = { id: testUserId, role: 'USER' as const }
    await expect(service.updateDraftCard(actor, card.id, { status: 'PUBLISHED' })).rejects.toMatchObject({ statusCode: 400 })
    await expect(service.updateDraftCard(actor, card.id, { visibility: 'PUBLIC' })).rejects.toMatchObject({ statusCode: 400 })
    await service.publishCard(actor, card.id)
    await expect(service.updateDraftCard(actor, card.id, { title: 'Rewrite' })).rejects.toMatchObject({ statusCode: 409 })
  })
})
