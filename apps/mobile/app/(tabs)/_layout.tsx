import { Stack } from 'expo-router'

// Single homepage is the product surface; former tab destinations stay as
 // reachable routes (search, film browse, articles, scores entry, teams
 // directory, account) but no longer compete as parallel peer tabs.
export default function AppShellLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="explore" />
      <Stack.Screen name="videos" />
      <Stack.Screen name="articles" />
      <Stack.Screen name="scores" />
      <Stack.Screen name="teams" />
      <Stack.Screen name="me" />
      <Stack.Screen name="players" />
    </Stack>
  )
}
