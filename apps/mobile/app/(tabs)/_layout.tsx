import { Tabs } from 'expo-router'
import { Clapperboard, Home, Search, PlusSquare, Shield, User } from 'lucide-react-native'
import { TabBarIcon } from '@/shared/layout'
import { useNativeColor } from '@/lib/theme'

// No auth guard at the group level — Home/Explore/Teams are public browsing
// (every read they need is already unauthenticated on the backend, see
// CLAUDE.md). Enter and Me are the two tabs whose entire purpose requires
// an account; each gates itself inline with SignInPrompt instead of a hard
// redirect, so tapping between tabs never surprises a logged-out visitor.
export default function TabsLayout() {
  const brandColor = useNativeColor('brand')
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.55)',
        tabBarStyle: {
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: 18,
          height: 62,
          borderRadius: 999,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.12)',
          backgroundColor: 'rgba(8,10,16,0.92)',
        },
        tabBarItemStyle: { paddingVertical: 8 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarActiveBackgroundColor: brandColor,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <TabBarIcon icon={Home} color={String(color)} size={size} /> }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore', tabBarIcon: ({ color, size }) => <TabBarIcon icon={Search} color={String(color)} size={size} /> }} />
      <Tabs.Screen name="videos" options={{ title: 'Film', tabBarIcon: ({ color, size }) => <TabBarIcon icon={Clapperboard} color={String(color)} size={size} /> }} />
      <Tabs.Screen name="enter" options={{ title: 'Enter', tabBarIcon: ({ color, size }) => <TabBarIcon icon={PlusSquare} color={String(color)} size={size} /> }} />
      <Tabs.Screen name="teams" options={{ title: 'Teams', tabBarIcon: ({ color, size }) => <TabBarIcon icon={Shield} color={String(color)} size={size} /> }} />
      <Tabs.Screen name="me" options={{ title: 'Me', tabBarIcon: ({ color, size }) => <TabBarIcon icon={User} color={String(color)} size={size} /> }} />
    </Tabs>
  )
}
