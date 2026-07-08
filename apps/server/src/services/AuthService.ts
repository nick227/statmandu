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
