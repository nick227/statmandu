import { View, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Link } from 'expo-router'
import { Search } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { Avatar } from '@/shared/ui/Avatar'
import { useNativeColor } from '@/lib/theme'

export interface SiteHeaderUser {
  avatarUrl?: string | null
  displayName?: string | null
  email?: string | null
}

export interface SiteHeaderProps {
  user?: SiteHeaderUser | null
}

/** App chrome — brand, search, and Profile. Props-only so shared stays module-free. */
export function SiteHeader({ user }: SiteHeaderProps) {
  const insets = useSafeAreaInsets()
  const iconColor = useNativeColor('mutedText')
  const borderColor = useNativeColor('border')

  return (
    <View
      style={{
        paddingTop: Math.max(insets.top, 16),
        backgroundColor: 'rgba(8,10,16,0.92)',
        borderBottomWidth: 1,
        borderBottomColor: borderColor,
      }}
      className="flex-row items-center justify-between px-md pb-sm"
    >
      <View className="flex-1">
        <Link href="/" asChild>
          <Pressable className="active:opacity-70">
            <Text className="text-xl font-bold text-brand tracking-tight">STATMAN</Text>
          </Pressable>
        </Link>
      </View>

      <View className="flex-row items-center gap-md">
        <Link href="/explore" asChild>
          <Pressable accessibilityLabel="Search" className="p-xs active:opacity-70">
            <Search size={22} color={iconColor} />
          </Pressable>
        </Link>

        <Link href="/me" asChild>
          <Pressable
            accessibilityLabel="Profile"
            className="flex-row items-center gap-sm active:opacity-70"
          >
            {user ? (
              <Avatar
                uri={user.avatarUrl}
                fallback={user.displayName ?? user.email ?? '?'}
                size="sm"
              />
            ) : null}
            <Text variant="caption" className="font-semibold text-text">Profile</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  )
}
