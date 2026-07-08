import { db } from '@statman/db'
import { decodeCursor, encodeCursor, normalizeLimit } from '../lib/pagination'
import { CLAIMED_BY_USER_INCLUDE, withClaimFields } from '../lib/athleteProfile'

const PLAYER_INCLUDE = {
  sport: true,
  athleteProfile: { include: CLAIMED_BY_USER_INCLUDE },
  rosterMemberships: {
    where: { isActive: true },
    include: { team: true },
    orderBy: { joinedAt: 'desc' as const },
    take: 1,
  },
}

function serialize(player: any) {
  const { rosterMemberships, athleteProfile, ...rest } = player
  return {
    ...rest,
    athleteProfile: withClaimFields(athleteProfile),
    currentTeam: rosterMemberships?.[0]?.team ?? null,
  }
}

export class PlayerService {
  async list(opts: {
    cursor?: string
    limit?: number
    q?: string
    sportSlug?: string
    teamSlug?: string
    position?: string
    classYear?: string
  }) {
    const limit = normalizeLimit(opts.limit)
    const cursor = decodeCursor(opts.cursor)

    const where: any = {
      ...(opts.sportSlug ? { sport: { slug: opts.sportSlug } } : {}),
      ...(opts.position ? { position: opts.position } : {}),
      ...(opts.classYear ? { classYear: opts.classYear } : {}),
      ...(opts.teamSlug
        ? { rosterMemberships: { some: { isActive: true, team: { slug: opts.teamSlug } } } }
        : {}),
      ...(opts.q
        ? {
            athleteProfile: {
              OR: [
                { firstName: { contains: opts.q } },
                { lastName: { contains: opts.q } },
              ],
            },
          }
        : {}),
      ...(cursor
        ? {
            OR: [
              { createdAt: { lt: new Date(cursor.createdAt) } },
              { createdAt: new Date(cursor.createdAt), id: { lt: cursor.id } },
            ],
          }
        : {}),
    }

    const players = await db.player.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      include: PLAYER_INCLUDE,
    })

    const hasMore = players.length > limit
    const items = hasMore ? players.slice(0, limit) : players
    const last = items[items.length - 1]
    const nextCursor = hasMore && last
      ? encodeCursor({ createdAt: last.createdAt.toISOString(), id: last.id })
      : null

    return { data: items.map(serialize), meta: { hasMore, nextCursor } }
  }

  async get(playerId: string) {
    const player = await db.player.findUnique({ where: { id: playerId }, include: PLAYER_INCLUDE })
    if (!player) throw { statusCode: 404, message: 'Player not found' }
    return serialize(player)
  }

  async create(userId: string, data: {
    firstName: string
    lastName: string
    sportSlug: string
    bio?: string
    hometown?: string
    avatarUrl?: string
    position?: string
    classYear?: string
    jerseyNumber?: number
    heightInches?: number
  }) {
    const sport = await db.sport.findUnique({ where: { slug: data.sportSlug } })
    if (!sport) throw { statusCode: 404, message: 'Sport not found' }

    const slug = await this._uniqueSlug(`${data.firstName}-${data.lastName}`)

    const athleteProfile = await db.athleteProfile.create({
      data: {
        slug,
        firstName: data.firstName,
        lastName: data.lastName,
        bio: data.bio,
        hometown: data.hometown,
        avatarUrl: data.avatarUrl,
        claimedByUserId: userId,
        players: {
          create: {
            sportId: sport.id,
            position: data.position as any,
            classYear: data.classYear,
            jerseyNumber: data.jerseyNumber,
            heightInches: data.heightInches,
          },
        },
      },
      include: { players: { include: PLAYER_INCLUDE } },
    })

    return serialize(athleteProfile.players[0])
  }

  async update(userId: string, isAdmin: boolean, playerId: string, data: Record<string, unknown>) {
    const player = await db.player.findUnique({ where: { id: playerId }, include: { athleteProfile: true } })
    if (!player) throw { statusCode: 404, message: 'Player not found' }

    if (player.athleteProfile.claimedByUserId !== userId && !isAdmin) {
      throw { statusCode: 403, message: 'Forbidden' }
    }

    const { bio, hometown, avatarUrl, ...playerFields } = data as any

    if (bio !== undefined || hometown !== undefined || avatarUrl !== undefined) {
      await db.athleteProfile.update({
        where: { id: player.athleteProfileId },
        data: { bio, hometown, avatarUrl },
      })
    }

    const updated = await db.player.update({
      where: { id: playerId },
      data: playerFields,
      include: PLAYER_INCLUDE,
    })

    return serialize(updated)
  }

  private async _uniqueSlug(base: string) {
    const slug = base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    let candidate = slug
    let suffix = 1
    while (await db.athleteProfile.findUnique({ where: { slug: candidate } })) {
      candidate = `${slug}-${++suffix}`
    }
    return candidate
  }
}
