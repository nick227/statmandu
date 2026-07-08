import { useCurrentUser, useLogout, useMeCapabilities } from '@statman/sdk'

export function useAccountSession() {
  const currentUserQuery = useCurrentUser()
  const capabilitiesQuery = useMeCapabilities({ enabled: Boolean(currentUserQuery.data) })
  const logout = useLogout()

  return {
    capabilities: capabilitiesQuery.data?.data,
    isCapabilitiesLoading: capabilitiesQuery.isLoading,
    user: currentUserQuery.data?.data,
    isLoading: currentUserQuery.isLoading,
    isError: currentUserQuery.isError,
    logout,
  }
}
