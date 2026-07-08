import type { GameReporterRole, UserRole } from '@statman/db'

export type PolicyAction =
  | 'createGame'
  | 'editGame'
  | 'manageRoster'
  | 'inviteReporter'
  | 'submitLiveEvent'
  | 'undoOwnEvent'
  | 'undoAnyEvent'
  | 'resolveConflict'
  | 'finalizeGame'
  | 'attachMedia'
  | 'editPlayerProfile'
  | 'verifyPlayer'
  | 'manageSources'

type Actor = {
  id: string
  role: UserRole
}

type Reporter = {
  userId: string
  role: GameReporterRole
  teamId: string | null
} | null

type Context = {
  reporter?: Reporter
  ownsResource?: boolean
}

const GAME_MANAGER_ROLES: GameReporterRole[] = ['ADMIN_OWNER', 'OFFICIAL_SCORER']
const LIVE_EVENT_ROLES: GameReporterRole[] = ['ADMIN_OWNER', 'OFFICIAL_SCORER', 'TEAM_SCORER', 'BROADCASTER', 'CONTRIBUTOR', 'SPECTATOR_REPORTER']

export class PermissionPolicy {
  can(actor: Actor, action: PolicyAction, context: Context = {}) {
    if (actor.role === 'ADMIN') return true

    switch (action) {
      case 'createGame':
      case 'attachMedia':
        return true
      case 'editGame':
      case 'manageRoster':
      case 'verifyPlayer':
      case 'manageSources':
        return false
      case 'editPlayerProfile':
        return Boolean(context.ownsResource)
      case 'inviteReporter':
      case 'undoAnyEvent':
      case 'resolveConflict':
      case 'finalizeGame':
        return this.hasReporterRole(context.reporter, GAME_MANAGER_ROLES)
      case 'submitLiveEvent':
        return this.hasReporterRole(context.reporter, LIVE_EVENT_ROLES)
      case 'undoOwnEvent':
        return this.hasReporterRole(context.reporter, LIVE_EVENT_ROLES)
      default:
        return false
    }
  }

  require(actor: Actor, action: PolicyAction, context: Context = {}) {
    if (!this.can(actor, action, context)) {
      throw { statusCode: 403, message: `Forbidden: ${action}` }
    }
  }

  private hasReporterRole(reporter: Reporter | undefined, roles: GameReporterRole[]) {
    return Boolean(reporter && roles.includes(reporter.role))
  }
}
