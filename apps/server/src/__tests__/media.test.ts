// Generated from openapi.yaml — fill in seeds and assertions.
// Run `pnpm test:generate` to add stubs for new routes.
import { describe, it, expect } from 'vitest'
import { buildTestApp, asAuth, validateResponse, testUserId } from './helpers'
import { db } from '@statman/db'

process.env.IMAGE_STORAGE_DIR = '/tmp/statman-test-images'

const app = buildTestApp()

async function seedPlayer() {
  const sport = await db.sport.create({ data: { slug: 'basketball', name: 'Basketball' } })
  const athleteProfile = await db.athleteProfile.create({
    data: { slug: 'jayden-rios', firstName: 'Jayden', lastName: 'Rios', sourceStatus: 'PLAYER_REPORTED' },
  })
  return db.player.create({ data: { athleteProfileId: athleteProfile.id, sportId: sport.id } })
}

describe('listMedia', () => {
  it('GET /media', async () => {
    const player = await seedPlayer()
    await db.mediaAsset.create({
      data: { type: 'YOUTUBE', youtubeVideoId: 'dQw4w9WgXcQ', targetType: 'PLAYER', targetId: player.id },
    })

    const res = await app.inject({ method: 'GET', url: `/media?targetType=PLAYER&targetId=${player.id}` })
    expect(res.statusCode).toBe(200)
    await validateResponse('listMedia', 200, res.json())
    expect(res.json().data).toHaveLength(1)
  })
})

describe('listRecentMedia', () => {
  it('GET /media/recent', async () => {
    const player = await seedPlayer()
    await db.mediaAsset.create({
      data: { type: 'YOUTUBE', youtubeVideoId: 'dQw4w9WgXcQ', targetType: 'PLAYER', targetId: player.id },
    })

    const res = await app.inject({ method: 'GET', url: '/media/recent?limit=5' })
    expect(res.statusCode).toBe(200)
    await validateResponse('listRecentMedia', 200, res.json())
    expect(res.json().data.length).toBeGreaterThanOrEqual(1)
  })
})

describe('attachYouTubeMedia', () => {
  it('requires auth', async () => {
    const res = await app.inject({ method: 'POST', url: '/media/youtube' })
    expect(res.statusCode).toBe(401)
  })

  it('parses a video id from a youtu.be link and records a feed item', async () => {
    const player = await seedPlayer()

    const res = await app.inject({
      method: 'POST',
      url: '/media/youtube',
      headers: asAuth(testUserId),
      payload: { targetType: 'PLAYER', targetId: player.id, youtubeUrl: 'https://youtu.be/dQw4w9WgXcQ', title: 'Highlight' },
    })
    expect(res.statusCode).toBe(201)
    await validateResponse('attachYouTubeMedia', 201, res.json())
    expect(res.json().data.youtubeVideoId).toBe('dQw4w9WgXcQ')

    const feedItems = await db.feedItem.findMany({ where: { targetType: 'PLAYER', targetId: player.id } })
    expect(feedItems).toHaveLength(1)
    expect(feedItems[0]?.type).toBe('MEDIA_ADDED')
  })

  it('rejects a URL with no parseable video id', async () => {
    const player = await seedPlayer()

    const res = await app.inject({
      method: 'POST',
      url: '/media/youtube',
      headers: asAuth(testUserId),
      payload: { targetType: 'PLAYER', targetId: player.id, youtubeUrl: 'https://example.com/not-youtube' },
    })
    expect(res.statusCode).toBe(400)
  })

  it('rejects media for an unknown target', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/media/youtube',
      headers: asAuth(testUserId),
      payload: {
        targetType: 'PLAYER',
        targetId: 'missing-player',
        youtubeUrl: 'https://youtu.be/dQw4w9WgXcQ',
      },
    })
    expect(res.statusCode).toBe(404)
  })
})

describe('images', () => {
  it('requires auth to upload', async () => {
    const res = await app.inject({ method: 'POST', url: '/images/upload' })
    expect(res.statusCode).toBe(401)
  })

  it('uploads an athlete avatar and updates the profile image', async () => {
    const player = await seedPlayer()
    await db.athleteProfile.update({
      where: { id: player.athleteProfileId },
      data: { claimedByUserId: testUserId },
    })

    const res = await app.inject({
      method: 'POST',
      url: '/images/upload',
      headers: asAuth(testUserId),
      payload: {
        targetType: 'PLAYER',
        targetId: player.id,
        usage: 'AVATAR',
        contentType: 'image/png',
        dataBase64: Buffer.from('png-data').toString('base64'),
        originalFilename: 'avatar.png',
        width: 1,
        height: 1,
      },
    })

    expect(res.statusCode).toBe(201)
    await validateResponse('uploadImage', 201, res.json())
    expect(res.json().data.storageProvider).toBe('LOCAL')
    expect(res.json().data.objectKey).toContain(`/avatar/`)

    const profile = await db.athleteProfile.findUniqueOrThrow({ where: { id: player.athleteProfileId } })
    expect(profile.avatarUrl).toBe(res.json().data.url)
  })

  it('forbids avatar uploads from a non-owner', async () => {
    const player = await seedPlayer()

    const res = await app.inject({
      method: 'POST',
      url: '/images/upload',
      headers: asAuth(testUserId),
      payload: {
        targetType: 'PLAYER',
        targetId: player.id,
        usage: 'AVATAR',
        contentType: 'image/png',
        dataBase64: Buffer.from('png-data').toString('base64'),
      },
    })

    expect(res.statusCode).toBe(403)
  })

  it('lists stored images for a target and usage', async () => {
    const player = await seedPlayer()
    await db.imageAsset.create({
      data: {
        targetType: 'PLAYER',
        targetId: player.id,
        usage: 'EVIDENCE',
        storageProvider: 'LOCAL',
        objectKey: `player/${player.id}/evidence/test.png`,
        url: `http://localhost:3001/uploads/images/player/${player.id}/evidence/test.png`,
        contentType: 'image/png',
        byteSize: 8,
        uploadedByUserId: testUserId,
      },
    })

    const res = await app.inject({ method: 'GET', url: `/images?targetType=PLAYER&targetId=${player.id}&usage=EVIDENCE` })
    expect(res.statusCode).toBe(200)
    await validateResponse('listImages', 200, res.json())
    expect(res.json().data).toHaveLength(1)
    expect(res.json().data[0].usage).toBe('EVIDENCE')
  })
})
