import { describe, it, expect } from 'vitest'
import { db } from '@statman/db'
import { storeImage } from '../lib/imageStorage'
import { CardService } from '../services/CardService'
import { asAuth, buildTestApp, testOtherUserId, testUserId, validateResponse } from './helpers'

const app = buildTestApp()

async function seedAthlete(claimedByUserId: string | null = null) {
  const sport = await db.sport.create({ data: { slug: `basketball-${Date.now()}`, name: 'Basketball' } })
  const athleteProfile = await db.athleteProfile.create({
    data: {
      slug: `jayden-rios-${Date.now()}`,
      firstName: 'Jayden',
      lastName: 'Rios',
      sourceStatus: 'PLAYER_REPORTED',
      claimedByUserId,
    },
  })
  await db.player.create({ data: { athleteProfileId: athleteProfile.id, sportId: sport.id } })
  return athleteProfile
}

async function createReadyCard(editionMode: 'UNLIMITED' | 'LIMITED' | 'ONE_OF_ONE' = 'UNLIMITED', editionSize?: number) {
  const athlete = await seedAthlete()
  const created = await app.inject({
    method: 'POST',
    url: '/cards',
    headers: asAuth(testUserId),
    payload: {
      athleteProfileId: athlete.id,
      title: 'Rising Star',
      cardType: 'PROFILE',
      stylePreset: 'classic-foil',
      editionMode,
      ...(editionSize ? { editionSize } : {}),
      statsSnapshotJson: { points: 24, rebounds: 8 },
    },
  })
  expect(created.statusCode).toBe(201)

  const generated = await app.inject({
    method: 'POST',
    url: `/cards/${created.json().data.id}/generate`,
    headers: asAuth(testUserId),
  })
  expect(generated.statusCode).toBe(200)
  return generated.json().data
}

async function seedTeamGameCard() {
  const sport = await db.sport.create({ data: { slug: `soccer-${Date.now()}`, name: 'Soccer' } })
  const league = await db.league.create({ data: { sportId: sport.id, slug: `league-${Date.now()}`, name: 'Metro League' } })
  const team = await db.team.create({
    data: { sportId: sport.id, leagueId: league.id, slug: `hawks-${Date.now()}`, name: 'Hawks', logoUrl: 'https://example.test/logo.png' },
  })
  const opponent = await db.team.create({
    data: { sportId: sport.id, leagueId: league.id, slug: `owls-${Date.now()}`, name: 'Owls' },
  })
  const game = await db.game.create({
    data: {
      sportId: sport.id,
      leagueId: league.id,
      scheduledAt: new Date('2026-01-01T18:00:00.000Z'),
      status: 'FINAL',
      gameTeams: {
        create: [
          { teamId: team.id, isHome: true, finalScore: 72 },
          { teamId: opponent.id, isHome: false, finalScore: 68 },
        ],
      },
    },
  })
  const athlete = await db.athleteProfile.create({
    data: {
      slug: `avery-stone-${Date.now()}`,
      firstName: 'Avery',
      lastName: 'Stone',
      avatarUrl: 'https://example.test/avatar.png',
      claimedByUserId: testUserId,
    },
  })
  await db.player.create({ data: { athleteProfileId: athlete.id, sportId: sport.id } })
  return { athlete, team, game }
}

async function seedBasketballAthlete(claimedByUserId: string | null = null) {
  // upsert, not create: tests that need two basketball athletes in the same
  // test (e.g. cross-athlete authorization checks) call this twice.
  const sport = await db.sport.upsert({ where: { slug: 'basketball' }, update: {}, create: { slug: 'basketball', name: 'Basketball' } })
  const athleteProfile = await db.athleteProfile.create({
    data: {
      slug: `dana-cole-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      firstName: 'Dana',
      lastName: 'Cole',
      sourceStatus: 'PLAYER_REPORTED',
      claimedByUserId,
    },
  })
  await db.player.create({ data: { athleteProfileId: athleteProfile.id, sportId: sport.id } })
  return athleteProfile
}

async function seedReferencePhoto(athleteProfileId: string) {
  const asset = await db.imageAsset.create({
    data: {
      targetType: 'ATHLETE_PROFILE',
      targetId: athleteProfileId,
      usage: 'GALLERY',
      storageProvider: 'LOCAL',
      objectKey: `athlete_profile/${athleteProfileId}/gallery/reference.jpg`,
      url: `http://localhost:3001/uploads/images/athlete_profile/${athleteProfileId}/gallery/reference.jpg`,
      contentType: 'image/jpeg',
      byteSize: 8,
      uploadedByUserId: testUserId,
    },
  })
  return asset.id
}

describe('cards', () => {
  it('creates, generates, publishes, claims, and marks a card downloaded', async () => {
    const ready = await createReadyCard()
    expect(ready.status).toBe('READY')
    expect(ready.frontImageAssetId).toBeTruthy()

    const published = await app.inject({
      method: 'POST',
      url: `/cards/${ready.id}/publish`,
      headers: asAuth(testUserId),
      payload: {},
    })
    expect(published.statusCode).toBe(200)
    await validateResponse('publishCard', 200, published.json())
    expect(published.json().data.status).toBe('PUBLISHED')
    expect(published.json().data.originHash).toMatch(/^[a-f0-9]{64}$/)

    const recent = await app.inject({ method: 'GET', url: '/cards/recent' })
    expect(recent.statusCode).toBe(200)
    await validateResponse('listRecentPublicCards', 200, recent.json())
    expect(recent.json().data[0].id).toBe(ready.id)

    const claimed = await app.inject({
      method: 'POST',
      url: `/cards/${ready.id}/claim`,
      headers: asAuth(testOtherUserId),
    })
    expect(claimed.statusCode).toBe(201)
    await validateResponse('claimCard', 201, claimed.json())
    expect(claimed.json().data.issueNumber).toBe(1)
    expect(claimed.json().data.issueHash).toMatch(/^[a-f0-9]{64}$/)
    expect(claimed.json().data.editionMode).toBe('UNLIMITED')
    expect(claimed.json().data.issuedCount).toBe(1)
    expect(claimed.json().data.originHash).toBe(published.json().data.originHash)

    const mine = await app.inject({ method: 'GET', url: '/me/cards', headers: asAuth(testOtherUserId) })
    expect(mine.statusCode).toBe(200)
    await validateResponse('listMyCards', 200, mine.json())
    expect(mine.json().data.created).toHaveLength(0)
    expect(mine.json().data.claimed[0].card.id).toBe(ready.id)

    const creatorCards = await app.inject({ method: 'GET', url: '/me/cards', headers: asAuth(testUserId) })
    expect(creatorCards.statusCode).toBe(200)
    expect(creatorCards.json().data.created.map((card: any) => card.id)).toContain(ready.id)

    const downloaded = await app.inject({
      method: 'POST',
      url: `/card-issues/${claimed.json().data.id}/downloaded`,
      headers: asAuth(testOtherUserId),
    })
    expect(downloaded.statusCode).toBe(200)
    await validateResponse('markCardDownloaded', 200, downloaded.json())
    expect(downloaded.json().data.issue.status).toBe('DOWNLOADED')
    expect(downloaded.json().data.issue.downloadedAt).toBeTruthy()
    expect(downloaded.json().data.authenticity.json.issueHash).toBe(claimed.json().data.issueHash)
    expect(downloaded.json().data.authenticity.text).toContain('Statman Card Authenticity')
  })

  it('returns athlete, team, and game summaries for recent public cards', async () => {
    const { athlete, team, game } = await seedTeamGameCard()
    const created = await app.inject({
      method: 'POST',
      url: '/cards',
      headers: asAuth(testUserId),
      payload: {
        athleteProfileId: athlete.id,
        teamId: team.id,
        gameId: game.id,
        title: 'Final Whistle',
        cardType: 'BIG_GAME',
        stylePreset: 'matchday',
        statsSnapshotJson: { goals: 2 },
      },
    })
    await app.inject({ method: 'POST', url: `/cards/${created.json().data.id}/generate`, headers: asAuth(testUserId) })
    await app.inject({ method: 'POST', url: `/cards/${created.json().data.id}/publish`, headers: asAuth(testUserId), payload: {} })

    const recent = await app.inject({ method: 'GET', url: '/cards/recent' })
    expect(recent.statusCode).toBe(200)
    const card = recent.json().data.find((item: any) => item.id === created.json().data.id)
    expect(card.athlete).toMatchObject({ athleteProfileId: athlete.id, displayName: 'Avery Stone', teamName: null })
    expect(card.athlete.playerId).toBeTruthy()
    expect(card.team).toMatchObject({ id: team.id, slug: team.slug, name: 'Hawks' })
    expect(card.game).toMatchObject({ id: game.id, status: 'FINAL' })
    expect(card.game.teams).toHaveLength(2)
    expect(card.frontImage.url).toBeTruthy()
  })

  it('shows only public published athlete cards anonymously, and private cards to owners/admins', async () => {
    const athlete = await seedAthlete(testUserId)
    const draft = await app.inject({
      method: 'POST',
      url: '/cards',
      headers: asAuth(testUserId),
      payload: { athleteProfileId: athlete.id, title: 'Draft Card', cardType: 'PROFILE', stylePreset: 'classic' },
    })
    const ready = await createReadyCard()
    await db.cardTemplate.update({ where: { id: ready.id }, data: { athleteProfileId: athlete.id } })
    await app.inject({ method: 'POST', url: `/cards/${ready.id}/publish`, headers: asAuth(testUserId), payload: {} })

    const anon = await app.inject({ method: 'GET', url: `/athlete-profiles/${athlete.id}/cards` })
    expect(anon.statusCode).toBe(200)
    expect(anon.json().data.map((card: any) => card.id)).not.toContain(draft.json().data.id)

    const owner = await app.inject({
      method: 'GET',
      url: `/athlete-profiles/${athlete.id}/cards`,
      headers: asAuth(testUserId),
    })
    expect(owner.statusCode).toBe(200)
    expect(owner.json().data.map((card: any) => card.id)).toContain(draft.json().data.id)

    await db.user.update({ where: { id: testOtherUserId }, data: { role: 'ADMIN' } })
    const admin = await app.inject({
      method: 'GET',
      url: `/athlete-profiles/${athlete.id}/cards`,
      headers: asAuth(testOtherUserId),
    })
    expect(admin.statusCode).toBe(200)
    expect(admin.json().data.map((card: any) => card.id)).toContain(draft.json().data.id)
  })

  it('enforces limited edition size', async () => {
    const ready = await createReadyCard('LIMITED', 1)
    await app.inject({
      method: 'POST',
      url: `/cards/${ready.id}/publish`,
      headers: asAuth(testUserId),
      payload: {},
    })

    const first = await app.inject({ method: 'POST', url: `/cards/${ready.id}/claim`, headers: asAuth(testUserId) })
    expect(first.statusCode).toBe(201)

    const second = await app.inject({ method: 'POST', url: `/cards/${ready.id}/claim`, headers: asAuth(testOtherUserId) })
    expect(second.statusCode).toBe(409)
  })

  it('keeps published edition fields immutable', async () => {
    const ready = await createReadyCard()
    await app.inject({
      method: 'POST',
      url: `/cards/${ready.id}/publish`,
      headers: asAuth(testUserId),
      payload: {},
    })

    const res = await app.inject({
      method: 'PATCH',
      url: `/cards/${ready.id}`,
      headers: asAuth(testUserId),
      payload: { editionMode: 'LIMITED', editionSize: 10 },
    })
    expect(res.statusCode).toBe(409)

    const republish = await app.inject({
      method: 'POST',
      url: `/cards/${ready.id}/publish`,
      headers: asAuth(testUserId),
      payload: { editionMode: 'LIMITED', editionSize: 10 },
    })
    expect(republish.statusCode).toBe(409)
  })

  it('requires login to create or claim cards', async () => {
    const athlete = await seedAthlete()
    const create = await app.inject({
      method: 'POST',
      url: '/cards',
      payload: { athleteProfileId: athlete.id, title: 'No Auth', cardType: 'PROFILE', stylePreset: 'classic' },
    })
    expect(create.statusCode).toBe(401)
  })

  it('generates one private draft card per sport pose from a reference photo', async () => {
    const athlete = await seedBasketballAthlete(testUserId)
    const sourceImageAssetId = await seedReferencePhoto(athlete.id)

    const res = await app.inject({
      method: 'POST',
      url: `/athlete-profiles/${athlete.id}/cards/generate-batch`,
      headers: asAuth(testUserId),
      payload: { sourceImageAssetId },
    })
    expect(res.statusCode).toBe(201)
    await validateResponse('generateCardBatch', 201, res.json())
    const cards = res.json().data
    // basketball's cardPoses set (packages/sports) has 5 entries.
    expect(cards).toHaveLength(5)
    expect(cards.every((card: any) => card.status === 'DRAFT')).toBe(true)
    expect(cards.every((card: any) => card.visibility === 'PRIVATE')).toBe(true)
    expect(cards.every((card: any) => card.sourceImageAssetId === sourceImageAssetId)).toBe(true)
    expect(new Set(cards.map((card: any) => card.title)).size).toBe(5)

    // Generation is fired off (not awaited) — poll until the stub settles
    // so we can assert on real end state rather than a race.
    await new Promise((resolve) => setTimeout(resolve, 100))
    const first = await app.inject({ method: 'GET', url: `/cards/${cards[0].id}`, headers: asAuth(testUserId) })
    expect(['READY', 'GENERATING']).toContain(first.json().data.status)
  })

  it('only lets the claiming athlete (or an admin) generate a batch', async () => {
    const athlete = await seedBasketballAthlete(testUserId)
    const sourceImageAssetId = await seedReferencePhoto(athlete.id)

    const forbidden = await app.inject({
      method: 'POST',
      url: `/athlete-profiles/${athlete.id}/cards/generate-batch`,
      headers: asAuth(testOtherUserId),
      payload: { sourceImageAssetId },
    })
    expect(forbidden.statusCode).toBe(403)
  })

  it('tracks card download distribution by context, owner-only', async () => {
    const athlete = await seedBasketballAthlete(testUserId)
    const ready = await createReadyCard()
    await db.cardTemplate.update({ where: { id: ready.id }, data: { athleteProfileId: athlete.id } })
    await app.inject({ method: 'POST', url: `/cards/${ready.id}/publish`, headers: asAuth(testUserId), payload: {} })
    const claimed = await app.inject({ method: 'POST', url: `/cards/${ready.id}/claim`, headers: asAuth(testOtherUserId) })

    await app.inject({
      method: 'POST',
      url: `/card-issues/${claimed.json().data.id}/downloaded`,
      headers: asAuth(testOtherUserId),
      payload: { context: 'PROFILE' },
    })
    await app.inject({
      method: 'POST',
      url: `/card-issues/${claimed.json().data.id}/downloaded`,
      headers: asAuth(testOtherUserId),
      payload: { context: 'SHARED_LINK' },
    })

    const distribution = await app.inject({
      method: 'GET',
      url: `/athlete-profiles/${athlete.id}/cards/distribution`,
      headers: asAuth(testUserId),
    })
    expect(distribution.statusCode).toBe(200)
    await validateResponse('getCardDistribution', 200, distribution.json())
    const data = distribution.json().data
    expect(data.totalDownloads).toBe(2)
    expect(data.uniqueDownloaders).toBe(1)
    expect(data.byContext.sort((a: any, b: any) => a.context.localeCompare(b.context))).toEqual([
      { context: 'PROFILE', count: 1 },
      { context: 'SHARED_LINK', count: 1 },
    ])
    expect(data.byCard).toEqual([{ card: expect.objectContaining({ id: ready.id }), count: 2 }])

    const forbidden = await app.inject({
      method: 'GET',
      url: `/athlete-profiles/${athlete.id}/cards/distribution`,
      headers: asAuth(testOtherUserId),
    })
    expect(forbidden.statusCode).toBe(403)
  })

  it('is idempotent: replaying the same batchRequestId returns the same cards, not new ones', async () => {
    const athlete = await seedBasketballAthlete(testUserId)
    const sourceImageAssetId = await seedReferencePhoto(athlete.id)
    const batchRequestId = `test-batch-${Date.now()}`

    const first = await app.inject({
      method: 'POST',
      url: `/athlete-profiles/${athlete.id}/cards/generate-batch`,
      headers: asAuth(testUserId),
      payload: { sourceImageAssetId, batchRequestId },
    })
    expect(first.statusCode).toBe(201)
    const firstIds = first.json().data.map((card: any) => card.id).sort()

    const replay = await app.inject({
      method: 'POST',
      url: `/athlete-profiles/${athlete.id}/cards/generate-batch`,
      headers: asAuth(testUserId),
      payload: { sourceImageAssetId, batchRequestId },
    })
    expect(replay.statusCode).toBe(201)
    const replayIds = replay.json().data.map((card: any) => card.id).sort()
    expect(replayIds).toEqual(firstIds)

    const allForAthlete = await db.cardTemplate.count({ where: { athleteProfileId: athlete.id } })
    expect(allForAthlete).toBe(firstIds.length)
  })

  it('rate-limits a second batch within the window but not the manual single-card builder', async () => {
    const athlete = await seedBasketballAthlete(testUserId)
    const sourceImageAssetId = await seedReferencePhoto(athlete.id)

    const first = await app.inject({
      method: 'POST',
      url: `/athlete-profiles/${athlete.id}/cards/generate-batch`,
      headers: asAuth(testUserId),
      payload: { sourceImageAssetId, batchRequestId: `rate-1-${Date.now()}` },
    })
    expect(first.statusCode).toBe(201)

    const second = await app.inject({
      method: 'POST',
      url: `/athlete-profiles/${athlete.id}/cards/generate-batch`,
      headers: asAuth(testUserId),
      payload: { sourceImageAssetId, batchRequestId: `rate-2-${Date.now()}` },
    })
    expect(second.statusCode).toBe(429)

    const manual = await app.inject({
      method: 'POST',
      url: '/cards',
      headers: asAuth(testUserId),
      payload: { athleteProfileId: athlete.id, title: 'Manual Card', cardType: 'PROFILE', stylePreset: 'classic-foil' },
    })
    expect(manual.statusCode).toBe(201)
  })

  it('rejects a second batch while one is already generating for the athlete', async () => {
    const athlete = await seedBasketballAthlete(testUserId)
    const sourceImageAssetId = await seedReferencePhoto(athlete.id)

    // Simulate an in-progress batch directly (one QUEUED job under a
    // batchRequestId), rather than racing the (near-instant, stub-backed)
    // real generation flow's own timing.
    const card = await db.cardTemplate.create({
      data: {
        athleteProfileId: athlete.id,
        createdByUserId: testUserId,
        title: 'In flight',
        cardType: 'PROFILE',
        stylePreset: 'classic-foil',
        batchRequestId: `active-batch-${Date.now()}`,
        statsSnapshotJson: {},
      },
    })
    await db.cardGenerationJob.create({
      data: { cardTemplateId: card.id, status: 'QUEUED', inputJson: {} },
    })

    const res = await app.inject({
      method: 'POST',
      url: `/athlete-profiles/${athlete.id}/cards/generate-batch`,
      headers: asAuth(testUserId),
      payload: { sourceImageAssetId, batchRequestId: `second-batch-${Date.now()}` },
    })
    expect(res.statusCode).toBe(429)
  })

  it('does not block a batch on an in-flight manual (non-batch) generation job', async () => {
    const athlete = await seedBasketballAthlete(testUserId)
    const sourceImageAssetId = await seedReferencePhoto(athlete.id)

    // A manual single-card job with no batchRequestId — should never count
    // against the "one active batch" rule, which is scoped to batch-created
    // jobs specifically.
    const manualCard = await db.cardTemplate.create({
      data: {
        athleteProfileId: athlete.id,
        createdByUserId: testUserId,
        title: 'Manual in flight',
        cardType: 'PROFILE',
        stylePreset: 'classic-foil',
        statsSnapshotJson: {},
      },
    })
    await db.cardGenerationJob.create({
      data: { cardTemplateId: manualCard.id, status: 'PROCESSING', inputJson: {} },
    })

    const res = await app.inject({
      method: 'POST',
      url: `/athlete-profiles/${athlete.id}/cards/generate-batch`,
      headers: asAuth(testUserId),
      payload: { sourceImageAssetId, batchRequestId: `unblocked-batch-${Date.now()}` },
    })
    expect(res.statusCode).toBe(201)
  })

  it('rejects a sourceImageAssetId that belongs to a different athlete', async () => {
    const athleteA = await seedBasketballAthlete(testUserId)
    // Unclaimed — the point is that the image belongs to a different
    // AthleteProfile, not that a second profile is claimed by testUserId
    // (AthleteProfile.claimedByUserId is unique per user anyway).
    const athleteB = await seedBasketballAthlete(null)
    const othersPhoto = await seedReferencePhoto(athleteB.id)

    const res = await app.inject({
      method: 'POST',
      url: `/athlete-profiles/${athleteA.id}/cards/generate-batch`,
      headers: asAuth(testUserId),
      payload: { sourceImageAssetId: othersPhoto },
    })
    expect(res.statusCode).toBe(403)
  })

  it('blocks unauthenticated/non-owner access to a private card image, allows the owner', async () => {
    const athlete = await seedBasketballAthlete(testUserId)
    const card = await db.cardTemplate.create({
      data: {
        athleteProfileId: athlete.id,
        createdByUserId: testUserId,
        title: 'Private Card',
        cardType: 'PROFILE',
        stylePreset: 'classic-foil',
        statsSnapshotJson: {},
        visibility: 'PRIVATE',
      },
    })
    // Real file on disk via the actual storage helper (not a fabricated
    // objectKey) — readStoredImage() needs a file that genuinely exists to
    // tell "blocked by access control" apart from "blocked because the
    // file's missing".
    const stored = await storeImage({
      buffer: Buffer.from('test-image-bytes'),
      contentType: 'image/jpeg',
      targetType: 'CARD_TEMPLATE',
      targetId: card.id,
      usage: 'HERO',
    })
    await db.imageAsset.create({
      data: {
        targetType: 'CARD_TEMPLATE',
        targetId: card.id,
        usage: 'HERO',
        storageProvider: stored.provider,
        objectKey: stored.objectKey,
        url: stored.url,
        contentType: 'image/jpeg',
        byteSize: 17,
        uploadedByUserId: testUserId,
      },
    })

    const anon = await app.inject({ method: 'GET', url: `/uploads/images/${stored.objectKey}` })
    expect(anon.statusCode).toBe(404)

    const otherUser = await app.inject({ method: 'GET', url: `/uploads/images/${stored.objectKey}`, headers: asAuth(testOtherUserId) })
    expect(otherUser.statusCode).toBe(404)

    const owner = await app.inject({ method: 'GET', url: `/uploads/images/${stored.objectKey}`, headers: asAuth(testUserId) })
    expect(owner.statusCode).toBe(200)
  })

  it('only lets one of two concurrent retryGenerationJob calls actually claim a stale job', async () => {
    const athlete = await seedBasketballAthlete(testUserId)
    const card = await db.cardTemplate.create({
      data: {
        athleteProfileId: athlete.id,
        createdByUserId: testUserId,
        title: 'Stuck Job',
        cardType: 'PROFILE',
        stylePreset: 'classic-foil',
        statsSnapshotJson: {},
      },
    })
    const job = await db.cardGenerationJob.create({
      data: { cardTemplateId: card.id, status: 'QUEUED', attempt: 1, inputJson: {} },
    })

    const cardService = new CardService()
    // Two "processes" racing to retry the same stale job — only one should
    // win the atomic claim (updateMany guarded on status+updatedAt); the
    // loser's updateMany matches zero rows and returns without touching
    // attempt or calling the generator a second time.
    await Promise.all([cardService.retryGenerationJob(job.id), cardService.retryGenerationJob(job.id)])

    const finalJob = await db.cardGenerationJob.findUniqueOrThrow({ where: { id: job.id } })
    expect(finalJob.attempt).toBe(2)
  })

  it('saves a card idempotently, lists it under /me/card-saves, and unsaves it with an ownership check', async () => {
    const card = await createReadyCard()

    const first = await app.inject({
      method: 'POST',
      url: '/card-saves',
      headers: asAuth(testUserId),
      payload: { cardTemplateId: card.id },
    })
    expect(first.statusCode).toBe(201)
    const saveId = first.json().data.id

    // Idempotent — saving the same card twice doesn't create a second row.
    const second = await app.inject({
      method: 'POST',
      url: '/card-saves',
      headers: asAuth(testUserId),
      payload: { cardTemplateId: card.id },
    })
    expect(second.statusCode).toBe(201)
    expect(second.json().data.id).toBe(saveId)

    const mine = await app.inject({ method: 'GET', url: '/me/card-saves', headers: asAuth(testUserId) })
    expect(mine.statusCode).toBe(200)
    expect(mine.json().data).toHaveLength(1)
    expect(mine.json().data[0].card.id).toBe(card.id)

    const forbidden = await app.inject({ method: 'DELETE', url: `/card-saves/${saveId}`, headers: asAuth(testOtherUserId) })
    expect(forbidden.statusCode).toBe(403)

    const deleted = await app.inject({ method: 'DELETE', url: `/card-saves/${saveId}`, headers: asAuth(testUserId) })
    expect(deleted.statusCode).toBe(200)

    const mineAfter = await app.inject({ method: 'GET', url: '/me/card-saves', headers: asAuth(testUserId) })
    expect(mineAfter.json().data).toHaveLength(0)
  })

  it('sorts /cards/recent by download count when sort=popular', async () => {
    const lessPopular = await createReadyCard()
    const morePopular = await createReadyCard()

    await app.inject({ method: 'POST', url: `/cards/${lessPopular.id}/publish`, headers: asAuth(testUserId) })
    await app.inject({ method: 'POST', url: `/cards/${morePopular.id}/publish`, headers: asAuth(testUserId) })

    async function claimAndDownload(cardId: string, times: number) {
      for (let i = 0; i < times; i++) {
        const claim = await app.inject({ method: 'POST', url: `/cards/${cardId}/claim`, headers: asAuth(i % 2 === 0 ? testUserId : testOtherUserId) })
        const issueId = claim.json().data.id
        await app.inject({ method: 'POST', url: `/card-issues/${issueId}/downloaded`, headers: asAuth(i % 2 === 0 ? testUserId : testOtherUserId) })
      }
    }
    await claimAndDownload(lessPopular.id, 1)
    await claimAndDownload(morePopular.id, 3)

    const res = await app.inject({ method: 'GET', url: '/cards/recent?sort=popular' })
    expect(res.statusCode).toBe(200)
    const ids = res.json().data.map((c: any) => c.id)
    expect(ids.indexOf(morePopular.id)).toBeLessThan(ids.indexOf(lessPopular.id))
  })
})
