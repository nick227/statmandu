import { PersonService } from '../services/PersonService'
import { CardService } from '../services/CardService'
import { ClaimService } from '../services/ClaimService'
import { optionalUser } from '../lib/optionalUser'
const people = new PersonService()
const cards = new CardService()
export async function listPeople(req: any, reply: any) { return reply.send({ data: await people.list(req.query.q) }) }
export async function getPerson(req: any, reply: any) { return reply.send({ data: await people.get(req.params.personId) }) }
export async function createPerson(req: any, reply: any) { return reply.code(201).send({ data: await people.create(req.user.id, req.body) }) }
export async function updatePerson(req: any, reply: any) { return reply.send({ data: await people.update(req.user, req.params.personId, req.body) }) }
export async function listPersonCards(req: any, reply: any) {
  const user = await optionalUser(req)
  return reply.send({ data: await cards.listCardsForAthlete(req.params.personId, user?.id, user?.role === 'ADMIN') })
}
export async function claimPerson(req: any, reply: any) { return reply.code(201).send({ data: await new ClaimService().claimPerson(req.params.personId, req.user.id, req.body?.verificationNote) }) }
