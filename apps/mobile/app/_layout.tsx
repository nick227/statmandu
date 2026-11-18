import '../global.css'

import { Slot, Stack } from 'expo-router'
import { Platform, View, type ViewStyle } from 'react-native'
import { QueryClientProvider } from '@tanstack/react-query'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { queryClient } from '@/lib/queryClient'
import { initApiClient } from '@/lib/sdk'
import { API_URL } from '@/config/environment'
import { ConnectedMobileTabBar, ConnectedSiteHeader } from '@/modules/account/ConnectedSiteHeader'

// Initialized once, before render, so every screen can call SDK hooks
// immediately — mirrors apps/web/src/main.tsx's createApiClient() call in
// the factory default, adapted for a native entry point instead of an HTML one.
initApiClient(API_URL)

export default function RootLayout() {
  const navigator = Platform.OS === 'web' ? (
    // Web uses the browser document as the one vertical scroll surface.
    // Slot avoids React Navigation's viewport-height/overflow-hidden scene
    // wrappers, which clipped long routes and forced Home to add its own
    // nested ScrollView. Site chrome lives here so routes outside `(tabs)`
    // share the same shell instead of becoming disconnected mini-apps.
    <View style={webDocumentStyle}>
      <ConnectedSiteHeader />
      <View style={{ flexGrow: 1 }}>
        <Slot />
      </View>
      <ConnectedMobileTabBar />
    </View>
  ) : (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="cards/studio" />
      <Stack.Screen name="cards/generate" />
      <Stack.Screen name="cards/review" />
      <Stack.Screen name="cards/[cardId]" />
      <Stack.Screen name="login" options={{ presentation: 'modal', headerShown: true, title: 'Sign In' }} />
      <Stack.Screen name="register" options={{ presentation: 'modal', headerShown: true, title: 'Create Account' }} />
    </Stack>
  )

  return (
    <GestureHandlerRootView style={Platform.OS === 'web' ? webDocumentStyle : { flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          {navigator}
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

const webDocumentStyle = {
  minHeight: '100vh',
  width: '100%',
} as unknown as ViewStyle
