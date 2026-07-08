import { createHash } from 'crypto'
import { db } from '@statman/db'
import type { CardEditionMode, CardTemplateStatus, CardType, CardVisibility, UserRole } from '@statman/db'
import { StubCardImageGenerator, type CardImageGenerator } from './CardImageGenerator'
import { FeedService } from './FeedService'

const feedService = new FeedService()

const CARD_INCLUDE = {
  athleteProfile: true,
  team: true,
  game: { include: { gameTeams: { include: { team: true } } } },
  frontImageAsset: true,
  sourceImageAsset: true,
  issues: true,
}

type Actor = {
  id: string
  role: UserRole
}

type CreateDraftCardInput = {
  athleteProfileId: string
  teamId?: string | null
  gameId?: string | null
  title: string
  cardType: CardType
  stylePreset: string
  editionMode?: CardEditionMode
  editionSize?: number | null
  sourceImageAssetId?: string | null
  statsSnapshotJson?: unknown
}

type UpdateDraftCardInput = Partial<CreateDraftCardInput> & {
  status?: CardTemplateStatus
  visibility?: CardVisibility
}

type PublishOptions = {
  visibility?: CardVisibility
  editionMode?: CardEditionMode
  editionSize?: number | null
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = canonicalize((value as Record<string, unknown>)[key])
        return acc
      }, {})
  }
  return value
}

function sha256(value: unknown) {
  return createHash('sha256').update(JSON.stringify(canonicalize(value))).digest('hex')
}

function validateEdition(mode: CardEditionMode, size?: number | null) {
  if (mode === 'ONE_OF_ONE') return 1
  if (mode === 'LIMITED') {
    if (!Number.isInteger(size) || Number(size) < 1) {
      throw { statusCode: 400, message: 'LIMITED cards require a positive editionSize' }
    }
    return Number(size)
  }
  if (size !== undefined && size !== null) {
    throw { statusCode: 400, message: 'UNLIMITED cards cannot set editionSize' }
  }
  return null
}

function serialize(card: any, viewerUserId?: string | null) {
  const currentUserIssue = viewerUserId
    ? card.issues?.find((issue: any) => issue.claimedByUserId === viewerUserId && issue.status !== 'REVOKED')
    : null
  return {
    id: card.id,
    athleteProfileId: card.athleteProfileId,
    teamId: card.teamId,
    gameId: card.gameId,
    createdByUserId: card.createdByUserId,
    title: card.title,
    cardType: card.cardType,
    stylePreset: card.stylePreset,
    status: card.status,
    visibility: card.visibility,
    editionMode: card.editionMode,
    editionSize: card.editionSize,
    issuedCount: card.issuedCount,
    frontImageAssetId: card.frontImageAssetId,
    sourceImageAssetId: card.sourceImageAssetId,
    statsSnapshotJson: card.statsSnapshotJson,
    originHash: card.originHash,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
    publishedAt: card.publishedAt,
    athlete: card.athleteProfile
      ? {
          id: card.athleteProfile.id,
          slug: card.athleteProfile.slug,
          firstName: card.athleteProfile.firstName,
          lastName: card.athleteProfile.lastName,
          avatarUrl: card.athleteProfile.avatarUrl,
        }
      : null,
    team: card.team
      ? {
          id: card.team.id,
          slug: card.team.slug,
          name: card.team.name,
          logoUrl: card.team.logoUrl,
        }
      : null,
    game: card.game
      ? {
          id: card.game.id,
          scheduledAt: card.game.scheduledAt,
          status: card.game.status,
          teams: card.game.gameTeams?.map((gameTeam: any) => ({
            id: gameTeam.team.id,
            slug: gameTeam.team.slug,
            name: gameTeam.team.name,
            isHome: gameTeam.isHome,
            finalScore: gameTeam.finalScore,
          })) ?? [],
        }
      : null,
    frontImage: card.frontImageAsset
      ? {
          id: card.frontImageAsset.id,
          url: card.frontImageAsset.url,
          thumbUrl: card.frontImageAsset.url,
        }
      : null,
    sourceImage: card.sourceImageAsset
      ? {
          id: card.sourceImageAsset.id,
          url: card.sourceImageAsset.url,
        }
      : null,
    currentUserHasClaimed: Boolean(currentUserIssue),
    currentUserIssue: currentUserIssue
      ? {
          id: currentUserIssue.id,
          cardTemplateId: currentUserIssue.cardTemplateId,
          issueNumber: currentUserIssue.issueNumber,
          ownerUserId: currentUserIssue.ownerUserId,
          claimedByUserId: currentUserIssue.claimedByUserId,
          issueHash: currentUserIssue.issueHash,
          status: currentUserIssue.status,
          createdAt: currentUserIssue.createdAt,
          claimedAt: currentUserIssue.claimedAt,
          downloadedAt: currentUserIssue.downloadedAt,
        }
      : null,
  }
}

function serializeIssue(issue: any) {
  return {
    id: issue.id,
    cardTemplateId: issue.cardTemplateId,
    issueNumber: issue.issueNumber,
    ownerUserId: issue.ownerUserId,
    claimedByUserId: issue.claimedByUserId,
    claimedAt: issue.claimedAt,
    downloadedAt: issue.downloadedAt,
    issueHash: issue.issueHash,
    status: issue.status,
    createdAt: issue.createdAt,
  }
}

export class CardService {
  constructor(private readonly generator: CardImageGenerator = new StubCardImageGenerator()) {}

  async createDraftCard(userId: string, input: CreateDraftCardInput) {
    await this.requireCardTargets(input)
    const editionMode = input.editionMode ?? 'UNLIMITED'
    const editionSize = validateEdition(editionMode, input.editionSize)
    const card = await db.cardTemplate.create({
      data: {
        athleteProfileId: input.athleteProfileId,
        teamId: input.teamId ?? null,
        gameId: input.gameId ?? null,
        createdByUserId: userId,
        title: input.title,
        cardType: input.cardType,
        stylePreset: input.stylePreset,
        editionMode,
        editionSize,
        sourceImageAssetId: input.sourceImageAssetId ?? null,
        statsSnapshotJson: (input.statsSnapshotJson ?? {}) as any,
      },
      include: CARD_INCLUDE,
    })
    return serialize(card, userId)
  }

  async updateDraftCard(actor: Actor, id: string, input: UpdateDraftCardInput) {
    const existing = await db.cardTemplate.findUnique({ where: { id }, include: { athleteProfile: true } })
    if (!existing) throw { statusCode: 404, message: 'Card not found' }
    await this.requireOwner(actor, existing)

    if (existing.status === 'PUBLISHED') {
      const immutable = ['cardType', 'athleteProfileId', 'statsSnapshotJson', 'editionMode', 'editionSize', 'originHash']
      for (const field of immutable) {
        if ((input as any)[field] !== undefined) throw { statusCode: 409, message: `${field} is immutable after publish` }
      }
    }

    if (input.athleteProfileId || input.teamId || input.gameId || input.sourceImageAssetId) {
      await this.requireCardTargets({
        athleteProfileId: input.athleteProfileId ?? existing.athleteProfileId,
        teamId: input.teamId === undefined ? existing.teamId : input.teamId,
        gameId: input.gameId === undefined ? existing.gameId : input.gameId,
        sourceImageAssetId: input.sourceImageAssetId === undefined ? existing.sourceImageAssetId : input.sourceImageAssetId,
      } as CreateDraftCardInput)
    }

    const nextEditionMode = input.editionMode ?? existing.editionMode
    const nextEditionSize = input.editionSize === undefined ? existing.editionSize : input.editionSize
    const editionSize = validateEdition(nextEditionMode, nextEditionSize)

    const card = await db.cardTemplate.update({
      where: { id },
      data: {
        athleteProfileId: input.athleteProfileId,
        teamId: input.teamId,
        gameId: input.gameId,
        title: input.title,
        cardType: input.cardType,
        stylePreset: input.stylePreset,
        status: input.status,
        visibility: input.visibility,
        editionMode: input.editionMode,
        editionSize,
        sourceImageAssetId: input.sourceImageAssetId,
        statsSnapshotJson: input.statsSnapshotJson as any,
      },
      include: CARD_INCLUDE,
    })
    return serialize(card, actor.id)
  }

  async generateCard(actor: Actor, id: string) {
    const card = await db.cardTemplate.findUnique({ where: { id }, include: { athleteProfile: true } })
    if (!card) throw { statusCode: 404, message: 'Card not found' }
    await this.requireOwner(actor, card)
    if (card.status === 'PUBLISHED' || card.status === 'ARCHIVED') {
      throw { statusCode: 409, message: 'Published or archived cards cannot be regenerated' }
    }

    const input = {
      cardTemplateId: card.id,
      title: card.title,
      cardType: card.cardType,
      stylePreset: card.stylePreset,
      athleteName: `${card.athleteProfile.firstName} ${card.athleteProfile.lastName}`,
      createdByUserId: card.createdByUserId,
    }

    const job = await db.cardGenerationJob.create({
      data: { cardTemplateId: id, provider: 'STUB', status: 'PROCESSING', inputJson: input as any },
    })

    try {
      await db.cardTemplate.update({ where: { id }, data: { status: 'GENERATING' } })
      const output = await this.generator.generate(input)
      await db.cardGenerationJob.update({
        where: { id: job.id },
        data: { status: 'READY', outputJson: output as any },
      })
      const updated = await db.cardTemplate.update({
        where: { id },
        data: { status: 'READY', frontImageAssetId: output.frontImageAssetId },
        include: CARD_INCLUDE,
      })
      return serialize(updated, actor.id)
    } catch (err: any) {
      await db.cardGenerationJob.update({
        where: { id: job.id },
        data: { status: 'FAILED', error: err?.message ?? 'Generation failed' },
      })
      await db.cardTemplate.update({ where: { id }, data: { status: 'FAILED' } })
      throw err
    }
  }

  async publishCard(actor: Actor, id: string, options: PublishOptions = {}) {
    const existing = await db.cardTemplate.findUnique({ where: { id }, include: { athleteProfile: true } })
    if (!existing) throw { statusCode: 404, message: 'Card not found' }
    await this.requirePublishPermission(actor, existing)
    if (existing.status === 'ARCHIVED') throw { statusCode: 409, message: 'Archived cards cannot be published' }
    if (existing.status === 'PUBLISHED') throw { statusCode: 409, message: 'Card is already published' }

    const editionMode = options.editionMode ?? existing.editionMode
    const editionSize = validateEdition(editionMode, options.editionSize === undefined ? existing.editionSize : options.editionSize)
    const originHash = sha256({
      cardTemplateId: existing.id,
      athleteProfileId: existing.athleteProfileId,
      cardType: existing.cardType,
      editionMode,
      editionSize,
      frontImageAssetId: existing.frontImageAssetId,
      sourceImageAssetId: existing.sourceImageAssetId,
      statsSnapshotJson: existing.statsSnapshotJson,
    })

    const card = await db.cardTemplate.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        visibility: options.visibility ?? 'PUBLIC',
        editionMode,
        editionSize,
        originHash,
        publishedAt: new Date(),
      },
      include: CARD_INCLUDE,
    })

    await feedService.record({
      type: 'CARD_PUBLISHED',
      targetType: 'CARD_TEMPLATE',
      targetId: card.id,
      summary: `Card published: ${card.title}`,
    })

    return serialize(card, actor.id)
  }

  async listRecentPublicCards(viewerUserId?: string | null) {
    const cards = await db.cardTemplate.findMany({
      where: { status: 'PUBLISHED', visibility: 'PUBLIC' },
      orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
      take: 20,
      include: CARD_INCLUDE,
    })
    return cards.map((card) => serialize(card, viewerUserId))
  }

  async listCardsForAthlete(athleteProfileId: string, viewerUserId?: string | null) {
    const cards = await db.cardTemplate.findMany({
      where: {
        athleteProfileId,
        OR: [{ status: 'PUBLISHED', visibility: 'PUBLIC' }, ...(viewerUserId ? [{ createdByUserId: viewerUserId }] : [])],
      },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      include: CARD_INCLUDE,
    })
    return cards.map((card) => serialize(card, viewerUserId))
  }

  async listCardsForUser(userId: string) {
    const issues = await db.cardIssue.findMany({
      where: { claimedByUserId: userId, status: { not: 'REVOKED' } },
      orderBy: { createdAt: 'desc' },
      include: { cardTemplate: { include: CARD_INCLUDE } },
    })
    return issues.map((issue) => ({
      issue: serializeIssue(issue),
      card: serialize(issue.cardTemplate, userId),
    }))
  }

  async getCard(id: string, viewerUserId?: string | null, isAdmin = false) {
    const card = await db.cardTemplate.findUnique({ where: { id }, include: CARD_INCLUDE })
    if (!card) throw { statusCode: 404, message: 'Card not found' }
    if (card.visibility !== 'PUBLIC' && card.createdByUserId !== viewerUserId && !isAdmin) {
      throw { statusCode: 404, message: 'Card not found' }
    }
    return serialize(card, viewerUserId)
  }

  async claimCard(id: string, userId: string) {
    const issue = await db.$transaction(async (tx) => {
      const card = await tx.cardTemplate.findUnique({ where: { id } })
      if (!card) throw { statusCode: 404, message: 'Card not found' }
      if (card.status !== 'PUBLISHED' || card.visibility !== 'PUBLIC') {
        throw { statusCode: 409, message: 'Only public published cards can be claimed' }
      }
      if (!card.originHash) throw { statusCode: 409, message: 'Card origin hash is missing' }
      if (card.editionSize !== null && card.issuedCount >= card.editionSize) {
        throw { statusCode: 409, message: 'Edition is fully claimed' }
      }

      const issueNumber = card.issuedCount + 1
      const issueHash = sha256({
        cardTemplateId: card.id,
        originHash: card.originHash,
        issueNumber,
        claimedByUserId: userId,
      })
      const created = await tx.cardIssue.create({
        data: {
          cardTemplateId: card.id,
          issueNumber,
          ownerUserId: userId,
          claimedByUserId: userId,
          claimedAt: new Date(),
          issueHash,
          status: 'CLAIMED',
        },
      })
      await tx.cardTemplate.update({ where: { id: card.id }, data: { issuedCount: { increment: 1 } } })
      return created
    })

    await feedService.record({
      type: 'CARD_CLAIMED',
      targetType: 'CARD_ISSUE',
      targetId: issue.id,
      summary: `Card issue #${issue.issueNumber ?? '?'} claimed`,
    })

    return serializeIssue(issue)
  }

  async markCardDownloaded(issueId: string, userId: string, isAdmin = false) {
    const issue = await db.cardIssue.findUnique({ where: { id: issueId } })
    if (!issue) throw { statusCode: 404, message: 'Card issue not found' }
    if (issue.claimedByUserId !== userId && !isAdmin) throw { statusCode: 403, message: 'Forbidden' }
    if (issue.status === 'REVOKED') throw { statusCode: 409, message: 'Revoked card issues cannot be downloaded' }

    const updated = await db.cardIssue.update({
      where: { id: issueId },
      data: { downloadedAt: new Date(), status: 'DOWNLOADED' },
    })

    await feedService.record({
      type: 'CARD_DOWNLOADED',
      targetType: 'CARD_ISSUE',
      targetId: updated.id,
      summary: `Card issue #${updated.issueNumber ?? '?'} downloaded`,
    })

    return serializeIssue(updated)
  }

  private async requireCardTargets(input: Pick<CreateDraftCardInput, 'athleteProfileId' | 'teamId' | 'gameId' | 'sourceImageAssetId'>) {
    const [athlete, team, game, image] = await Promise.all([
      db.athleteProfile.findUnique({ where: { id: input.athleteProfileId }, select: { id: true } }),
      input.teamId ? db.team.findUnique({ where: { id: input.teamId }, select: { id: true } }) : Promise.resolve(true),
      input.gameId ? db.game.findUnique({ where: { id: input.gameId }, select: { id: true } }) : Promise.resolve(true),
      input.sourceImageAssetId
        ? db.imageAsset.findUnique({ where: { id: input.sourceImageAssetId }, select: { id: true } })
        : Promise.resolve(true),
    ])
    if (!athlete) throw { statusCode: 404, message: 'Athlete profile not found' }
    if (!team) throw { statusCode: 404, message: 'Team not found' }
    if (!game) throw { statusCode: 404, message: 'Game not found' }
    if (!image) throw { statusCode: 404, message: 'Source image not found' }
  }

  private async requireOwner(actor: Actor, card: { createdByUserId: string; athleteProfile?: { claimedByUserId: string | null } | null }) {
    if (actor.role === 'ADMIN') return
    if (card.createdByUserId === actor.id) return
    if (card.athleteProfile?.claimedByUserId === actor.id) return
    throw { statusCode: 403, message: 'Forbidden' }
  }

  private async requirePublishPermission(actor: Actor, card: { createdByUserId: string; athleteProfile?: { claimedByUserId: string | null } | null }) {
    await this.requireOwner(actor, card)
  }
}
