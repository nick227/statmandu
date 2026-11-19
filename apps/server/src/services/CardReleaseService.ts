import { createHash } from 'crypto'
import { db } from '@statman/db'
import type { CardEditionMode } from '@statman/db'
import { CardService } from './CardService'
import { requireActiveCreator, type CardActor } from './CardAccess'
import { requireCompositionAssets, resolveComposition, validateComposition } from './CardComposition'
import { serializePerson } from './PersonService'

export type CreateReleaseInput = {
  templateId: string
  expectedRevision: number
  personProfileId: string
  title: string
  editionMode: CardEditionMode
  editionSize?: number | null
  requestId: string
  sourceImageAssetId?: string | null
}

export class CardReleaseService {
  constructor(private readonly cards = new CardService()) {}

  async create(actor: CardActor, input: CreateReleaseInput) {
    await requireActiveCreator(actor.id)
    if (!input.requestId || input.requestId.length > 100 || !Number.isInteger(input.expectedRevision) || input.expectedRevision < 1 || !input.title?.trim() || input.title.length > 160) throw { statusCode: 400, message: 'Valid requestId, revision and title are required' }
    // Fixed field order and normalized omitted values give retries one identity.
    const requestHash = createHash('sha256').update(JSON.stringify({ templateId: input.templateId, expectedRevision: input.expectedRevision, personProfileId: input.personProfileId, title: input.title.trim(), editionMode: input.editionMode, editionSize: input.editionSize ?? null, sourceImageAssetId: input.sourceImageAssetId ?? null })).digest('hex')
    return db.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM User WHERE id = ${actor.id} FOR UPDATE`
      const prior = await tx.cardRelease.findUnique({ where: { createdByUserId_releaseRequestId: { createdByUserId: actor.id, releaseRequestId: input.requestId } } })
      if (prior) {
        if (prior.releaseRequestHash !== requestHash) throw { statusCode: 409, message: 'requestId has already been used with different content' }
        return this.cards.getCard(prior.id, actor.id, false, tx)
      }
      await tx.$queryRaw`SELECT id FROM CardDesign WHERE id = ${input.templateId} FOR UPDATE`
      const design = await tx.cardTemplate.findUnique({ where: { id: input.templateId } })
      if (!design || design.archivedAt) throw { statusCode: 404, message: 'Active design not found' }
      // Admin moderation is separate from issuing someone else's design as your own.
      if (design.createdByUserId !== actor.id) throw { statusCode: 403, message: 'Only the design creator may release this design' }
      if (design.revision !== input.expectedRevision) throw { statusCode: 409, message: 'Design changed; preview its current revision before releasing' }
      const person = await tx.personProfile.findFirst({ where: { id: input.personProfileId, deletedAt: null } })
      if (!person) throw { statusCode: 404, message: 'Person not found' }
      const composition = validateComposition(design.compositionJson)
      const assets = await requireCompositionAssets(composition, actor.id)
      const snapshot = {
        schemaVersion: 1,
        templateId: design.id,
        revision: design.revision,
        rendererVersion: design.rendererVersion,
        composition: resolveComposition(composition, person),
        person: serializePerson(person),
        assets,
        assetIds: assets.map(asset => asset.id),
      }
      const storefront = await tx.storefront.upsert({ where: { userId: actor.id }, update: {}, create: { userId: actor.id } })
      const card = await this.cards.createDraftCard(actor.id, {
        personProfileId: person.id, title: input.title.trim(), cardType: 'PROFILE',
        stylePreset: design.rendererVersion, editionMode: input.editionMode,
        editionSize: input.editionSize, sourceImageAssetId: input.sourceImageAssetId,
      }, tx)
      await tx.cardRelease.update({ where: { id: card.id }, data: {
        templateId: design.id, templateRevision: design.revision, templateSnapshotJson: snapshot as any,
        storefrontId: storefront.id, releaseRequestId: input.requestId, releaseRequestHash: requestHash,
      } })
      // getCard reads on the transaction so the draft is visible before commit.
      return this.cards.getCard(card.id, actor.id, false, tx)
    }, { timeout: 10000 })
  }
}
