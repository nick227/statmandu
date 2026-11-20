import { describe, it, expect } from 'vitest'
import { db } from '@statman/db'
import { ImageService } from '../services/ImageService'
import { asAuth, buildTestApp, testOtherUserId, testUserId, validateResponse } from './helpers'
const app = buildTestApp()
const composition = (text?: string) => ({ schemaVersion: 1, canvas: { width: 600, height: 900 }, layers: [{ id: 'name', type: 'TEXT', x: 20, y: 20, width: 560, height: 100, ...(text === undefined ? { personField: 'displayName' } : { text }) }] })
async function setup() {
  const person = await db.personProfile.create({ data: { slug: 'musician', displayName: 'First Name', firstName: '', lastName: '', createdByUserId: testUserId } })
  const result = await app.inject({ method: 'POST', url: '/card-designs', headers: asAuth(testUserId), payload: { title: 'Reusable', composition: composition() } })
  expect(result.statusCode, result.body).toBe(201)
  await validateResponse('createCardDesign', 201, result.json())
  const design = result.json().data
  const input = { templateId: design.id, expectedRevision: 1, personProfileId: person.id, title: 'First edition', editionMode: 'LIMITED', editionSize: 2, requestId: 'first' }
  return { person, design, input }
}
const create = (input: any, user = testUserId) => app.inject({ method: 'POST', url: '/releases', headers: asAuth(user), payload: input })
const publish = (id: string) => app.inject({ method: 'POST', url: `/releases/${id}/publish`, headers: asAuth(testUserId), payload: { visibility: 'PUBLIC' } })
const claim = (id: string, user = testUserId) => app.inject({ method: 'POST', url: `/releases/${id}/issues`, headers: asAuth(user) })

describe('Reusable designs, immutable releases and creator catalogs', () => {
  it('produces two independently numbered releases without changing prior content, provenance or ownership', async () => {
    const { person, design, input } = await setup()
    const first = await create(input)
    expect(first.statusCode, first.body).toBe(201)
    const a = first.json().data
    const generation = await app.inject({ method: 'POST', url: `/releases/${a.id}/generate`, headers: asAuth(testUserId) })
    expect(generation.statusCode, generation.body).toBe(200)
    const published = await publish(a.id)
    expect(published.statusCode, published.body).toBe(200)
    await validateResponse('getRelease', 200, published.json())
    const issueA = await claim(a.id)
    expect(issueA.statusCode, issueA.body).toBe(201)
    expect(issueA.json().data.issueNumber).toBe(1)
    expect((await claim(a.id, testOtherUserId)).json().data.issueNumber).toBe(2)
    const before = await db.cardRelease.findUniqueOrThrow({ where: { id: a.id } })
    const oldIssue = await db.cardIssue.findUniqueOrThrow({ where: { id: issueA.json().data.id } })
    const updated = await app.inject({ method: 'PATCH', url: `/card-designs/${design.id}`, headers: asAuth(testUserId), payload: { expectedRevision: 1, composition: composition('New artwork caption') } })
    expect(updated.statusCode, updated.body).toBe(200)
    await db.personProfile.update({ where: { id: person.id }, data: { displayName: 'Changed Name' } })
    const second = await create({ ...input, expectedRevision: 2, requestId: 'second', title: 'Second edition' })
    expect(second.statusCode, second.body).toBe(201)
    const b = second.json().data
    expect(b.templateSnapshot.composition.layers[0].text).toBe('New artwork caption')
    expect((await publish(b.id)).statusCode).toBe(200)
    expect((await claim(b.id)).json().data.issueNumber).toBe(1)
    const after = await db.cardRelease.findUniqueOrThrow({ where: { id: a.id } })
    expect(after.contentSnapshotJson).toEqual(before.contentSnapshotJson)
    expect(after.originHash).toBe(before.originHash)
    expect(after.templateSnapshotJson).toEqual(before.templateSnapshotJson)
    expect(await db.cardIssue.findUnique({ where: { id: oldIssue.id } })).toEqual(oldIssue)
    expect((await app.inject({ method: 'GET', url: `/releases/${a.id}` })).json().data.person.displayName).toBe('First Name')
    expect((await create(input)).json().data.id).toBe(a.id)
    expect((await create({ ...input, title: 'Conflicting retry' })).statusCode).toBe(409)
    expect(await db.player.count()).toBe(0)
    expect(await db.sport.count()).toBe(0)
    expect(await db.cardGenerationJob.count({ where: { releaseId: a.id } })).toBe(1)
    const saved = await app.inject({ method: 'POST', url: '/card-saves', headers: asAuth(testOtherUserId), payload: { cardTemplateId: a.id } })
    expect(saved.statusCode, saved.body).toBe(201)
    const profile = await db.profile.findUniqueOrThrow({ where: { userId: testUserId } })
    const catalog = await app.inject({ method: 'GET', url: `/storefronts/${profile.username}/releases?limit=1` })
    expect(catalog.statusCode, catalog.body).toBe(200)
    expect(catalog.json().data).toHaveLength(1)
    expect(catalog.json().meta.hasMore).toBe(true)
    const page2 = await app.inject({ method: 'GET', url: `/storefronts/${profile.username}/releases?limit=1&cursor=${catalog.json().meta.nextCursor}` })
    expect(page2.json().data).toHaveLength(1)
    expect(page2.json().data[0].id).not.toBe(catalog.json().data[0].id)
    const store = await app.inject({ method: 'GET', url: `/storefronts/${profile.username}` })
    expect(store.json().data.commerceEnabled).toBe(false)
    expect(store.body).not.toContain('password')
    expect(store.body).not.toContain('@')
  })

  it('enforces creator boundaries, optimistic revision checks, draft privacy and archive rules', async () => {
    const { design, input } = await setup()
    expect((await app.inject({ method: 'GET', url: `/card-designs/${design.id}`, headers: asAuth(testOtherUserId) })).statusCode).toBe(403)
    expect((await create(input, testOtherUserId)).statusCode).toBe(403)
    expect((await create({ ...input, expectedRevision: 2 })).statusCode).toBe(409)
    const a = (await create(input)).json().data
    expect((await app.inject({ method: 'GET', url: `/releases/${a.id}` })).statusCode).toBe(404)
    expect((await app.inject({ method: 'POST', url: '/card-saves', headers: asAuth(testOtherUserId), payload: { cardTemplateId: a.id } })).statusCode).toBe(404)
    expect((await app.inject({ method: 'PATCH', url: `/cards/${a.id}`, headers: asAuth(testUserId), payload: { statsSnapshotJson: { forged: true } } })).statusCode).toBe(409)
    const bad = await app.inject({ method: 'PATCH', url: `/card-designs/${design.id}`, headers: asAuth(testUserId), payload: { expectedRevision: 2, title: 'stale' } })
    expect(bad.statusCode).toBe(409)
    expect((await app.inject({ method: 'POST', url: `/releases/${a.id}/publish`, headers: asAuth(testUserId), payload: { publicationType: 'OFFICIAL' } })).statusCode).toBe(403)
    expect((await app.inject({ method: 'PATCH', url: `/card-designs/${design.id}`, headers: asAuth(testUserId), payload: { expectedRevision: 1, archived: true } })).statusCode).toBe(200)
    expect((await create({ ...input, requestId: 'archived' })).statusCode).toBe(404)
    expect((await publish(a.id)).statusCode).toBe(200)
    expect((await app.inject({ method: 'POST', url: `/releases/${a.id}/archive`, headers: asAuth(testOtherUserId) })).statusCode).toBe(403)
  })

  it('keeps design media private and exposes only selected layers while a release is public', async () => {
    const { design, input } = await setup()
    const images = new ImageService()
    const upload = () => images.upload(testUserId, false, { targetType: 'CARD_DESIGN', targetId: design.id, usage: 'GALLERY', contentType: 'image/png', fileBuffer: Buffer.from('test-image') })
    const selected = await upload()
    const unused = await upload()
    const imagePath = (asset: { objectKey: string }) => `/uploads/images/${asset.objectKey}`
    expect((await app.inject({ method: 'GET', url: imagePath(selected) })).statusCode).toBe(404)
    expect((await app.inject({ method: 'GET', url: imagePath(selected), headers: asAuth(testUserId) })).statusCode).toBe(200)
    await expect(images.upload(testOtherUserId, false, { targetType: 'CARD_DESIGN', targetId: design.id, usage: 'GALLERY', contentType: 'image/png', fileBuffer: Buffer.from('x') })).rejects.toMatchObject({ statusCode: 403 })
    const updated = await app.inject({ method: 'PATCH', url: `/card-designs/${design.id}`, headers: asAuth(testUserId), payload: { expectedRevision: 1, composition: { ...composition(), layers: [{ id: 'portrait', type: 'IMAGE', x: 0, y: 0, width: 600, height: 900, imageAssetId: selected.id }] } } })
    expect(updated.statusCode, updated.body).toBe(200)
    const a = (await create({ ...input, expectedRevision: 2 })).json().data
    expect((await publish(a.id)).statusCode).toBe(200)
    expect((await app.inject({ method: 'GET', url: imagePath(selected) })).statusCode).toBe(200)
    expect((await app.inject({ method: 'GET', url: imagePath(unused) })).statusCode).toBe(404)
    expect((await app.inject({ method: 'GET', url: `/images?targetType=CARD_DESIGN&targetId=${design.id}` })).statusCode).toBe(404)
    expect((await app.inject({ method: 'POST', url: `/releases/${a.id}/archive`, headers: asAuth(testUserId) })).statusCode).toBe(200)
    expect((await app.inject({ method: 'GET', url: imagePath(selected) })).statusCode).toBe(404)
    const profile = await db.profile.findUniqueOrThrow({ where: { userId: testUserId } })
    expect((await app.inject({ method: 'GET', url: `/storefronts/${profile.username}/releases` })).json().data).toEqual([])
  })

  it('serializes concurrent retry requests into a single release', async () => {
    const { input } = await setup()
    const results = await Promise.all([create(input), create(input)])
    for (const result of results) expect(result.statusCode, result.body).toBe(201)
    expect(results[0].json().data.id).toBe(results[1].json().data.id)
    expect(await db.cardRelease.count()).toBe(1)
  })

  it('persists and publishes rich authored two-sided compositions with gradients, SVG paths, shadows, and back faces without data loss', async () => {
    const person = await db.personProfile.create({
      data: { slug: 'author-hero', displayName: 'Miles Dewey Davis III', firstName: 'Miles', lastName: 'Davis', createdByUserId: testUserId },
    })

    const richTwoSidedComposition = {
      schemaVersion: 1,
      canvas: { width: 600, height: 900 },
      layers: [
        {
          id: 'gold-frame',
          type: 'RECTANGLE',
          x: 10,
          y: 10,
          width: 580,
          height: 880,
          gradient: {
            type: 'linear',
            colors: ['#D4AF37', '#FFF4D0', '#AA7C11'],
            locations: [0, 0.5, 1],
          },
          shadow: {
            color: 'rgba(0,0,0,0.6)',
            offsetX: 0,
            offsetY: 4,
            blur: 12,
          },
        },
        {
          id: 'filigree-corner',
          type: 'SVG',
          x: 14,
          y: 14,
          width: 60,
          height: 60,
          pathData: 'M0,0 C20,10 50,40 60,60 C40,50 10,20 0,0 Z',
          fill: '#AA7C11',
          stroke: '#FFF4D0',
          strokeWidth: 1.5,
        },
        {
          id: 'nameplate',
          type: 'TEXT',
          x: 40,
          y: 700,
          width: 520,
          height: 60,
          personField: 'displayName',
          fontRole: 'serif',
          allCaps: true,
          fill: '#0F172A',
          fontSize: 28,
        },
      ],
      backComposition: {
        schemaVersion: 1,
        canvas: { width: 600, height: 900 },
        layers: [
          {
            id: 'back-mat',
            type: 'RECTANGLE',
            x: 0,
            y: 0,
            width: 600,
            height: 900,
            fill: '#050505',
          },
          {
            id: 'back-subject',
            type: 'TEXT',
            x: 50,
            y: 100,
            width: 500,
            height: 40,
            personField: 'displayName',
            fontSize: 22,
            fill: '#E2E8F0',
          },
        ],
      },
      metadata: {
        rendererVersion: 'rdc-composition-v1',
        designId: 'prestige-gold',
      },
    }

    const createdDesign = await app.inject({
      method: 'POST',
      url: '/card-designs',
      headers: asAuth(testUserId),
      payload: {
        title: 'Authored Prestige Gold',
        composition: richTwoSidedComposition,
      },
    })

    expect(createdDesign.statusCode, createdDesign.body).toBe(201)
    await validateResponse('createCardDesign', 201, createdDesign.json())
    const design = createdDesign.json().data

    // Verify front and back layers saved accurately
    expect(design.composition.layers).toHaveLength(3)
    expect(design.composition.layers[0].gradient.colors).toHaveLength(3)
    expect(design.composition.layers[1].type).toBe('SVG')
    expect(design.composition.backComposition.layers).toHaveLength(2)

    // Now issue and publish the release
    const releaseRes = await create({
      templateId: design.id,
      expectedRevision: 1,
      personProfileId: person.id,
      title: 'Authored Release Proof',
      editionMode: 'LIMITED',
      editionSize: 1,
      requestId: 'rich-proof-req-1',
    })
    expect(releaseRes.statusCode, releaseRes.body).toBe(201)
    const release = releaseRes.json().data

    const genRes = await app.inject({
      method: 'POST',
      url: `/releases/${release.id}/generate`,
      headers: asAuth(testUserId),
    })
    expect(genRes.statusCode, genRes.body).toBe(200)

    const pubRes = await publish(release.id)
    expect(pubRes.statusCode, pubRes.body).toBe(200)
    await validateResponse('getRelease', 200, pubRes.json())

    // Verify published release snapshot resolved person displayName on BOTH front and back
    const pubData = pubRes.json().data
    const snapshotComp = pubData.templateSnapshot.composition
    expect(snapshotComp.layers.find((l: any) => l.id === 'nameplate').text).toBe('Miles Dewey Davis III')
    expect(snapshotComp.backComposition.layers.find((l: any) => l.id === 'back-subject').text).toBe('Miles Dewey Davis III')
  })
})
