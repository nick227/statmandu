import { beforeAll, beforeEach, afterAll } from 'vitest'
import Fastify, { type FastifyInstance } from 'fastify'
import cookie from '@fastify/cookie'
import openapiGlue from 'fastify-openapi-glue'
import SwaggerParser from '@apidevtools/swagger-parser'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { resolve } from 'path'
import { db } from '@statman/db'
import * as handlers from '../../handlers'
import { resetTestDatabase } from './setup'

// Two seeded users available in every test — use testOtherUserId for
// cross-user permission tests (e.g. "user A cannot delete user B's resource")
export const testUserId      = '00000000-0000-0000-0000-000000000001'
export const testOtherUserId = '00000000-0000-0000-0000-000000000002'

const specPath = resolve(__dirname, '../../../../../packages/api-spec/openapi.yaml')

let derefSpec: any
async function getSpec() {
  if (!derefSpec) derefSpec = await SwaggerParser.dereference(specPath)
  return derefSpec
}

const ajv = new Ajv({ allErrors: true, strict: false })
addFormats(ajv)

// Seeds minimal user + profile rows before each test.
// setup.ts deletes rows in beforeEach — this re-creates auth users for the test.
async function seedTestUsers() {
  await db.user.createMany({
    data: [
      { id: testUserId,      email: 'alice@test.local', passwordHash: 'x' },
      { id: testOtherUserId, email: 'bob@test.local',   passwordHash: 'x' },
    ],
    skipDuplicates: true,
  })
  await db.profile.createMany({
    data: [
      { userId: testUserId,      username: 'alice', displayName: 'Alice' },
      { userId: testOtherUserId, username: 'bob',   displayName: 'Bob'   },
    ],
    skipDuplicates: true,
  })
}

export function buildTestApp() {
  const app: FastifyInstance = Fastify()

  beforeAll(async () => {
    await app.register(cookie, {
      secret: process.env.COOKIE_SECRET ?? 'test-cookie-secret-at-least-32-characters',
    })

    // Mirror the production error handler (apps/server/src/index.ts) so tests
    // exercise the same Prisma-error → HTTP-status mapping as the real server.
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

    await app.register(openapiGlue, {
      specification: specPath,
      serviceHandlers: handlers,
      securityHandlers: {
        // Test auth: accept "Bearer <userId>" directly — no session lookup or bcrypt.
        // Tests are not testing the auth transport; they're testing business logic.
        async bearerAuth(request: any) {
          const id = request.headers.authorization?.replace('Bearer ', '')
          if (!id) throw { statusCode: 401, message: 'Unauthorized' }
          request.user = await db.user.findUniqueOrThrow({
            where: { id },
            include: { profile: true },
          })
        },
        async adminAuth(request: any) {
          const id = request.headers.authorization?.replace('Bearer ', '')
          if (!id) throw { statusCode: 401, message: 'Unauthorized' }
          request.user = await db.user.findUniqueOrThrow({
            where: { id },
            include: { profile: true },
          })
          if (request.user.role !== 'ADMIN') throw { statusCode: 403, message: 'Forbidden' }
        },
      },
      noAdditional: true,
    } as any)
    await app.ready()
  })

  // Seed test users before every test so asAuth() works without per-test setup.
  beforeEach(async () => {
    await resetTestDatabase()
    await seedTestUsers()
  })

  afterAll(() => app.close())

  return app
}

export function asAuth(userId: string) {
  return { Authorization: `Bearer ${userId}` }
}

export async function validateResponse(operationId: string, status: number, body: unknown) {
  const spec = await getSpec()
  for (const pathItem of Object.values<any>(spec.paths ?? {})) {
    for (const op of Object.values<any>(pathItem)) {
      if (op.operationId !== operationId) continue
      const schema = op.responses?.[status]?.content?.['application/json']?.schema
      if (!schema) return
      const validate = ajv.compile(schema)
      if (!validate(body)) {
        throw new Error(
          `${operationId} ${status} response does not match spec:\n` +
          JSON.stringify(validate.errors, null, 2)
        )
      }
      return
    }
  }
}
