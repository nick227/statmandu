import { legacyCardHash as sha256 } from './CardHashes'
import { activeAccount, lockPerson, officialAuthority } from './PublishingAuthority'
import { signManifest } from './ReleaseSigning'
import { releaseAssetDigests } from './ReleaseManifest'
import type { Prisma } from '@prisma/client'
import { requireActiveCreator, requireCardCreator } from './CardAccess'
import { personName, serializePerson } from './PersonService'
import { randomUUID } from 'crypto'
import { db } from '@statman/db'
import type { CardEditionMode, CardTemplateStatus, CardType, CardVisibility, UserRole } from '@statman/db'
import { getCardPoses, getSportDefinition } from '@statman/sports'
import { createCardImageGenerator, CardGenerationError, type CardImageGenerator } from './CardImageGenerator'
import { FeedService } from './FeedService'
import { cardGenerationExecutor, type GenerationExecutor } from '../jobs/GenerationExecutor'

const feedService = new FeedService()

// MVP cost-control defaults for batch generation — not user-configurable
// yet, just reasonable bounds so nobody can trigger unbounded Gemini spend.
const BATCH_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000

const CARD_INCLUDE = {
  athleteProfile: {
    include: {
      players: {
        include: {
          rosterMemberships: {
            where: { isActive: true },
            include: { team: true },
            orderBy: { joinedAt: 'desc' as const },
            take: 1,
          },
        },
      },
    },
  },
  team: true,
  game: { include: { gameTeams: { include: { team: true } }, season: true } },
  frontImageAsset: true,
  sourceImageAsset: true,
  issues: true,
}

type Actor = {
  id: string
  role: UserRole
}

type CreateDraftCardInput = {
  athleteProfileId?: string
  personProfileId?: string
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
  publicationType?: string
  visibility?: CardVisibility
  editionMode?: CardEditionMode
  editionSize?: number | null
}

// Swallows "record to update/delete not found" (Prisma P2025) specifically
// — used for best-effort bookkeeping writes on the fire-and-forget
// generation path, where the row being gone shouldn't turn into an
// unhandled rejection. Any other error still propagates.
async function ignoreRecordNotFound(promise: Promise<unknown>): Promise<void> {
  try {
    await promise
  } catch (err: any) {
    if (err?.code !== 'P2025') throw err
  }
}

// Batch-generated (pose-driven) cards stash their pose prompt in the same
// statsSnapshotJson.cardStudio bag the mobile Card Studio already uses for
// its own draft fields — mirrors cardDisplay.ts's readCardStudioSnapshot on
// the frontend, kept as a small separate copy rather than a shared package
// since the two sides parse the JSON for different reasons.
function readPosePromptTemplate(statsSnapshotJson: unknown): string | null {
  if (!statsSnapshotJson || typeof statsSnapshotJson !== 'object' || Array.isArray(statsSnapshotJson)) return null
  const studio = (statsSnapshotJson as { cardStudio?: unknown }).cardStudio
  if (!studio || typeof studio !== 'object' || Array.isArray(studio)) return null
  const template = (studio as { posePromptTemplate?: unknown }).posePromptTemplate
  return typeof template === 'string' ? template : null
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

// Route-safe summary: playerId lets the frontend link straight to the
// player profile route (Player.id), which athleteProfileId alone can't do
// since AthleteProfile:Player isn't 1:1 in the schema. Picks the first
// Player row (fine for the single-sport demo scope) and that player's
// current active roster team, matching PlayerService's own currentTeam
// derivation so the two stay consistent.
function serializeAthlete(athleteProfile: any) {
  if (!athleteProfile) return null
  const player = athleteProfile.players?.[0]
  const team = player?.rosterMemberships?.[0]?.team
  return {
    athleteProfileId: athleteProfile.id,
    playerId: player?.id ?? null,
    displayName: personName(athleteProfile),
    teamName: team?.name ?? null,
    avatarUrl: athleteProfile.avatarUrl,
  }
}

function serialize(card: any, viewerUserId?: string | null) {
  if (card.templateSnapshotJson?.person) card = { ...card, athleteProfile: { ...card.athleteProfile, ...card.templateSnapshotJson.person } }
  const snapshot = card.contentSnapshotJson
  if (snapshot?.schemaVersion === 1) card = { ...card, title: snapshot.title, athleteProfile: { ...card.athleteProfile, ...snapshot.person }, frontImageAsset: snapshot.frontImage, statsSnapshotJson: snapshot.facts }
  const currentUserIssue = viewerUserId
    ? card.issues?.find((issue: any) => issue.claimedByUserId === viewerUserId && issue.status !== 'REVOKED')
    : null
  return {
    id: card.id,
    templateId: card.templateId,
    templateRevision: card.templateRevision,
    templateSnapshot: card.templateSnapshotJson,
    storefrontId: card.storefrontId,
    personProfileId: card.athleteProfileId,
    person: serializePerson(card.athleteProfile),
    attestation: card.manifestSignature ? { algorithm: 'Ed25519', signer: 'RARE_PLATFORM', keyId: card.signingKeyId, manifestHash: card.manifestHash } : null,
    publicationType: card.publicationType,
    publishedByUserId: card.publishedByUserId,
    contentSnapshotJson: card.contentSnapshotJson,
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
    athlete: snapshot?.presentation?.athlete ?? serializeAthlete(card.athleteProfile),
    team: snapshot?.presentation ? snapshot.presentation.team : card.team
      ? {
          id: card.team.id,
          slug: card.team.slug,
          name: card.team.name,
          logoUrl: card.team.logoUrl,
        }
      : null,
    game: snapshot?.presentation ? snapshot.presentation.game : card.game
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
          seasonName: card.game.season?.name ?? null,
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
          cardTemplateId: currentUserIssue.releaseId,
          releaseId: currentUserIssue.releaseId,
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

function serializeSave(save: any) {
  return {
    id: save.id,
    userId: save.userId,
    cardTemplateId: save.releaseId,
    releaseId: save.releaseId,
    createdAt: save.createdAt,
    card: save.release ? serialize(save.release, save.userId) : null,
  }
}

function serializeIssue(issue: any) {
  const card = issue.release
  return {
    id: issue.id,
    cardTemplateId: issue.releaseId,
    releaseId: issue.releaseId,
    issueNumber: issue.issueNumber,
    ownerUserId: issue.ownerUserId,
    claimedByUserId: issue.claimedByUserId,
    claimedAt: issue.claimedAt,
    downloadedAt: issue.downloadedAt,
    issueHash: issue.issueHash,
    status: issue.status,
    createdAt: issue.createdAt,
    editionMode: card?.editionMode,
    editionSize: card?.editionSize,
    issuedCount: card?.issuedCount,
    originHash: card?.originHash,
  }
}

function authenticityPayload(issue: any) {
  const card = issue.release
  const athlete = card?.athleteProfile
  const json = {
    schema: 'statman.card.authenticity.v1',
    cardTemplateId: issue.releaseId,
    releaseId: issue.releaseId,
    cardTitle: card?.title ?? null,
    athleteProfileId: card?.athleteProfileId ?? null,
    athleteName: card?.contentSnapshotJson?.person?.displayName ?? (athlete ? personName(athlete) : null),
    editionMode: card?.editionMode ?? null,
    editionSize: card?.editionSize ?? null,
    issuedCount: card?.issuedCount ?? null,
    issueNumber: issue.issueNumber,
    originHash: card?.originHash ?? null,
    issueHash: issue.issueHash,
    claimedByUserId: issue.claimedByUserId,
    claimedAt: issue.claimedAt,
    downloadedAt: issue.downloadedAt,
  }
  const text = [
    'Statman Card Authenticity',
    `Card: ${json.cardTitle ?? issue.releaseId}`,
    `Athlete: ${json.athleteName ?? json.athleteProfileId ?? 'Unknown'}`,
    `Edition: ${json.issueNumber ?? 'Unlimited'}${json.editionSize ? ` of ${json.editionSize}` : ''}`,
    `Origin Hash: ${json.originHash ?? 'Unavailable'}`,
    `Issue Hash: ${json.issueHash}`,
    `Claimed At: ${json.claimedAt ? new Date(json.claimedAt).toISOString() : 'Unavailable'}`,
  ].join('\n')
  return { json, text }
}

export class CardService {
  constructor(
    private readonly generator: CardImageGenerator = createCardImageGenerator(),
    private readonly executor: GenerationExecutor = cardGenerationExecutor
  ) {}

  async createDraftCard(userId: string, input: CreateDraftCardInput, tx: Prisma.TransactionClient = db) {
    input = this.normalizeSubject(input)
    await this.requireActiveUser(userId)
    await this.requireCardTargets(input, userId)
    const editionMode = input.editionMode ?? 'UNLIMITED'
    const editionSize = validateEdition(editionMode, input.editionSize)
    const card = await tx.cardRelease.create({
      data: {
        athleteProfileId: input.athleteProfileId!,
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

  // "Athlete uploads a face photo, we generate the standard set of poses
  // for their sport" — creates one private draft CardTemplate per pose and
  // kicks off generation for all of them. Every generation is retained
  // ("waste not want not" — see plan doc) as an ordinary DRAFT/PRIVATE
  // card; nothing here auto-publishes anything, that's a separate curation
  // step the athlete does afterward via the existing publishCard.
  async generateBatch(actor: Actor, athleteProfileId: string, input: { sourceImageAssetId: string; poseIds?: string[]; batchRequestId?: string }) {
    await this.requireActiveUser(actor.id)
    await this.requireCardTargets({ athleteProfileId, sourceImageAssetId: input.sourceImageAssetId }, actor.id)
    const result = await db.$transaction(async (tx) => {
      // Serialize this creator's retries/rate limits across server processes.
      await tx.$queryRaw`SELECT id FROM User WHERE id = ${actor.id} FOR UPDATE`
      if (input.batchRequestId) {
        const cards = await tx.cardRelease.findMany({ where: { athleteProfileId, createdByUserId: actor.id, batchRequestId: input.batchRequestId }, include: CARD_INCLUDE })
        if (cards.length) return { cards, jobs: [] }
      }
      const recent = await tx.cardRelease.findFirst({ where: { createdByUserId: actor.id, batchRequestId: { not: null }, createdAt: { gt: new Date(Date.now() - BATCH_RATE_LIMIT_WINDOW_MS) } } })
      if (recent) throw { statusCode: 429, message: 'Please wait before generating another batch' }
      const active = await tx.cardGenerationJob.findFirst({ where: { status: { in: ['QUEUED', 'PROCESSING'] }, release: { createdByUserId: actor.id, batchRequestId: { not: null } } } })
      if (active) throw { statusCode: 429, message: 'A batch is already generating' }
      const player = await tx.player.findFirst({ where: { athleteProfileId }, include: { sport: true } })
      const allPoses = player && !input.poseIds?.includes('portrait') ? getCardPoses(getSportDefinition(player.sport.slug)) : [{ id: 'portrait', label: 'Portrait', promptTemplate: 'Expressive portrait, natural clothing, neutral studio background, cinematic lighting.' }]
      const poses = input.poseIds?.length ? allPoses.filter(pose => input.poseIds!.includes(pose.id)) : allPoses
      if (!poses.length) throw { statusCode: 400, message: 'No matching poses' }
      const requestId = input.batchRequestId ?? randomUUID()
      const cards = []
      const jobs = []
      for (const pose of poses) {
        const card = await tx.cardRelease.create({ data: { athleteProfileId, createdByUserId: actor.id, title: pose.label, cardType: 'PROFILE', stylePreset: 'classic-foil', sourceImageAssetId: input.sourceImageAssetId, batchRequestId: requestId, generationKey: sha256({ actor: actor.id, subject: athleteProfileId, requestId, pose: pose.id }), status: 'GENERATING', statsSnapshotJson: { cardStudio: { poseId: pose.id, posePromptTemplate: pose.promptTemplate } } }, include: CARD_INCLUDE })
        const generationInput = this.buildGenerationInput(card)
        const job = await tx.cardGenerationJob.create({ data: { releaseId: card.id, provider: process.env.GEMINI_API_KEY ? 'GEMINI' : 'STUB', inputJson: generationInput as any } })
        cards.push(card)
        jobs.push({ job, card, input: generationInput })
      }
      return { cards, jobs }
    })
    for (const { job, card, input: generationInput } of result.jobs) {
      this.executor.enqueue(job.id, () => this.runGenerationJob(job.id, card.id, generationInput, actor.id).then(() => {})).catch(err => console.error('Card generation failed', job.id, err))
    }
    return result.cards.map(card => serialize(card, actor.id))
  }

  async updateDraftCard(actor: Actor, id: string, input: UpdateDraftCardInput) {
    if (input.personProfileId) input = this.normalizeSubject(input)
    const existing = await db.cardRelease.findUnique({ where: { id }, include: { athleteProfile: true } })
    if (!existing) throw { statusCode: 404, message: 'Card not found' }
    await this.requireOwner(actor, existing)

    if (existing.templateId && (input.athleteProfileId || input.personProfileId || input.statsSnapshotJson !== undefined)) throw { statusCode: 409, message: 'Create a new release to change its subject or resolved design' }
    if (existing.publishedAt && input.status === 'ARCHIVED' && Object.keys(input).every(key => key === 'status')) {
      const archived = await db.cardRelease.update({ where: { id }, data: { status: 'ARCHIVED', visibility: 'PRIVATE' }, include: CARD_INCLUDE })
      return serialize(archived, actor.id)
    }
    if (existing.publishedAt) {
      throw { statusCode: 409, message: 'Published content is immutable; create a new card' }
    }

    if (input.athleteProfileId || input.teamId || input.gameId || input.sourceImageAssetId) {
      await this.requireCardTargets({
        athleteProfileId: input.athleteProfileId ?? existing.athleteProfileId,
        teamId: input.teamId === undefined ? existing.teamId : input.teamId,
        gameId: input.gameId === undefined ? existing.gameId : input.gameId,
        sourceImageAssetId: input.sourceImageAssetId === undefined ? existing.sourceImageAssetId : input.sourceImageAssetId,
      } as CreateDraftCardInput, actor.id)
    }

    if (input.status && input.status !== 'ARCHIVED') throw { statusCode: 400, message: 'Use the generation and publishing actions to change lifecycle state' }
    if (input.visibility === 'PUBLIC') throw { statusCode: 400, message: 'Use publish to make a card public' }

    const nextEditionMode = input.editionMode ?? existing.editionMode
    const nextEditionSize = input.editionSize === undefined ? existing.editionSize : input.editionSize
    const editionSize = validateEdition(nextEditionMode, nextEditionSize)

    const card = await db.cardRelease.update({
      where: { id, publishedAt: null, status: { notIn: ['GENERATING', 'ARCHIVED'] } },
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
    const card = await db.cardRelease.findUnique({ where: { id }, include: { athleteProfile: true, sourceImageAsset: true } })
    if (!card) throw { statusCode: 404, message: 'Card not found' }
    await this.requireOwner(actor, card)
    if (card.publishedAt || card.status === 'ARCHIVED') {
      throw { statusCode: 409, message: 'Published or archived cards cannot be regenerated' }
    }

    const input = this.buildGenerationInput(card)
    const job = await this.createGenerationJob(id, input)
    await this.executor.enqueue(job.id, () => this.runGenerationJob(job.id, id, input, actor.id).then(() => {}))
    return this.getCard(id, actor.id, actor.role === 'ADMIN')
  }

  // Re-runs an existing stuck job in place (increments attempt, keeps the
  // same job row) — used by the reconciliation sweep. Not part of the
  // public API; the sweep calls this directly, not through an HTTP route.
  //
  // The claim itself is a conditional atomic update, not a read-then-write:
  // updateMany's `where` repeats the exact status/updatedAt just read, so if
  // two processes (e.g. two server instances both running the sweep) race
  // to retry the same stale job, only the first one's updateMany matches a
  // row (updatedAt is auto-bumped by Prisma's @updatedAt on that write) —
  // the loser's `count` comes back 0 and it bails out without ever calling
  // the generator or touching the card.
  async retryGenerationJob(jobId: string) {
    const job = await db.cardGenerationJob.findUnique({ where: { id: jobId }, include: { release: { include: { athleteProfile: true, sourceImageAsset: true } } } })
    if (!job) return
    const card = job.release
    if (card.publishedAt || card.status === 'ARCHIVED') return

    const claimed = await db.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM CardTemplate WHERE id = ${card.id} FOR UPDATE`
      const current = await tx.cardRelease.findUnique({ where: { id: card.id } })
      if (!current || current.publishedAt || current.status === 'ARCHIVED') return false
      const claim = await tx.cardGenerationJob.updateMany({
        where: { id: jobId, status: { in: ['QUEUED', 'PROCESSING'] }, updatedAt: job.updatedAt },
        data: { status: 'PROCESSING', attempt: { increment: 1 }, provider: process.env.GEMINI_API_KEY ? 'GEMINI' : 'STUB' },
      })
      if (!claim.count) return false
      await tx.cardRelease.update({ where: { id: card.id }, data: { status: 'GENERATING' } })
      return true
    })
    if (!claimed) return

    const input = this.buildGenerationInput(card)
    await this.executor.enqueue(jobId, () => this.runGenerationJob(jobId, card.id, input, card.createdByUserId).then(() => {})).catch((err) => {
      console.error(`Reconciliation retry failed for job ${jobId}`, err)
    })
  }

  private async createGenerationJob(cardTemplateId: string, input: ReturnType<CardService['buildGenerationInput']>) {
    return db.$transaction(async tx => {
      const reserved = await tx.cardRelease.updateMany({ where: { id: cardTemplateId, publishedAt: null, status: { notIn: ['GENERATING', 'ARCHIVED'] } }, data: { status: 'GENERATING' } })
      if (!reserved.count) throw { statusCode: 409, message: 'Card is already generating or immutable' }
      return tx.cardGenerationJob.create({ data: { releaseId: cardTemplateId, provider: process.env.GEMINI_API_KEY ? 'GEMINI' : 'STUB', inputJson: input as any } })
    })
  }

  private buildGenerationInput(card: { templateSnapshotJson?: unknown; id: string; title: string; cardType: string; stylePreset: string; createdByUserId: string; statsSnapshotJson: unknown; athleteProfile: { displayName?: string; firstName: string; lastName: string }; sourceImageAsset: { id: string; url: string } | null }) {
    return {
      cardTemplateId: card.id,
      title: card.title,
      cardType: card.cardType,
      stylePreset: card.stylePreset,
      athleteName: personName((card.templateSnapshotJson as any)?.person ?? card.athleteProfile),
      designSnapshot: card.templateSnapshotJson ?? null,
      createdByUserId: card.createdByUserId,
      sourceImageAssetId: card.sourceImageAsset?.id ?? null,
      sourceImageUrl: card.sourceImageAsset?.url ?? null,
      posePromptTemplate: readPosePromptTemplate(card.statsSnapshotJson),
    }
  }

  // The actual generate → update-job → update-card sequence, shared by a
  // fresh generateCard() call (attempt 1) and retryGenerationJob() (attempt
  // N, same job row) — this is the one place that talks to the provider and
  // records what happened, so observability (latency, model, failure
  // category) can't drift between the two call paths.
  private async runGenerationJob(jobId: string, cardId: string, input: ReturnType<CardService['buildGenerationInput']>, actorId: string) {
    const startedAt = Date.now()
    try {
      await db.cardGenerationJob.update({ where: { id: jobId }, data: { status: 'PROCESSING' } })
      await db.cardRelease.update({ where: { id: cardId, publishedAt: null, status: 'GENERATING' }, data: { status: 'GENERATING' } })
      const output = await this.generator.generate(input)
      const latencyMs = Date.now() - startedAt
      await db.cardGenerationJob.update({
        where: { id: jobId },
        data: { status: 'READY', outputJson: { ...output, latencyMs } as any },
      })
      const updated = await db.cardRelease.update({
        where: { id: cardId, publishedAt: null, status: 'GENERATING' },
        data: { status: 'READY', frontImageAssetId: output.frontImageAssetId },
        include: CARD_INCLUDE,
      })
      return serialize(updated, actorId)
    } catch (err: any) {
      const latencyMs = Date.now() - startedAt
      const failureCategory = err instanceof CardGenerationError ? err.category : 'UNKNOWN'
      // Best-effort bookkeeping: this runs on a fire-and-forget background
      // path (see generateBatch), so if the job/card row is already gone
      // (P2025 — e.g. deleted out from under an in-flight generation) that
      // shouldn't surface as an unhandled rejection on top of the real
      // generation error we're already about to (re)throw.
      await ignoreRecordNotFound(
        db.cardGenerationJob.update({
          where: { id: jobId },
          data: {
            status: 'FAILED',
            error: err?.message ?? 'Generation failed',
            outputJson: { latencyMs, failureCategory } as any,
          },
        })
      )
      await ignoreRecordNotFound(db.cardRelease.updateMany({ where: { id: cardId, publishedAt: null, status: 'GENERATING' }, data: { status: 'FAILED' } }))
      throw err
    }
  }

  async publishCard(actor: Actor, id: string, options: PublishOptions = {}) {
    if (options.publicationType && !['COMMUNITY', 'OFFICIAL'].includes(options.publicationType)) throw { statusCode: 400, message: 'Invalid publication classification' }
    await this.requireActiveUser(actor.id)
    const card = await db.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM CardTemplate WHERE id = ${id} FOR UPDATE`
      const existing = await tx.cardRelease.findUnique({ where: { id }, include: CARD_INCLUDE })
      if (!existing) throw { statusCode: 404, message: 'Card not found' }
      await lockPerson(tx, existing.athleteProfileId)
      const publisher = await activeAccount(tx, actor.id)
      if (publisher.role !== 'ADMIN' && existing.createdByUserId !== actor.id) throw { statusCode: 403, message: 'Forbidden' }
      const publicationType = (options.publicationType ?? 'COMMUNITY') as 'COMMUNITY' | 'OFFICIAL'
      const authority = publicationType === 'OFFICIAL' ? await officialAuthority(tx, existing.athleteProfileId, actor.id) : null
      if (publicationType === 'OFFICIAL' && (!authority || existing.createdByUserId !== actor.id)) throw { statusCode: 403, message: 'Official self-publishing requires a current reviewed claim and your own release' }
      if (existing.publishedAt || ['ARCHIVED', 'GENERATING'].includes(existing.status)) throw { statusCode: 409, message: 'Card cannot be published in this state' }
      const editionMode = options.editionMode ?? existing.editionMode
      const editionSize = validateEdition(editionMode, options.editionSize === undefined ? existing.editionSize : options.editionSize)
      const storefront = await tx.storefront.upsert({ where: { userId: existing.createdByUserId }, update: {}, create: { userId: existing.createdByUserId } })
      const presentation = serialize(existing)
      const snapshot = {
        schemaVersion: 1,
        presentation: { athlete: presentation.athlete, team: presentation.team, game: presentation.game },
        title: existing.title,
        person: (existing.templateSnapshotJson as any)?.person ?? serializePerson(existing.athleteProfile),
        ...(existing.templateSnapshotJson ? { design: existing.templateSnapshotJson } : {}),
        frontImage: existing.frontImageAsset ? { id: existing.frontImageAsset.id, url: existing.frontImageAsset.url } : null,
        facts: existing.statsSnapshotJson,
        createdByUserId: existing.createdByUserId,
        publishedByUserId: actor.id,
        publicationType,
      }
      const originHash = sha256({ schemaVersion: 2, cardTemplateId: id, editionMode, editionSize, content: snapshot })
      const assets = await releaseAssetDigests(tx, existing)
      const publishedAt = new Date()
      const authorization = authority ? { basis: 'REVIEWED_SELF_CLAIM', policyVersion: 1, claimId: authority.id, personProfileId: existing.athleteProfileId, userId: actor.id, approvedAt: authority.publishingApprovedAt!.toISOString(), reviewedByUserId: authority.publishingApprovedByUserId } : null
      const signed = signManifest({ schemaVersion: 1, releaseId: id, personProfileId: existing.athleteProfileId, createdByUserId: existing.createdByUserId, publishedByUserId: actor.id, publicationType, content: snapshot, edition: { mode: editionMode, size: editionSize }, rendererVersion: (existing.templateSnapshotJson as any)?.rendererVersion ?? 'legacy-card-v1', assets, publishedAt: publishedAt.toISOString(), publicationVisibility: options.visibility ?? 'PUBLIC', authorization, originHash })
      return tx.cardRelease.update({ where: { id }, data: { ...signed, attestationVersion: 1, authorizationClaimId: authority?.id ?? null, storefrontId: storefront.id, status: 'PUBLISHED', visibility: options.visibility ?? 'PUBLIC', editionMode, editionSize, originHash, publishedAt, publishedByUserId: actor.id, publicationType, contentSnapshotJson: snapshot as any }, include: CARD_INCLUDE })
    // The release read above must not pin a pre-revocation authority snapshot.
    }, { timeout: 30000, isolationLevel: 'ReadCommitted' })
    await feedService.record({ type: 'CARD_PUBLISHED', targetType: 'CARD_TEMPLATE', targetId: card.id, summary: `Card published: ${card.title}` })
    return serialize(card, actor.id)
  }

  async listRecentPublicCards(viewerUserId?: string | null, sort: 'recent' | 'popular' = 'recent') {
    const orderBy =
      sort === 'popular'
        ? [{ downloadEvents: { _count: 'desc' as const } }, { publishedAt: 'desc' as const }, { id: 'desc' as const }]
        : [{ publishedAt: 'desc' as const }, { id: 'desc' as const }]
    const cards = await db.cardRelease.findMany({
      where: { status: 'PUBLISHED', visibility: 'PUBLIC' },
      orderBy,
      take: 20,
      include: CARD_INCLUDE,
    })
    return cards.map((card) => serialize(card, viewerUserId))
  }

  async listCardsForAthlete(athleteProfileId: string, viewerUserId?: string | null, isAdmin = false) {
    const athlete = await db.personProfile.findUnique({ where: { id: athleteProfileId }, select: { id: true, claimedByUserId: true } })
    if (!athlete) throw { statusCode: 404, message: 'Athlete profile not found' }
    const canSeePrivate = isAdmin
    const where = canSeePrivate
      ? { athleteProfileId }
      : {
          athleteProfileId,
          OR: [
            { status: 'PUBLISHED' as const, visibility: 'PUBLIC' as const },
            ...(viewerUserId ? [{ createdByUserId: viewerUserId }] : []),
          ],
        }
    const cards = await db.cardRelease.findMany({
      where,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      include: CARD_INCLUDE,
    })
    return cards.map((card) => serialize(card, viewerUserId))
  }

  async listCardsForUser(userId: string) {
    const [created, issues] = await Promise.all([
      db.cardRelease.findMany({
        where: { createdByUserId: userId },
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        include: CARD_INCLUDE,
      }),
      db.cardIssue.findMany({
        where: { claimedByUserId: userId, status: { not: 'REVOKED' } },
        orderBy: { createdAt: 'desc' },
        include: { release: { include: CARD_INCLUDE } },
      }),
    ])
    return {
      created: created.map((card) => serialize(card, userId)),
      claimed: issues.map((issue) => ({
        issue: serializeIssue(issue),
        card: serialize(issue.release, userId),
      })),
    }
  }

  async getCard(id: string, viewerUserId?: string | null, isAdmin = false, tx: Prisma.TransactionClient = db) {
    const card = await tx.cardRelease.findUnique({ where: { id }, include: CARD_INCLUDE })
    if (!card) throw { statusCode: 404, message: 'Card not found' }
    if ((card.visibility !== 'PUBLIC' || card.status !== 'PUBLISHED') && card.createdByUserId !== viewerUserId && !isAdmin) {
      throw { statusCode: 404, message: 'Card not found' }
    }
    return serialize(card, viewerUserId)
  }

  async claimCard(id: string, userId: string) {
    await this.requireActiveUser(userId)
    const issue = await db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM CardTemplate WHERE id = ${id} FOR UPDATE`
      const card = await tx.cardRelease.findUnique({ where: { id } })
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
          releaseId: card.id,
          issueNumber,
          ownerUserId: userId,
          claimedByUserId: userId,
          claimedAt: new Date(),
          issueHash,
          status: 'CLAIMED',
        },
      })
      await tx.cardRelease.update({ where: { id: card.id }, data: { issuedCount: { increment: 1 } } })
      return tx.cardIssue.findUniqueOrThrow({
        where: { id: created.id },
        include: { release: true },
      })
    })

    await feedService.record({
      type: 'CARD_CLAIMED',
      targetType: 'CARD_ISSUE',
      targetId: issue.id,
      summary: `Card issue #${issue.issueNumber ?? '?'} claimed`,
    })

    return serializeIssue(issue)
  }

  async markCardDownloaded(issueId: string, userId: string, isAdmin = false, context?: string) {
    const issue = await db.cardIssue.findUnique({ where: { id: issueId } })
    if (!issue) throw { statusCode: 404, message: 'Card issue not found' }
    if (issue.claimedByUserId !== userId && !isAdmin) throw { statusCode: 403, message: 'Forbidden' }
    if (issue.status === 'REVOKED') throw { statusCode: 409, message: 'Revoked card issues cannot be downloaded' }

    const updated = await db.cardIssue.update({
      where: { id: issueId },
      data: { downloadedAt: new Date(), status: 'DOWNLOADED' },
      include: { release: { include: { athleteProfile: true } } },
    })

    // Every download call is logged, even repeat downloads of the same
    // issue — CardIssue.downloadedAt only ever holds the most recent one,
    // this is the actual distribution history behind the analytics panel.
    await db.cardDownloadEvent.create({
      data: {
        releaseId: updated.releaseId,
        cardIssueId: updated.id,
        downloadedByUserId: userId,
        context: (context as any) ?? 'DIRECT',
      },
    })

    await feedService.record({
      type: 'CARD_DOWNLOADED',
      targetType: 'CARD_ISSUE',
      targetId: updated.id,
      summary: `Card issue #${updated.issueNumber ?? '?'} downloaded`,
    })

    return {
      issue: serializeIssue(updated),
      authenticity: authenticityPayload(updated),
    }
  }

  // "Athletes want to know how many cards were downloaded and from
  // where" — owner-only (same permission shape as generateBatch: ADMIN or
  // the claiming user), aggregated from every CardDownloadEvent ever
  // logged for this athlete's cards, not just the latest per issue.
  async getDistribution(actor: Actor, athleteProfileId: string) {
    const athleteProfile = await db.personProfile.findUnique({ where: { id: athleteProfileId } })
    if (!athleteProfile) throw { statusCode: 404, message: 'Athlete profile not found' }
    const events = await db.cardDownloadEvent.findMany({
      where: { release: { athleteProfileId, ...(actor.role === 'ADMIN' ? {} : { createdByUserId: actor.id }) } },
      include: { release: { include: CARD_INCLUDE } },
    })

    const totalDownloads = events.length
    const uniqueDownloaders = new Set(events.map((event) => event.downloadedByUserId)).size

    const contextCounts = new Map<string, number>()
    for (const event of events) {
      contextCounts.set(event.context, (contextCounts.get(event.context) ?? 0) + 1)
    }
    const byContext = Array.from(contextCounts.entries()).map(([context, count]) => ({ context, count }))

    const cardCounts = new Map<string, { card: (typeof events)[number]['release']; count: number }>()
    for (const event of events) {
      const existing = cardCounts.get(event.releaseId)
      if (existing) existing.count += 1
      else cardCounts.set(event.releaseId, { card: event.release, count: 1 })
    }
    const byCard = Array.from(cardCounts.values())
      .sort((a, b) => b.count - a.count)
      .map(({ card, count }) => ({ card: serialize(card, actor.id), count }))

    return { totalDownloads, uniqueDownloaders, byContext, byCard }
  }

  // Lightweight save/collect — idempotent (upsert), same toggle shape as
  // SocialService.createFollow. The prerequisite for a personal
  // "Collections" view before any trading/rarity/marketplace concept.
  async saveCard(userId: string, cardTemplateId: string) {
    await this.requireActiveUser(userId)
    await this.getCard(cardTemplateId, userId)
    const save = await db.cardSave.upsert({
      where: { userId_releaseId: { userId, releaseId: cardTemplateId } },
      update: {},
      create: { userId, releaseId: cardTemplateId },
      include: { release: { include: CARD_INCLUDE } },
    })
    return serializeSave(save)
  }

  async unsaveCard(userId: string, saveId: string) {
    const save = await db.cardSave.findUnique({ where: { id: saveId } })
    if (!save) throw { statusCode: 404, message: 'Card save not found' }
    if (save.userId !== userId) throw { statusCode: 403, message: 'Not the owner of this save' }
    await db.cardSave.delete({ where: { id: saveId } })
  }

  async listMySavedCards(userId: string) {
    const saves = await db.cardSave.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { release: { include: CARD_INCLUDE } },
    })
    return saves.map((save) => serializeSave(save))
  }

  private normalizeSubject<T extends { athleteProfileId?: string; personProfileId?: string }>(input: T): T & { athleteProfileId: string } {
    if (input.personProfileId && input.athleteProfileId && input.personProfileId !== input.athleteProfileId) throw { statusCode: 400, message: 'Conflicting subject IDs' }
    const id = input.personProfileId ?? input.athleteProfileId
    if (!id) throw { statusCode: 400, message: 'Person is required' }
    return { ...input, athleteProfileId: id }
  }

  private async requireActiveUser(id: string) {
    await requireActiveCreator(id)
  }

  private async requireCardTargets(input: Pick<CreateDraftCardInput, 'athleteProfileId' | 'teamId' | 'gameId' | 'sourceImageAssetId'>, actorId: string) {
    const [athlete, team, game, image] = await Promise.all([
      db.personProfile.findUnique({ where: { id: input.athleteProfileId, deletedAt: null }, select: { id: true } }),
      input.teamId ? db.team.findUnique({ where: { id: input.teamId }, select: { id: true } }) : Promise.resolve(true),
      input.gameId ? db.game.findUnique({ where: { id: input.gameId }, select: { id: true } }) : Promise.resolve(true),
      input.sourceImageAssetId
        ? db.imageAsset.findUnique({ where: { id: input.sourceImageAssetId, deletedAt: null }, select: { id: true, targetType: true, targetId: true, uploadedByUserId: true } })
        : Promise.resolve(true),
    ])
    if (!athlete) throw { statusCode: 404, message: 'Athlete profile not found' }
    if (!team) throw { statusCode: 404, message: 'Team not found' }
    if (!game) throw { statusCode: 404, message: 'Game not found' }
    if (!image) throw { statusCode: 404, message: 'Source image not found' }
    // Existence alone isn't authorization — without this, any authenticated
    // user could point sourceImageAssetId at an image that belongs to a
    // different athlete (or a non-photo target entirely) and generate cards
    // from it. The frontend has only ever offered the athlete's own gallery,
    // so this can't reject a legitimate flow.
    if (typeof image === 'object' && (image.targetType !== 'ATHLETE_PROFILE' || image.targetId !== input.athleteProfileId || image.uploadedByUserId !== actorId)) {
      throw { statusCode: 403, message: 'Source image does not belong to this athlete profile' }
    }
  }

  private async requireOwner(actor: Actor, card: { createdByUserId: string }) {
    await requireCardCreator(actor, card.createdByUserId)
  }

  private async requirePublishPermission(actor: Actor, card: { createdByUserId: string; athleteProfile?: { claimedByUserId: string | null } | null }) {
    await this.requireOwner(actor, card)
  }
}
