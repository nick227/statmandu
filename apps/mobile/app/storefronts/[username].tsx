import { useLocalSearchParams } from 'expo-router'
import { StorefrontScreen } from '@/modules/storefront/StorefrontScreen'

export default function StorefrontRoute() {
  const { username } = useLocalSearchParams<{ username: string }>()
  return <StorefrontScreen username={username || ''} />
}
