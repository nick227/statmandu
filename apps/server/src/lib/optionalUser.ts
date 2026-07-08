import { db } from '@statman/db'

// For `security: []` routes that still want to personalize the response for
// a logged-in caller without requiring one — no preHandler runs on these
// routes, so `request.user` is never populated by `plugins/security.ts`;
// this re-derives it from the same cookie/Bearer token, tolerating a missing
// or invalid one instead of throwing. Extracted out of handlers/cards.ts
// (its original, single call site) the moment a second caller needed it —
// keep reusing this instead of re-copying the lookup per handler file.
export async function optionalUser(request: any) {
  if (request.user) return request.user
  const token =
    request.cookies?.token ??
    request.headers.authorization?.replace('Bearer ', '')
  if (!token) return null

  const directUser = await db.user.findUnique({ where: { id: token }, include: { profile: true } }).catch(() => null)
  if (directUser) return directUser

  const session = await db.session
    .findUnique({ where: { token }, include: { user: { include: { profile: true } } } })
    .catch(() => null)
  if (!session || session.expiresAt < new Date() || session.user.suspendedAt) return null
  return session.user
}
