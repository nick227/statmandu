import { db } from '@statman/db'

export async function bearerAuth(request: any, _reply: any, _params: any) {
  // cookie-first (web); Bearer header fallback (native apps)
  const token =
    request.cookies?.token ??
    request.headers.authorization?.replace('Bearer ', '')

  if (!token) throw { statusCode: 401, message: 'Unauthorized' }

  const session = await db.session.findUnique({
    where: { token },
    include: { user: { include: { profile: true } } },
  })

  if (!session || session.expiresAt < new Date()) {
    throw { statusCode: 401, message: 'Session expired' }
  }

  if (session.user.suspendedAt) {
    throw { statusCode: 403, message: 'Account suspended' }
  }

  const actorUser = session.user
  request.actorUser = actorUser

  const actAsUserId = request.headers['x-act-as-user-id']
  if (actAsUserId) {
    if (actorUser.role !== 'ADMIN') throw { statusCode: 403, message: 'Forbidden' }
    if (typeof actAsUserId !== 'string') throw { statusCode: 400, message: 'Invalid X-Act-As-User-Id header' }
    const subjectUser = await db.user.findUnique({ where: { id: actAsUserId }, include: { profile: true } })
    if (!subjectUser) throw { statusCode: 404, message: 'Act-as user not found' }
    request.user = subjectUser
    request.subjectUser = subjectUser
  } else {
    request.user = actorUser
  }
}

// extend bearerAuth with role check — used for admin routes
export async function adminAuth(request: any, reply: any, params: any) {
  await bearerAuth(request, reply, params)
  if (request.actorUser.role !== 'ADMIN') {
    throw { statusCode: 403, message: 'Forbidden' }
  }
}
