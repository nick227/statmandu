import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import openapiGlue from 'fastify-openapi-glue'
import { load } from 'js-yaml'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import * as handlers from './handlers'
import * as security from './plugins/security'
import { db } from '@statman/db'

import multipart from '@fastify/multipart'

const server = Fastify({ logger: true })

const specPath = resolve(__dirname, '../../../packages/api-spec/openapi.yaml')
const spec = load(readFileSync(specPath, 'utf-8')) as any

function specForGlue() {
  const glueSpec = structuredClone(spec)
  delete glueSpec.paths?.['/images/upload']
  return glueSpec
}

async function main() {
  // CORS — must be first so preflight OPTIONS requests are handled before routing
  // credentials: true required for httpOnly cookie auth across origins
  // In production set CORS_ORIGIN to the deployed frontend URL.
  // In dev, allow any localhost/127.0.0.1 origin regardless of port — Vite,
  // Expo web, and Metro's own dev server all pick different default ports
  // (5173, 8081, ...), and hardcoding one is a recurring source of CORS
  // failures that look like a broken network request client-side.
  const isProduction = process.env.NODE_ENV === 'production'
  await server.register(cors, {
    origin: isProduction
      ? (process.env.CORS_ORIGIN ?? false)
      : [/^http:\/\/localhost(:\d+)?$/, /^http:\/\/127\.0\.0\.1(:\d+)?$/],
    credentials: true,
  })

  // cookies — must register before glue so request.cookies is populated
  await server.register(cookie)

  // multipart — required to parse file uploads automatically into request.body
  await server.register(multipart, {
    attachFieldsToBody: true,
    limits: {
      fileSize: Number(process.env.IMAGE_UPLOAD_MAX_BYTES ?? 5 * 1024 * 1024),
    },
  })

  // live swagger UI at /docs in dev
  await server.register(swagger, { openapi: spec })
  await server.register(swaggerUi, { routePrefix: '/docs' })

  // global error handler — maps known shapes to HTTP responses
  server.setErrorHandler((error, _request, reply) => {
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
    server.log.error(error)
    return reply.status(500).send({ error: 'Internal server error' })
  })

  server.post('/images/upload', { preHandler: security.bearerAuth }, handlers.uploadImage)

  // spec-driven routing — operationId → handler export, security scheme → handler.
  // Multipart upload is registered manually above so Fastify can parse the file
  // before business logic; it remains documented in the public OpenAPI spec.
  await server.register(openapiGlue, {
    specification: specForGlue(),
    serviceHandlers: handlers,
    securityHandlers: security,
    noAdditional: true,
  } as any)

  server.addHook('onResponse', async (request, reply) => {
    const req: any = request
    const method = request.method?.toUpperCase?.() ?? ''
    if (!['POST', 'PATCH', 'DELETE'].includes(method)) return
    if (!req.actorUser || req.actorUser.role !== 'ADMIN') return

    const noteHeader = request.headers['x-admin-note']
    const note = typeof noteHeader === 'string' && noteHeader.trim() ? noteHeader.trim() : undefined
    const subjectUserId = req.subjectUser?.id ?? null

    // Best-effort logging; never block the request on audit persistence.
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
      // swallow
    }
  })

  // health check — not in spec, always public
  server.get('/health', async () => ({ status: 'ok' }))
  server.get('/uploads/images/*', handlers.serveUploadedImage)

  await server.listen({
    port: Number(process.env.PORT ?? 3001),
    host: '0.0.0.0',
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
