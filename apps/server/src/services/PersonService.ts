import { randomUUID } from 'crypto'
import { db } from '@statman/db'
import { buildShareMetadata } from '../lib/shareMetadata'

export function personName(person: { displayName?: string | null; firstName?: string | null; lastName?: string | null }) {
  return person.displayName?.trim() || [person.firstName, person.lastName].filter(Boolean).join(' ')
}

export function serializePerson(person: any) {
  return {
    id: person.id, slug: person.slug, displayName: personName(person),
    aliases: person.aliases ?? [], bio: person.bio, hometown: person.hometown,
    avatarUrl: person.avatarUrl, claimedByUserId: person.claimedByUserId,
    ...buildShareMetadata('person', person.id, { ...person, displayName: personName(person) }),
  }
}

export class PersonService {
  async list(q = '') {
    const people = await db.personProfile.findMany({ where: { deletedAt: null, ...(q ? { OR: [{ displayName: { contains: q } }, { firstName: { contains: q } }, { lastName: { contains: q } }] } : {}) }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 50 })
    return people.map(serializePerson)
  }
  async get(id: string) {
    const person = await db.personProfile.findFirst({ where: { id, deletedAt: null } })
    if (!person) throw { statusCode: 404, message: 'Person not found' }
    return serializePerson(person)
  }
  async create(userId: string, input: { displayName: string; bio?: string; aliases?: string[] }) {
    const displayName = input.displayName.trim()
    if (!displayName) throw { statusCode: 400, message: 'Display name is required' }
    const person = await db.personProfile.create({ data: { displayName, bio: input.bio, aliases: input.aliases ?? [], createdByUserId: userId, slug: `${displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60) || 'person'}-${randomUUID().slice(0, 8)}` } })
    return serializePerson(person)
  }
  async update(actor: { id: string; role: string }, id: string, input: { displayName?: string; bio?: string; aliases?: string[] }) {
    const person = await db.personProfile.findFirst({ where: { id, deletedAt: null } })
    if (!person) throw { statusCode: 404, message: 'Person not found' }
    // Unclaimed profile authors may maintain their submission, but acquire no verified authority.
    if (actor.role !== 'ADMIN' && person.claimedByUserId !== actor.id && !(person.claimedByUserId === null && person.createdByUserId === actor.id)) throw { statusCode: 403, message: 'Forbidden' }
    if (input.displayName !== undefined && !input.displayName.trim()) throw { statusCode: 400, message: 'Display name is required' }
    return serializePerson(await db.personProfile.update({ where: { id, deletedAt: null, ...(actor.role === 'ADMIN' ? {} : { OR: [{ claimedByUserId: actor.id }, { claimedByUserId: null, createdByUserId: actor.id }] }) }, data: { displayName: input.displayName?.trim(), bio: input.bio, aliases: input.aliases } }))
  }
}
