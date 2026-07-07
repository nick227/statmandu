import { Tabs } from 'expo-router'
import { Home, Search, PlusSquare, Shield, User } from 'lucide-react-native'
import { ConnectedAuthGuard } from '@/modules/auth/ConnectedAuthGuard'
import { TabBarIcon } from '@/shared/layout'

export default function TabsLayout() {
  return (
    <ConnectedAuthGuard>
      <Tabs screenOptions={{ tabBarActiveTintColor: 'rgb(29 78 216)' }}>
        <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <TabBarIcon icon={Home} color={String(color)} size={size} /> }} />
        <Tabs.Screen name="explore" options={{ title: 'Explore', tabBarIcon: ({ color, size }) => <TabBarIcon icon={Search} color={String(color)} size={size} /> }} />
        <Tabs.Screen name="enter" options={{ title: 'Enter', tabBarIcon: ({ color, size }) => <TabBarIcon icon={PlusSquare} color={String(color)} size={size} /> }} />
        <Tabs.Screen name="teams" options={{ title: 'Teams', tabBarIcon: ({ color, size }) => <TabBarIcon icon={Shield} color={String(color)} size={size} /> }} />
        <Tabs.Screen name="me" options={{ title: 'Me', tabBarIcon: ({ color, size }) => <TabBarIcon icon={User} color={String(color)} size={size} /> }} />
      </Tabs>
    </ConnectedAuthGuard>
  )
}
