import { ApiError } from '@statman/sdk'

export function describeAuthError(err: unknown): string {
  if (err instanceof ApiError) return err.message || `Server error (${err.status})`
  if (err instanceof TypeError && err.message === 'Network request failed') {
    return 'Cannot reach the server - check EXPO_PUBLIC_API_URL and that the API is running'
  }
  if (err instanceof Error) return err.message
  return 'Unknown error'
}
