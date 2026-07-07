import { ClaimService } from '../services/ClaimService'
import { VerificationService } from '../services/VerificationService'

const claimService = new ClaimService()
const verificationService = new VerificationService()

export async function claimPlayer(request: any, reply: any) {
  const claim = await claimService.claimPlayer(request.params.playerId, request.user.id, request.body?.verificationNote)
  return reply.status(201).send({ data: claim })
}

export async function listClaims(request: any, reply: any) {
  const claims = await claimService.listClaims(request.query?.status)
  return reply.send({ data: claims })
}

export async function reviewClaim(request: any, reply: any) {
  const claim = await claimService.reviewClaim(request.user.id, request.params.claimId, request.body)
  return reply.send({ data: claim })
}

export async function verifyPlayer(request: any, reply: any) {
  const player = await verificationService.verifyPlayer(request.params.playerId, request.body.sourceStatus)
  return reply.send({ data: player })
}
