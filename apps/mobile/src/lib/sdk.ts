import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { createApiClient } from '@statman/sdk'
import { consumeNextAdminNote, getActAsUserId } from '@/lib/adminHeaders'

const TOKEN_KEY = 'statman.token'

// expo-secure-store is native-only (iOS Keychain / Android Keystore) — it
// has no real web implementation, and calling it on web throws at runtime
// ("getValueWithKeySync is not a function"). Web already has a working
// cookie jar (this literally runs in a browser), so it should never call
// SecureStore at all — it just uses the SDK's default cookie-based auth.
const isNative = Platform.OS !== 'web'

export function getStoredToken(): string | null {
  if (!isNative) return null
  return SecureStore.getItem(TOKEN_KEY)
}

export async function setStoredToken(token: string) {
  if (!isNative) return
  await SecureStore.setItemAsync(TOKEN_KEY, token)
}

export async function clearStoredToken() {
  if (!isNative) return
  await SecureStore.deleteItemAsync(TOKEN_KEY)
}

export function initApiClient(baseUrl: string) {
  const client = createApiClient({
    baseUrl,
    // Only native platforms need the SecureStore/Bearer override — see
    // packages/sdk/src/client.ts's `getToken` override, added for exactly
    // this case. Passing undefined on web keeps the SDK's httpOnly-cookie
    // default (credentials: 'include') active.
    getToken: isNative ? getStoredToken : undefined,
  })

  client.use({
    async onRequest({ request }) {
      const actAs = getActAsUserId()
      if (actAs) request.headers.set('X-Act-As-User-Id', actAs)
      const note = consumeNextAdminNote()
      if (note) request.headers.set('X-Admin-Note', note)
      return request
    },
  })

  return client
}
