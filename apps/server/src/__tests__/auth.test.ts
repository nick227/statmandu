// Generated from openapi.yaml — fill in seeds and assertions.
// Run `pnpm test:generate` to add stubs for new routes.
// Both test users are pre-seeded: use testOtherUserId for cross-user permission tests.
import { describe, it, expect } from 'vitest'
import bcrypt from 'bcryptjs'
import { buildTestApp, asAuth, validateResponse, testUserId, testOtherUserId } from './helpers'
import { db } from '@statman/db'

const app = buildTestApp()

describe('register', () => {
  it('POST /auth/register', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'newuser@example.com',
        password: 'password123',
        username: 'newuser',
        displayName: 'New User',
      },
    })
    expect(res.statusCode).toBe(201)
    await validateResponse('register', 201, res.json())
    expect(res.json().data.email).toBe('newuser@example.com')
    expect(res.headers['set-cookie']).toBeDefined()
  })

  it('rejects a duplicate email', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'alice@test.local', // matches pre-seeded testUserId
        password: 'password123',
        username: 'someoneelse',
        displayName: 'Someone Else',
      },
    })
    expect(res.statusCode).toBe(409)
  })
})

describe('login', () => {
  it('POST /auth/login', async () => {
    await db.user.update({
      where: { id: testUserId },
      data: { passwordHash: await bcrypt.hash('password123', 12) },
    })

    const res = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'alice@test.local', password: 'password123' },
    })
    expect(res.statusCode).toBe(200)
    await validateResponse('login', 200, res.json())
    expect(res.json().data.id).toBe(testUserId)
  })

  it('rejects invalid credentials', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'alice@test.local', password: 'wrong-password' },
    })
    expect(res.statusCode).toBe(401)
  })
})

describe('logout', () => {
  it('requires auth', async () => {
    const res = await app.inject({ method: 'POST', url: '/auth/logout' })
    expect(res.statusCode).toBe(401)
  })

  it('POST /auth/logout', async () => {
    // TODO: seed domain data (test users are pre-seeded by buildTestApp)
    const res = await app.inject({
      method: 'POST',
      url: '/auth/logout',
      headers: asAuth(testUserId),
      // payload: {},
    })
    expect(res.statusCode).toBe(200)
    await validateResponse('logout', 200, res.json())
  })
})

describe('getCurrentUser', () => {
  it('requires auth', async () => {
    const res = await app.inject({ method: 'GET', url: '/auth/me' })
    expect(res.statusCode).toBe(401)
  })

  it('GET /auth/me', async () => {
    // TODO: seed domain data (test users are pre-seeded by buildTestApp)
    const res = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: asAuth(testUserId),
      // payload: {},
    })
    expect(res.statusCode).toBe(200)
    await validateResponse('getCurrentUser', 200, res.json())
  })
})
