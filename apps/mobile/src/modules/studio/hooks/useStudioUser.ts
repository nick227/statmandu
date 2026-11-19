import { useCurrentUser, type components } from '@statman/sdk'

export type CurrentUser = components['schemas']['User']

export function useStudioUser() {
  const query = useCurrentUser()
  return {
    user: query.data?.data,
    username: query.data?.data?.profile?.username ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}
