// Shared by every service that returns an AthleteProfile-shaped object
// (PlayerService, TeamService's roster, StatsService, VerificationService) —
// extracted after the same claim-fields bug had to be fixed in four places
// independently. Always include CLAIMED_BY_USER_INCLUDE alongside
// `athleteProfile: true` and run the result through withClaimFields before
// returning, or the response will fail schema validation (claimedByUsername/
// claimedByDisplayName are required on AthleteProfile).
export const CLAIMED_BY_USER_INCLUDE = { claimedByUser: { include: { profile: true } } } as const

export function withClaimFields(athleteProfile: any) {
  const { claimedByUser, ...rest } = athleteProfile
  return {
    ...rest,
    claimedByUsername: claimedByUser?.profile?.username ?? null,
    claimedByDisplayName: claimedByUser?.profile?.displayName ?? null,
  }
}
