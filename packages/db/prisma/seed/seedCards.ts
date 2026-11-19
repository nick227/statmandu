import { db } from '../../src/client'
import { SeedClock } from './helpers'
import { numberedSeedId, seedIds } from './ids'

const CARD_STYLES = ['classic-foil', 'midnight-neon', 'newsprint', 'clean-stat', 'court-texture'] as const
const CARD_TYPES = ['PROFILE', 'BIG_GAME', 'MILESTONE', 'SEASON', 'HIGHLIGHT'] as const

export async function seedCards(referenceDate: Date) {
  const clock = new SeedClock(referenceDate)
  const athletes = await db.personProfile.findMany({
    where: { players: { some: { sport: { slug: 'basketball' } } } },
    orderBy: { slug: 'asc' },
    take: 20,
  })
  const teams = await db.team.findMany({ where: { league: { slug: 'demo-league' } }, orderBy: { slug: 'asc' }, take: 4 })
  const games = await db.game.findMany({
    where: { OR: [{ league: { slug: 'demo-league' } }, { season: { league: { slug: 'demo-league' } } }] },
    orderBy: { scheduledAt: 'desc' },
    take: 8,
  })
  const users = await db.user.findMany({ where: { email: { in: ['admin@statman.dev', 'athlete@statman.dev', 'fan1@statman.dev', 'fan2@statman.dev'] } } })
  const admin = users.find((user) => user.email === 'admin@statman.dev')
  const fan = users.find((user) => user.email === 'fan1@statman.dev')
  const collector = users.find((user) => user.email === 'fan2@statman.dev')
  const athleteUser = users.find((user) => user.email === 'athlete@statman.dev')
  if (athletes.length < 20 || teams.length < 4 || games.length === 0 || !admin || !fan || !collector || !athleteUser) {
    throw new Error('Card scenario requires the demo athletes, teams, games, and users')
  }

  const cards = []
  for (let index = 0; index < 24; index += 1) {
    const id = index === 0 ? seedIds.cards.featured : numberedSeedId(seedIds.cards.prefix, index)
    const athlete = athletes[index % athletes.length]!
    const published = index < 14
    const status = published ? 'PUBLISHED' : index < 16 ? 'READY' : index < 18 || index === 20 ? 'GENERATING' : index < 20 ? 'FAILED' : 'DRAFT'
    const imageId = `seed-card-image-${String(index + 1).padStart(2, '0')}`
    const title = index === 0
      ? 'First Game Dunk'
      : index === 7
        ? 'A Championship-Night Performance Worth Remembering for a Very Long Time'
        : `${athlete.firstName} ${athlete.lastName} — ${CARD_TYPES[index % CARD_TYPES.length]!.toLowerCase().replace('_', ' ')}`

    if (index < 16) {
      await db.imageAsset.upsert({
        where: { id: imageId },
        update: { targetId: id, url: `https://placehold.co/600x900/111827/ffffff?text=Statman+${index + 1}`, deletedAt: null },
        create: {
          id: imageId, targetType: 'CARD_TEMPLATE', targetId: id, usage: 'HERO', storageProvider: 'LOCAL',
          objectKey: imageId, url: `https://placehold.co/600x900/111827/ffffff?text=Statman+${index + 1}`,
          originalFilename: `seed-card-${index + 1}.jpg`, contentType: 'image/jpeg', byteSize: 180000, width: 600, height: 900,
          uploadedByUserId: admin.id,
        },
      })
    }

    const card = await db.cardTemplate.upsert({
      where: { id },
      update: {
        athleteProfileId: athlete.id, teamId: teams[index % teams.length]!.id,
        gameId: index % 3 === 0 ? games[index % games.length]!.id : null,
        title, cardType: CARD_TYPES[index % CARD_TYPES.length]!, stylePreset: CARD_STYLES[index % CARD_STYLES.length]!,
        status, visibility: published ? 'PUBLIC' : 'PRIVATE', editionMode: index % 8 === 0 ? 'LIMITED' : 'UNLIMITED',
        editionSize: index % 8 === 0 ? 25 : null, frontImageAssetId: index < 16 ? imageId : null,
        statsSnapshotJson: index === 23 ? {} : { points: 12 + index, rebounds: 3 + (index % 8), assists: index % 9 },
        batchRequestId: index >= 16 && index <= 20 ? `seed-batch-${index + 1}` : null,
        createdAt: clock.days(-index),
        publishedAt: published ? clock.days(-index) : null,
      },
      create: {
        id, athleteProfileId: athlete.id, teamId: teams[index % teams.length]!.id,
        gameId: index % 3 === 0 ? games[index % games.length]!.id : null, createdByUserId: index % 5 === 0 ? athleteUser.id : admin.id,
        title, cardType: CARD_TYPES[index % CARD_TYPES.length]!, stylePreset: CARD_STYLES[index % CARD_STYLES.length]!,
        status, visibility: published ? 'PUBLIC' : 'PRIVATE', editionMode: index % 8 === 0 ? 'LIMITED' : 'UNLIMITED',
        editionSize: index % 8 === 0 ? 25 : null, frontImageAssetId: index < 16 ? imageId : null,
        statsSnapshotJson: index === 23 ? {} : { points: 12 + index, rebounds: 3 + (index % 8), assists: index % 9 },
        batchRequestId: index >= 16 && index <= 20 ? `seed-batch-${index + 1}` : null,
        createdAt: clock.days(-index),
        publishedAt: published ? clock.days(-index) : null,
      },
    })
    cards.push(card)
  }

  const jobs = [
    { card: 14, status: 'READY' as const, attempt: 1, output: { imageAssetId: 'seed-card-image-15' } },
    { card: 16, status: 'QUEUED' as const, attempt: 1 },
    { card: 17, status: 'PROCESSING' as const, attempt: 1 },
    { card: 18, status: 'FAILED' as const, attempt: 1, error: 'Temporary provider timeout; safe to retry.' },
    { card: 19, status: 'FAILED' as const, attempt: 3, error: 'Maximum retry count reached.' },
    { card: 20, status: 'PROCESSING' as const, attempt: 1, error: 'Stale processing fixture for reconciler coverage.', stale: true },
  ]
  for (const [index, job] of jobs.entries()) {
    const id = numberedSeedId(seedIds.generationJobs.prefix, index)
    await db.cardGenerationJob.upsert({
      where: { id },
      update: { cardTemplateId: cards[job.card]!.id, provider: 'STUB', status: job.status, inputJson: { seedFixture: true }, outputJson: job.output ?? undefined, error: job.error ?? null, attempt: job.attempt, updatedAt: job.stale ? clock.days(-2) : clock.minutes(-index) },
      create: { id, cardTemplateId: cards[job.card]!.id, provider: 'STUB', status: job.status, inputJson: { seedFixture: true }, outputJson: job.output ?? undefined, error: job.error ?? null, attempt: job.attempt, createdAt: job.stale ? clock.days(-2) : clock.minutes(-index), updatedAt: job.stale ? clock.days(-2) : clock.minutes(-index) },
    })
  }

  for (let index = 0; index < 6; index += 1) {
    const issueId = `seed-card-issue-${String(index + 1).padStart(2, '0')}`
    const owner = index < 3 ? fan : collector
    await db.cardIssue.upsert({
      where: { id: issueId },
      update: { cardTemplateId: cards[index]!.id, issueNumber: 1, ownerUserId: owner.id, claimedByUserId: owner.id, claimedAt: clock.days(-index - 1), status: index < 4 ? 'DOWNLOADED' : 'CLAIMED' },
      create: { id: issueId, cardTemplateId: cards[index]!.id, issueNumber: 1, ownerUserId: owner.id, claimedByUserId: owner.id, claimedAt: clock.days(-index - 1), issueHash: `seed-issue-hash-${index + 1}`, status: index < 4 ? 'DOWNLOADED' : 'CLAIMED' },
    })
  }

  const savers = [fan, collector, athleteUser]
  for (let index = 0; index < 18; index += 1) {
    const saver = savers[index % savers.length]!
    const card = cards[index % 10]!
    await db.cardSave.upsert({
      where: { userId_cardTemplateId: { userId: saver.id, cardTemplateId: card.id } },
      update: {}, create: { userId: saver.id, cardTemplateId: card.id, createdAt: clock.minutes(-index) },
    })
  }

  for (let index = 0; index < 15; index += 1) {
    const issueIndex = index % 4
    const issueId = `seed-card-issue-${String(issueIndex + 1).padStart(2, '0')}`
    await db.cardDownloadEvent.upsert({
      where: { id: `seed-card-download-${String(index + 1).padStart(2, '0')}` },
      update: { context: index % 2 === 0 ? 'HOME' : 'EXPLORE' },
      create: { id: `seed-card-download-${String(index + 1).padStart(2, '0')}`, cardTemplateId: cards[issueIndex]!.id, cardIssueId: issueId, downloadedByUserId: savers[index % savers.length]!.id, context: index % 2 === 0 ? 'HOME' : 'EXPLORE', createdAt: clock.minutes(-index) },
    })
  }

  console.log(`✓ Cards: ${cards.length} templates, ${jobs.length} generation states, 6 claimed issues, deterministic saves/downloads`)
}
