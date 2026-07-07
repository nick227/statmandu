// Generated from openapi.yaml — fill in seeds and assertions.
// Run `pnpm test:generate` to add stubs for new routes.
import { describe, it, expect } from 'vitest'
import { buildTestApp, validateResponse } from './helpers'
import { db } from '@statman/db'

const app = buildTestApp()

describe('listSports', () => {
  it('GET /sports', async () => {
    await db.sport.create({ data: { slug: 'basketball', name: 'Basketball' } })

    const res = await app.inject({ method: 'GET', url: '/sports' })
    expect(res.statusCode).toBe(200)
    await validateResponse('listSports', 200, res.json())
    expect(res.json().data.some((s: any) => s.slug === 'basketball')).toBe(true)
  })
})
