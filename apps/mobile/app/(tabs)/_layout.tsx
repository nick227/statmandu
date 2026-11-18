import { Slot, Stack } from 'expo-router'
import { Platform, View } from 'react-native'
import { ConnectedMobileTabBar, ConnectedSiteHeader } from '@/modules/account/ConnectedSiteHeader'

// Single homepage is the product surface; former tab destinations stay as
// reachable routes (search, film browse, articles, scores entry, teams
// directory, account) but no longer compete as parallel peer tabs.
export default function AppShellLayout() {
  // RootLayout owns the complete site shell on web so every route—not only
  // former tab routes—uses the browser document scroll. Keep this layout as
  // a native stack only; a nested web Stack would restore the clipping.
  if (Platform.OS === 'web') return <Slot />

  return (
    <View style={{ flex: 1 }}>
      <ConnectedSiteHeader />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="explore" />
        <Stack.Screen name="videos" />
        <Stack.Screen name="articles" />
        <Stack.Screen name="scores" />
        <Stack.Screen name="games" />
        <Stack.Screen name="cards" />
        <Stack.Screen name="teams" />
        <Stack.Screen name="me" />
        <Stack.Screen name="players" />
      </Stack>
      <ConnectedMobileTabBar />
    </View>
  )
}
