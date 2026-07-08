// Generated from openapi.yaml — fill in seeds and assertions.
// Run `pnpm test:generate` to add stubs for new routes.
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import Fastify, { type FastifyInstance } from 'fastify'
import cookie from '@fastify/cookie'
import multipart from '@fastify/multipart'
import openapiGlue from 'fastify-openapi-glue'
import SwaggerParser from '@apidevtools/swagger-parser'
import { resolve } from 'path'
import { db } from '@statman/db'
import * as handlers from '../handlers'
import { asAuth, testOtherUserId, testUserId, validateResponse } from './helpers'

const specPath = resolve(__dirname, '../../../../packages/api-spec/openapi.yaml')

async function resetAdminTestDatabase() {
  // order matters for FK constraints (children before parents).
  await db.adminAuditLog.deleteMany()
  await db.feedItem.deleteMany()
  await db.cardIssue.deleteMany()
  await db.cardGenerationJob.deleteMany()
  await db.cardTemplate.deleteMany()
  await db.imageAsset.deleteMany()
  await db.mediaAsset.deleteMany()
  await db.reaction.deleteMany()
  await db.gameReaction.deleteMany()
  await db.follow.deleteMany()
  await db.dispute.deleteMany()
  await db.claim.deleteMany()
  await db.sourceReference.deleteMany()
  await db.gameStatLine.deleteMany()
  await db.gameEvent.deleteMany()
  await db.gameConsensusGroup.deleteMany()
  await db.gameReporter.deleteMany()
  await db.gameTeam.deleteMany()
  await db.playerSeasonStat.deleteMany()
  await db.teamSeasonStat.deleteMany()
  await db.game.deleteMany()
  await db.rosterMembership.deleteMany()
  await db.player.deleteMany()
  await db.athleteProfile.deleteMany()
  await db.team.deleteMany()
  await db.season.deleteMany()
  await db.school.deleteMany()
  await db.league.deleteMany()
  await db.sport.deleteMany()
  await db.session.deleteMany()
  await db.profile.deleteMany()
  await db.user.deleteMany()
}

async function seedTestUsers() {
  await db.user.createMany({
    data: [
      { id: testUserId, email: 'alice@test.local', passwordHash: 'x' },
      { id: testOtherUserId, email: 'bob@test.local', passwordHash: 'x' },
    ],
    skipDuplicates: true,
  })
  await db.profile.createMany({
    data: [
      { userId: testUserId, username: 'alice', displayName: 'Alice' },
      { userId: testOtherUserId, username: 'bob', displayName: 'Bob' },
    ],
    skipDuplicates: true,
  })
}

function buildAdminTestApp(): FastifyInstance {
  const app: FastifyInstance = Fastify()

  let derefSpec: any
  async function getSpec() {
    if (!derefSpec) derefSpec = await SwaggerParser.dereference(specPath)
    return derefSpec
  }

  beforeAll(async () => {
    await app.register(cookie, {
      secret: process.env.COOKIE_SECRET ?? 'test-cookie-secret-at-least-32-characters',
    })
    await app.register(multipart, {
      attachFieldsToBody: true,
      limits: {
        fileSize: Number(process.env.IMAGE_UPLOAD_MAX_BYTES ?? 5 * 1024 * 1024),
      },
    })

    // Mirror the production error handler (apps/server/src/index.ts).
    app.setErrorHandler((error, _request, reply) => {
      if (error.validation) {
        return reply.status(400).send({ error: 'Validation failed', details: error.validation })
      }
      if (error.statusCode) {
        return reply.status(error.statusCode).send({ error: error.message })
      }
      if ((error as any).code === 'P2025') {
        return reply.status(404).send({ error: 'Not found' })
      }
      if ((error as any).code === 'P2002') {
        return reply.status(409).send({ error: 'Already exists' })
      }
      app.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    })

    const securityHandlers = {
      async bearerAuth(request: any) {
        const actorId = request.headers.authorization?.replace('Bearer ', '')
        if (!actorId) throw { statusCode: 401, message: 'Unauthorized' }
        const actorUser = await db.user.findUniqueOrThrow({
          where: { id: actorId },
          include: { profile: true },
        })
        request.actorUser = actorUser

        const actAsUserId = request.headers['x-act-as-user-id']
        if (actAsUserId) {
          if (actorUser.role !== 'ADMIN') throw { statusCode: 403, message: 'Forbidden' }
          if (typeof actAsUserId !== 'string') throw { statusCode: 400, message: 'Invalid X-Act-As-User-Id header' }
          const subjectUser = await db.user.findUnique({
            where: { id: actAsUserId },
            include: { profile: true },
          })
          if (!subjectUser) throw { statusCode: 404, message: 'Act-as user not found' }
          request.user = subjectUser
          request.subjectUser = subjectUser
          return
        }

        request.user = actorUser
      },
      async adminAuth(request: any, reply: any, params: any) {
        await securityHandlers.bearerAuth(request)
        if (request.actorUser.role !== 'ADMIN') throw { statusCode: 403, message: 'Forbidden' }
      },
    }

    app.addHook('onResponse', async (request, reply) => {
      const req: any = request
      const method = request.method?.toUpperCase?.() ?? ''
      if (!['POST', 'PATCH', 'DELETE'].includes(method)) return
      if (!req.actorUser || req.actorUser.role !== 'ADMIN') return

      const noteHeader = request.headers['x-admin-note']
      const note = typeof noteHeader === 'string' && noteHeader.trim() ? noteHeader.trim() : undefined
      const subjectUserId = req.subjectUser?.id ?? null

      try {
        await db.adminAuditLog.create({
          data: {
            actorUserId: req.actorUser.id,
            subjectUserId,
            action: 'ADMIN_MUTATION',
            method,
            path: request.url,
            note,
            requestId: request.id,
          },
        })
      } catch {
        // best-effort: never block response
      }
    })

    app.post('/images/upload', { preHandler: securityHandlers.bearerAuth }, handlers.uploadImage)

    const glueSpec = structuredClone(await getSpec())
    delete glueSpec.paths?.['/images/upload']

    await app.register(openapiGlue, {
      specification: glueSpec,
      serviceHandlers: handlers,
      securityHandlers,
      noAdditional: true,
    } as any)

    await app.ready()
  })

  beforeEach(async () => {
    await resetAdminTestDatabase()
    await seedTestUsers()
  })

  afterAll(() => app.close())

  return app
}

const app = buildAdminTestApp()

async function makeAdmin(userId: string) {
  await db.user.update({ where: { id: userId }, data: { role: 'ADMIN' } })
}

async function seedSport() {
  return db.sport.create({ data: { slug: 'basketball', name: 'Basketball' } })
}

describe('admin endpoints: protection', () => {
  it('GET /admin/metrics requires auth', async () => {
    const res = await app.inject({ method: 'GET', url: '/admin/metrics' })
    expect(res.statusCode).toBe(401)
  })

  it('GET /admin/metrics rejects non-admin', async () => {
    const res = await app.inject({ method: 'GET', url: '/admin/metrics', headers: asAuth(testUserId) })
    expect(res.statusCode).toBe(403)
  })

  it('GET /admin/metrics works for admin', async () => {
    await makeAdmin(testUserId)
    const res = await app.inject({ method: 'GET', url: '/admin/metrics', headers: asAuth(testUserId) })
    expect(res.statusCode).toBe(200)
    await validateResponse('getAdminMetrics', 200, res.json())
    expect(res.json().data.playersCount).toBe(0)
  })
})

describe('impersonation header', () => {
  it('rejects act-as for non-admin', async () => {
    await seedSport()
    const res = await app.inject({
      method: 'POST',
      url: '/players',
      headers: { ...asAuth(testUserId), 'X-Act-As-User-Id': testOtherUserId },
      payload: { firstName: 'Jayden', lastName: 'Rios', sportSlug: 'basketball' },
    })
    expect(res.statusCode).toBe(403)
  })

  it('admin actor vs subject: createPlayer attributes to subject + audits actor+subject + note', async () => {
    await makeAdmin(testUserId)
    await seedSport()

    const res = await app.inject({
      method: 'POST',
      url: '/players',
      headers: { ...asAuth(testUserId), 'X-Act-As-User-Id': testOtherUserId, 'X-Admin-Note': 'onboard athlete as Bob' },
      payload: { firstName: 'Jayden', lastName: 'Rios', sportSlug: 'basketball' },
    })
    expect(res.statusCode).toBe(201)

    const playerId = res.json().data.id as string
    const player = await db.player.findUniqueOrThrow({ where: { id: playerId }, include: { athleteProfile: true } })
    expect(player.athleteProfile.claimedByUserId).toBe(testOtherUserId)

    const audit = await db.adminAuditLog.findFirst({
      where: { actorUserId: testUserId, subjectUserId: testOtherUserId, method: 'POST', path: '/players' },
      orderBy: { createdAt: 'desc' },
    })
    expect(audit).toBeTruthy()
    expect(audit?.note).toBe('onboard athlete as Bob')
  })
})

describe('admin endpoints: bulk + audit', () => {
  it('POST /admin/players/bulk returns row-level errors and still creates valid rows', async () => {
    await makeAdmin(testUserId)
    await seedSport()

    const res = await app.inject({
      method: 'POST',
      url: '/admin/players/bulk',
      headers: { ...asAuth(testUserId), 'X-Admin-Note': 'bulk import' },
      payload: {
        items: [
          { firstName: 'Jayden', lastName: 'Rios', sportSlug: 'basketball' },
          { firstName: 'Missing', lastName: 'Sport', sportSlug: 'nope' },
        ],
      },
    })

    expect(res.statusCode).toBe(200)
    await validateResponse('bulkCreatePlayers', 200, res.json())
    expect(res.json().data.created).toHaveLength(1)
    expect(res.json().data.errors).toHaveLength(1)
    expect(res.json().data.errors[0].index).toBe(1)

    const audit = await db.adminAuditLog.findFirst({
      where: { actorUserId: testUserId, method: 'POST', path: '/admin/players/bulk' },
      orderBy: { createdAt: 'desc' },
    })
    expect(audit).toBeTruthy()
    expect(audit?.note).toBe('bulk import')
  })

  it('POST /admin/feed-items is admin-only and audits', async () => {
    // non-admin
    const nonAdmin = await app.inject({
      method: 'POST',
      url: '/admin/feed-items',
      headers: asAuth(testUserId),
      payload: {
        type: 'STAT_MILESTONE',
        targetType: 'ATHLETE_PROFILE',
        targetId: 'missing',
        summary: 'x',
        occurredAt: new Date().toISOString(),
      },
    })
    expect(nonAdmin.statusCode).toBe(403)

    await makeAdmin(testUserId)
    const profile = await db.athleteProfile.create({
      data: { slug: 'taylor-james', firstName: 'Taylor', lastName: 'James', sourceStatus: 'PLAYER_REPORTED' },
    })

    const res = await app.inject({
      method: 'POST',
      url: '/admin/feed-items',
      headers: { ...asAuth(testUserId), 'X-Admin-Note': 'seed feed item' },
      payload: {
        type: 'STAT_MILESTONE',
        targetType: 'ATHLETE_PROFILE',
        targetId: profile.id,
        summary: 'Milestone reached',
        occurredAt: new Date().toISOString(),
      },
    })
    expect(res.statusCode).toBe(201)
    await validateResponse('adminCreateFeedItem', 201, res.json())

    const audit = await db.adminAuditLog.findFirst({
      where: { actorUserId: testUserId, method: 'POST', path: '/admin/feed-items' },
      orderBy: { createdAt: 'desc' },
    })
    expect(audit).toBeTruthy()
    expect(audit?.note).toBe('seed feed item')
  })
})

