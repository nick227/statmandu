// Generated from openapi.yaml — fill in seeds and assertions.
// Run `pnpm test:generate` to add stubs for new routes.
import { describe, it, expect } from 'vitest'
import { buildTestApp, validateResponse } from './helpers'
import { db } from '@statman/db'

const app = buildTestApp()

describe('getFeed', () => {
  it('GET /feed returns items newest first with a working cursor', async () => {
    for (let i = 0; i < 3; i++) {
      await db.feedItem.create({
        data: {
          type: 'GAME_FINAL',
          targetType: 'GAME',
          targetId: `game-${i}`,
          summary: `Final ${i}`,
          occurredAt: new Date(Date.now() - i * 1000),
        },
      })
    }

    const first = await app.inject({ method: 'GET', url: '/feed?limit=2' })
    expect(first.statusCode).toBe(200)
    await validateResponse('getFeed', 200, first.json())
    expect(first.json().data).toHaveLength(2)
    expect(first.json().meta.hasMore).toBe(true)
    expect(first.json().data[0].summary).toBe('Final 0')

    const second = await app.inject({ method: 'GET', url: `/feed?limit=2&cursor=${first.json().meta.nextCursor}` })
    expect(second.json().data).toHaveLength(1)
    expect(second.json().meta.hasMore).toBe(false)
    expect(second.json().data[0].summary).toBe('Final 2')
  })
})
