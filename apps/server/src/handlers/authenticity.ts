import { AuthenticityService } from '../services/AuthenticityService'
import { ClaimService } from '../services/ClaimService'
import { publishingAuthorityState } from '../services/PublishingAuthority'
import { publicSigningKeys } from '../services/ReleaseSigning'
const authenticity = new AuthenticityService()
const claims = new ClaimService()
export async function inspectReleaseAuthenticity(r: any, p: any) { return p.send({ data: await authenticity.release(r.params.releaseId) }) }
export async function inspectIssueAuthenticity(r: any, p: any) { return p.send({ data: await authenticity.issue(r.params.issueId) }) }
export async function getPublishingAuthority(r: any, p: any) { return p.send({ data: await publishingAuthorityState(r.params.personId, r.user.id) }) }
export async function revokeClaim(r: any, p: any) { return p.send({ data: await claims.revokeClaim(r.user.id, r.params.claimId, r.body.reason) }) }
export async function listSigningKeys(_r: any, p: any) { return p.send({ data: publicSigningKeys() }) }
