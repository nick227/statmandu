import { useClaims } from '@statman/sdk'

export function useClaimsQueue() {
  const claimsQuery = useClaims({ status: 'PENDING' })

  return {
    claims: claimsQuery.data?.data ?? [],
    isLoading: claimsQuery.isLoading,
  }
}
