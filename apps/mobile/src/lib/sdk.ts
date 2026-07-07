import * as SecureStore from 'expo-secure-store'
import { createApiClient } from '@statman/sdk'

const TOKEN_KEY = 'statman.token'

// React Native has no cookie jar, so the SDK's httpOnly-cookie default
// doesn't apply here — see packages/sdk/src/client.ts's `getToken` override,
// added specifically for native app contexts like this one.
export function getStoredToken(): string | null {
  return SecureStore.getItem(TOKEN_KEY)
}

export async function setStoredToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token)
}

export async function clearStoredToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY)
}

export function initApiClient(baseUrl: string) {
  return createApiClient({
    baseUrl,
    getToken: getStoredToken,
  })
}
