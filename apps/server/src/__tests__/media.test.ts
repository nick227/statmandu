// Generated from openapi.yaml — fill in seeds and assertions.
// Run `pnpm test:generate` to add stubs for new routes.
import { describe, it, expect } from 'vitest'
import { buildTestApp, asAuth, validateResponse, testUserId } from './helpers'
import { db } from '@statman/db'

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
