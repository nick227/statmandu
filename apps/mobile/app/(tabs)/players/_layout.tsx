import { Slot, Stack } from 'expo-router'
import { Platform } from 'react-native'

export default function PlayersLayout() {
  if (Platform.OS === 'web') return <Slot />
  return <Stack screenOptions={{ headerShown: false }} />
}
