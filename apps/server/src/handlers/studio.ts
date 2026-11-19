import { CardDesignService } from '../services/CardDesignService'
import { CardReleaseService } from '../services/CardReleaseService'
import { StorefrontService } from '../services/StorefrontService'
import { CardService } from '../services/CardService'
import { optionalUser } from '../lib/optionalUser'
const designs = new CardDesignService()
const releases = new CardReleaseService()
const stores = new StorefrontService()
const cards = new CardService()
const actor = (request: any) => ({ id: request.user.id, role: request.user.role })
export async function createCardDesign(r: any, p: any) { return p.code(201).send({ data: await designs.create(actor(r), r.body) }) }
export async function listCardDesigns(r: any, p: any) { return p.send({ data: await designs.list(actor(r)) }) }
export async function getCardDesign(r: any, p: any) { return p.send({ data: await designs.get(actor(r), r.params.designId) }) }
export async function updateCardDesign(r: any, p: any) { return p.send({ data: await designs.update(actor(r), r.params.designId, r.body) }) }
export async function createRelease(r: any, p: any) { return p.code(201).send({ data: await releases.create(actor(r), r.body) }) }
export async function getRelease(r: any, p: any) {
  const user = await optionalUser(r)
  return p.send({ data: await cards.getCard(r.params.releaseId, user?.id, user?.role === 'ADMIN') })
}
export async function generateRelease(r: any, p: any) { return p.send({ data: await cards.generateCard(actor(r), r.params.releaseId) }) }
export async function publishRelease(r: any, p: any) { return p.send({ data: await cards.publishCard(actor(r), r.params.releaseId, r.body ?? {}) }) }
export async function archiveRelease(r: any, p: any) { return p.send({ data: await cards.updateDraftCard(actor(r), r.params.releaseId, { status: 'ARCHIVED' }) }) }
export async function claimRelease(r: any, p: any) { return p.code(201).send({ data: await cards.claimCard(r.params.releaseId, r.user.id) }) }
export async function getMyStorefront(r: any, p: any) { return p.send({ data: await stores.mine(r.user.id) }) }
export async function updateMyStorefront(r: any, p: any) { return p.send({ data: await stores.update(r.user.id, r.body.description) }) }
export async function getStorefront(r: any, p: any) { return p.send({ data: await stores.get(r.params.username) }) }
export async function listStorefrontReleases(r: any, p: any) { return p.send(await stores.releases(r.params.username, r.query.cursor, r.query.limit)) }
