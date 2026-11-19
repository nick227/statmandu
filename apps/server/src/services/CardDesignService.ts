import { db } from '@statman/db'
import { requireActiveCreator, requireCardCreator, type CardActor } from './CardAccess'
import { COMPOSITION_RENDERER, validateComposition, requireCompositionAssets } from './CardComposition'

export class CardDesignService {
  async create(actor: CardActor, input: { title: string; composition: unknown }) {
    await requireActiveCreator(actor.id)
    const composition = validateComposition(input.composition)
    await requireCompositionAssets(composition, actor.id)
    if (!input.title?.trim() || input.title.length > 160) throw { statusCode: 400, message: 'A title of at most 160 characters is required' }
    return this.serialize(await db.cardTemplate.create({ data: { createdByUserId: actor.id, title: input.title.trim(), rendererVersion: COMPOSITION_RENDERER, compositionJson: composition as any } }))
  }

  async get(actor: CardActor, id: string) {
    const design = await db.cardTemplate.findUnique({ where: { id } })
    if (!design) throw { statusCode: 404, message: 'Design not found' }
    await requireCardCreator(actor, design.createdByUserId)
    return this.serialize(design)
  }

  async list(actor: CardActor) {
    await requireActiveCreator(actor.id)
    return (await db.cardTemplate.findMany({ where: { createdByUserId: actor.id, archivedAt: null }, orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }], take: 100 })).map(this.serialize)
  }

  async update(actor: CardActor, id: string, input: { expectedRevision: number; title?: string; composition?: unknown; archived?: boolean }) {
    const existing = await db.cardTemplate.findUnique({ where: { id } })
    if (!existing) throw { statusCode: 404, message: 'Design not found' }
    await requireCardCreator(actor, existing.createdByUserId)
    if (!Number.isInteger(input.expectedRevision) || input.expectedRevision < 1) throw { statusCode: 400, message: 'expectedRevision is required' }
    if (input.title !== undefined && (!input.title.trim() || input.title.length > 160)) throw { statusCode: 400, message: 'Invalid title' }
    const composition = input.composition === undefined ? undefined : validateComposition(input.composition)
    if (composition) await requireCompositionAssets(composition, existing.createdByUserId)
    return db.$transaction(async tx => {
      const updated = await tx.cardTemplate.updateMany({
        where: { id, revision: input.expectedRevision, archivedAt: null },
        data: { title: input.title?.trim(), compositionJson: composition as any, revision: { increment: 1 }, ...(input.archived ? { archivedAt: new Date() } : {}) },
      })
      if (!updated.count) throw { statusCode: 409, message: 'Design changed or was archived; reload before editing' }
      return this.serialize(await tx.cardTemplate.findUniqueOrThrow({ where: { id } }))
    })
  }

  private serialize(design: any) {
    return { id: design.id, createdByUserId: design.createdByUserId, title: design.title, revision: design.revision, rendererVersion: design.rendererVersion, composition: design.compositionJson, archivedAt: design.archivedAt, createdAt: design.createdAt, updatedAt: design.updatedAt }
  }
}
