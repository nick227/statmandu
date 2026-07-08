import { useCurrentUser } from '@statman/sdk'

// Thin wrapper so screens that just need "am I signed in / am I an admin"
// don't import the SDK directly (screens aren't use*/Connected*, so a raw
// SDK import there trips scripts/check-boundaries.mjs).
export function useAuthGate() {
  const { data, isLoading } = useCurrentUser()
  return {
    user: data?.data,
    isAuthenticated: Boolean(data),
    isAdmin: data?.data.role === 'ADMIN',
    isAuthLoading: isLoading,
  }
}
