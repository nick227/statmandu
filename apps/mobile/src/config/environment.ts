const DEVELOPMENT_API_URL = 'http://localhost:3001'

export interface ApiEnvironmentInput {
  rawUrl?: string
  isDevelopment: boolean
}

export function resolveApiUrl({ rawUrl, isDevelopment }: ApiEnvironmentInput): string {
  const candidate = rawUrl?.trim() || (isDevelopment ? DEVELOPMENT_API_URL : '')
  if (!candidate) {
    throw new Error('EXPO_PUBLIC_API_URL is required for preview and production builds.')
  }

  let url: URL
  try {
    url = new URL(candidate)
  } catch {
    throw new Error('EXPO_PUBLIC_API_URL must be an absolute HTTP or HTTPS URL.')
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('EXPO_PUBLIC_API_URL must use HTTP or HTTPS.')
  }

  const localHost = url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '::1'
  if (!isDevelopment && localHost) {
    throw new Error('EXPO_PUBLIC_API_URL cannot target localhost in preview or production builds.')
  }
  if (!isDevelopment && url.protocol !== 'https:') {
    throw new Error('EXPO_PUBLIC_API_URL must use HTTPS in preview and production builds.')
  }

  return url.toString().replace(/\/$/, '')
}

export const API_URL = resolveApiUrl({
  rawUrl: process.env.EXPO_PUBLIC_API_URL,
  isDevelopment: typeof __DEV__ !== 'undefined' && __DEV__,
})
