import { describe, it, expect } from 'vitest'
import { db } from '@statman/db'
import { asAuth, buildTestApp, testOtherUserId, testUserId, validateResponse } from './helpers'

const app = buildTestApp()

async function seedAthlete(claimedByUserId: string | null = testUserId) {
  const sport = await db.sport.create({ data: { slug: `basketball-${Date.now()}`, name: 'Basketball' } })
  const athleteProfile = await db.athleteProfile.create({
    data: {
      slug: `jayden-rios-${Date.now()}`,
      firstName: 'Jayden',
      lastName: 'Rios',
      sourceStatus: 'PLAYER_REPORTED',
      claimedByUserId,
    },
  })
  await db.player.create({ data: { athleteProfileId: athleteProfile.id, sportId: sport.id } })
  return athleteProfile
}

async function createReadyCard(editionMode: 'UNLIMITED' | 'LIMITED' | 'ONE_OF_ONE' = 'UNLIMITED', editionSize?: number) {
  const athlete = await seedAthlete()
  const created = await app.inject({
    method: 'POST',
    url: '/cards',
    headers: asAuth(testUserId),
    payload: {
      athleteProfileId: athlete.id,
      title: 'Rising Star',
      cardType: 'PROFILE',
      stylePreset: 'classic-foil',
      editionMode,
      ...(editionSize ? { editionSize } : {}),
      statsSnapshotJson: { points: 24, rebounds: 8 },
    },
  })
  expect(created.statusCode).toBe(201)

  const generated = await app.inject({
    method: 'POST',
    url: `/cards/${created.json().data.id}/generate`,
    headers: asAuth(testUserId),
  })
  expect(generated.statusCode).toBe(200)
  return generated.json().data
}

describe('cards', () => {
  it('creates, generates, publishes, claims, and marks a card downloaded', async () => {
    const ready = await createReadyCard()
    expect(ready.status).toBe('READY')
    expect(ready.frontImageAssetId).toBeTruthy()

    const published = await app.inject({
      method: 'POST',
      url: `/cards/${ready.id}/publish`,
      headers: asAuth(testUserId),
      payload: {},
    })
    expect(published.statusCode).toBe(200)
    await validateResponse('publishCard', 200, published.json())
    expect(published.json().data.status).toBe('PUBLISHED')
    expect(published.json().data.originHash).toMatch(/^[a-f0-9]{64}$/)

    const recent = await app.inject({ method: 'GET', url: '/cards/recent' })
    expect(recent.statusCode).toBe(200)
    await validateResponse('listRecentPublicCards', 200, recent.json())
    expect(recent.json().data[0].id).toBe(ready.id)

    const claimed = await app.inject({
      method: 'POST',
      url: `/cards/${ready.id}/claim`,
      headers: asAuth(testOtherUserId),
    })
    expect(claimed.statusCode).toBe(201)
    await validateResponse('claimCard', 201, claimed.json())
    expect(claimed.json().data.issueNumber).toBe(1)
    expect(claimed.json().data.issueHash).toMatch(/^[a-f0-9]{64}$/)

    const mine = await app.inject({ method: 'GET', url: '/me/cards', headers: asAuth(testOtherUserId) })
    expect(mine.statusCode).toBe(200)
    await validateResponse('listMyCards', 200, mine.json())
    expect(mine.json().data[0].card.id).toBe(ready.id)

    const downloaded = await app.inject({
      method: 'POST',
      url: `/card-issues/${claimed.json().data.id}/downloaded`,
      headers: asAuth(testOtherUserId),
    })
    expect(downloaded.statusCode).toBe(200)
    await validateResponse('markCardDownloaded', 200, downloaded.json())
    expect(downloaded.json().data.status).toBe('DOWNLOADED')
    expect(downloaded.json().data.downloadedAt).toBeTruthy()
  })

  it('enforces limited edition size', async () => {
    const ready = await createReadyCard('LIMITED', 1)
    await app.inject({
      method: 'POST',
      url: `/cards/${ready.id}/publish`,
      headers: asAuth(testUserId),
      payload: {},
    })

    const first = await app.inject({ method: 'POST', url: `/cards/${ready.id}/claim`, headers: asAuth(testUserId) })
    expect(first.statusCode).toBe(201)

    const second = await app.inject({ method: 'POST', url: `/cards/${ready.id}/claim`, headers: asAuth(testOtherUserId) })
    expect(second.statusCode).toBe(409)
  })

  it('keeps published edition fields immutable', async () => {
    const ready = await createReadyCard()
    await app.inject({
      method: 'POST',
      url: `/cards/${ready.id}/publish`,
      headers: asAuth(testUserId),
      payload: {},
    })

    const res = await app.inject({
      method: 'PATCH',
      url: `/cards/${ready.id}`,
      headers: asAuth(testUserId),
      payload: { editionMode: 'LIMITED', editionSize: 10 },
    })
    expect(res.statusCode).toBe(409)

    const republish = await app.inject({
      method: 'POST',
      url: `/cards/${ready.id}/publish`,
      headers: asAuth(testUserId),
      payload: { editionMode: 'LIMITED', editionSize: 10 },
    })
    expect(republish.statusCode).toBe(409)
  })

  it('requires login to create or claim cards', async () => {
    const athlete = await seedAthlete()
    const create = await app.inject({
      method: 'POST',
      url: '/cards',
      payload: { athleteProfileId: athlete.id, title: 'No Auth', cardType: 'PROFILE', stylePreset: 'classic' },
    })
    expect(create.statusCode).toBe(401)
  })
})
