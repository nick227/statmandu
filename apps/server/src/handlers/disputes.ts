import { VerificationService } from '../services/VerificationService'

const verificationService = new VerificationService()

export async function listDisputes(request: any, reply: any) {
  const disputes = await verificationService.listDisputes(request.query.targetType, request.query.targetId)
  return reply.send({ data: disputes })
}

export async function openDispute(request: any, reply: any) {
  const dispute = await verificationService.openDispute(request.user.id, request.body)
  return reply.status(201).send({ data: dispute })
}

export async function resolveDispute(request: any, reply: any) {
  const dispute = await verificationService.resolveDispute(request.user.id, request.params.disputeId, request.body)
  return reply.send({ data: dispute })
}
