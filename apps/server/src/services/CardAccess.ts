import { db } from '@statman/db'
import type { UserRole } from '@statman/db'

export type CardActor = { id: string; role: UserRole }

export async function requireActiveCreator(id: string) {
  const user = await db.user.findUnique({ where: { id } })
  if (!user || user.suspendedAt || user.deletedAt) throw { statusCode: 403, message: 'Active account required' }
  return user
}

export async function requireCardCreator(actor: CardActor, creatorId: string) {
  await requireActiveCreator(actor.id)
  if (actor.role !== 'ADMIN' && actor.id !== creatorId) throw { statusCode: 403, message: 'Forbidden' }
}
