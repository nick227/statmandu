import { useCurrentUser, useLogout } from '@statman/sdk'

export function useAccountSession() {
  const currentUserQuery = useCurrentUser()
  const logout = useLogout()

  return {
    user: currentUserQuery.data?.data,
    isLoading: currentUserQuery.isLoading,
    isError: currentUserQuery.isError,
    logout,
  }
}
