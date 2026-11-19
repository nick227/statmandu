import { serializePerson } from './PersonService'
import { db } from '@statman/db'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000  // 30 days

export class AuthService {
  async register(data: { email: string; password: string; username: string; displayName: string }) {
    const hash = await bcrypt.hash(data.password, 12)
    const user = await db.user.create({
      data: {
        email: data.email,
        passwordHash: hash,
        storefront: { create: {} },
        profile: {
          create: {
            username: data.username,
            displayName: data.displayName,
          },
        },
      },
      include: { profile: true },
    })
    const session = await this._createSession(user.id)
    return { user, token: session.token }
  }

  async login(data: { email: string; password: string }) {
    const user = await db.user.findUnique({
      where: { email: data.email },
      include: { profile: true },
    })
    if (!user) throw { statusCode: 401, message: 'Invalid credentials' }

    const valid = await bcrypt.compare(data.password, user.passwordHash)
    if (!valid) throw { statusCode: 401, message: 'Invalid credentials' }

    if (user.suspendedAt) throw { statusCode: 403, message: 'Account suspended' }

    const session = await this._createSession(user.id)
    return { user, token: session.token }
  }

  async logout(token: string) {
    await db.session.deleteMany({ where: { token } })
  }

  async updateProfile(userId: string, input: {
    displayName?: string
    bio?: string
    avatarUrl?: string
    hometown?: string
    calling?: string
    age?: string
    quote?: string
    debut?: string
    specializations?: any[]
    customFields?: any[]
  }) {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { profile: true, claimedProfile: true },
    })
    if (!user) throw { statusCode: 404, message: 'User not found' }

    if (input.displayName !== undefined && !input.displayName.trim()) {
      throw { statusCode: 400, message: 'Display name cannot be empty' }
    }

    await db.profile.update({
      where: { userId },
      data: {
        displayName: input.displayName !== undefined ? input.displayName.trim() : undefined,
        bio: input.bio !== undefined ? input.bio : undefined,
        avatarUrl: input.avatarUrl !== undefined ? input.avatarUrl : undefined,
      },
    })

    const metadata = {
      calling: input.calling,
      age: input.age,
      quote: input.quote,
      debut: input.debut,
      specializations: input.specializations ?? [],
      customFields: input.customFields ?? [],
    }

    if (user.claimedProfile) {
      await db.personProfile.update({
        where: { id: user.claimedProfile.id },
        data: {
          displayName: input.displayName !== undefined ? input.displayName.trim() : undefined,
          bio: input.bio !== undefined ? input.bio : undefined,
          hometown: input.hometown !== undefined ? input.hometown : undefined,
          avatarUrl: input.avatarUrl !== undefined ? input.avatarUrl : undefined,
          aliases: metadata as any,
        },
      })
    } else {
      const displayName = input.displayName?.trim() || user.profile?.displayName || 'Creator'
      const slug = `${displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60) || 'person'}-${randomUUID().slice(0, 8)}`
      await db.personProfile.create({
        data: {
          slug,
          displayName,
          bio: input.bio,
          hometown: input.hometown,
          avatarUrl: input.avatarUrl,
          claimedByUserId: userId,
          createdByUserId: userId,
          aliases: metadata as any,
        },
      })
    }

    const updatedUser = await db.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    })
    return updatedUser!
  }

  async capabilities(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        claimedProfile: {
          include: {
            players: {
              include: {
                sport: true,
                rosterMemberships: {
                  where: { isActive: true },
                  include: { team: true },
                  orderBy: { joinedAt: 'desc' },
                  take: 1,
                },
              },
            },
          },
        },
        gameReporters: {
          include: {
            team: true,
            game: {
              include: {
                gameTeams: { include: { team: true } },
              },
            },
          },
          orderBy: { joinedAt: 'desc' },
          take: 10,
        },
      },
    })
    if (!user) throw { statusCode: 404, message: 'User not found' }

    const athleteProfiles = user.claimedProfile
      ? user.claimedProfile.players.map((player) => ({
          athleteProfileId: user.claimedProfile!.id,
          playerId: player.id,
          name: `${user.claimedProfile!.firstName} ${user.claimedProfile!.lastName}`,
          avatarUrl: user.claimedProfile!.avatarUrl,
          sportSlug: player.sport.slug,
          currentTeamName: player.rosterMemberships[0]?.team.name ?? null,
        }))
      : []

    const managerRoles = ['ADMIN_OWNER', 'OFFICIAL_SCORER']
    const reporterAssignments = user.gameReporters.map((assignment) => {
      const teams = assignment.game.gameTeams.map((gameTeam) => gameTeam.team?.name).filter(Boolean)
      return {
        id: assignment.id,
        gameId: assignment.gameId,
        role: assignment.role,
        teamId: assignment.teamId,
        teamName: assignment.team?.name ?? null,
        gameLabel: teams.length >= 2 ? `${teams[0]} vs ${teams[1]}` : 'Game assignment',
        gameStatus: assignment.game.status,
        scheduledAt: assignment.game.scheduledAt.toISOString(),
        canManageGame: managerRoles.includes(assignment.role),
      }
    })

    return {
      personProfile: user.claimedProfile ? serializePerson(user.claimedProfile) : null,
      athleteProfiles,
      reporterAssignments,
      canReviewClaims: user.role === 'ADMIN',
    }
  }

  private async _createSession(userId: string) {
    return db.session.create({
      data: {
        userId,
        token: randomUUID(),
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      },
    })
  }
}
