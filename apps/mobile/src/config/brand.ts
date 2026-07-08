export const brand = {
  displayName: process.env.EXPO_PUBLIC_APP_NAME ?? 'Statman',
  wordmark: process.env.EXPO_PUBLIC_APP_WORDMARK ?? 'Statman',
  tagline: 'Live sport, layered stats, always in motion.',
} as const
