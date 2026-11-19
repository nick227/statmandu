export const brand = {
  displayName: process.env.EXPO_PUBLIC_APP_NAME ?? 'RARE',
  wordmark: process.env.EXPO_PUBLIC_APP_WORDMARK ?? 'RARE',
  tagline: 'Create yourself. Collect anyone.',
} as const
