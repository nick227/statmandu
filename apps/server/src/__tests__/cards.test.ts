import { describe, it, expect } from 'vitest'
import { db } from '@statman/db'
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
})
