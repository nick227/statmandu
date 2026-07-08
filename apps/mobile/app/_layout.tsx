import '../global.css'

import { Stack } from 'expo-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { queryClient } from '@/lib/queryClient'
import { initApiClient } from '@/lib/sdk'

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001'

// Initialized once, before render, so every screen can call SDK hooks
// immediately — mirrors apps/web/src/main.tsx's createApiClient() call in
// the factory default, adapted for a native entry point instead of an HTML one.
initApiClient(API_URL)

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="cards/studio" />
            <Stack.Screen name="cards/[cardId]" />
            <Stack.Screen name="login" options={{ presentation: 'modal', headerShown: true, title: 'Sign In' }} />
            <Stack.Screen name="register" options={{ presentation: 'modal', headerShown: true, title: 'Create Account' }} />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
