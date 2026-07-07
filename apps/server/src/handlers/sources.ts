import { VerificationService } from '../services/VerificationService'

const verificationService = new VerificationService()

export async function listSources(request: any, reply: any) {
  const sources = await verificationService.listSources(request.query.targetType, request.query.targetId)
  return reply.send({ data: sources })
}

export async function createSourceReference(request: any, reply: any) {
  const source = await verificationService.createSource(request.body)
  return reply.status(201).send({ data: source })
}
