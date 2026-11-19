import { View, Pressable, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Link, usePathname } from 'expo-router'
import { User } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { Avatar } from '@/shared/ui/Avatar'
import { brand } from '@/config/brand'
import { useNativeColor } from '@/lib/theme'
import { cn } from '@/lib/utils'
import { LAYOUT } from './layoutConstants'

export interface SiteHeaderUser {
  avatarUrl?: string | null
  displayName?: string | null
  email?: string | null
}

export interface SiteHeaderProps {
  user?: SiteHeaderUser | null
}

// Primary navigation destinations for RARE Digital Collectibles:
// 1. Discover - browse collectible drops, people, creators, categories
// 2. Create - Card Studio design and release preparation
// 3. Collection - claimed, saved, and owned cards
// 4. Profile - account identity, creator presence, and storefront
const NAV_ITEMS = [
  { label: 'Discover', href: '/' },
  { label: 'Create', href: '/cards/studio' },
  { label: 'Collection', href: '/collection' },
  { label: 'Profile', href: '/me' },
] as const

function navItemActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  if (href === '/cards/studio') return pathname.startsWith('/cards/studio')
  if (href === '/collection') return pathname === '/collection' || pathname === '/cards' || pathname.startsWith('/collection/')
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function SiteHeader({ user }: SiteHeaderProps) {
  const insets = useSafeAreaInsets()
  const pathname = usePathname()
  const { width } = useWindowDimensions()
  const mutedColor = useNativeColor('mutedText')
  const isWide = width >= LAYOUT.wideBreakpoint

  return (
    <View
      style={{ paddingTop: Math.max(insets.top, 12) }}
      className="z-50 border-b border-border bg-surface"
    >
      <View
        className="w-full flex-row items-center justify-between px-md md:px-lg lg:px-xl pb-sm"
      >
        <View className="min-w-0 flex-1 flex-row items-center gap-md">
          <Link href="/" asChild>
            <Pressable accessibilityRole="link" accessibilityLabel={`${brand.wordmark} home`} className="active:opacity-70">
              <Text className="text-xl font-bold tracking-tight text-text">{brand.wordmark}</Text>
            </Pressable>
          </Link>

          {isWide ? (
            <View className="min-w-0 flex-row items-center gap-xs">
              {NAV_ITEMS.map((item) => (
                <NavLink key={item.href} href={item.href} label={item.label} active={navItemActive(pathname, item.href)} />
              ))}
            </View>
          ) : null}
        </View>

        <View className="flex-row items-center gap-sm">
          <Link href="/me" asChild>
            <Pressable accessibilityRole="link" accessibilityLabel={user ? 'Account' : 'Sign in'} className="active:opacity-70">
              {user ? (
                <Avatar uri={user.avatarUrl} fallback={user.displayName ?? user.email ?? '?'} size="sm" />
              ) : (
                <View className="h-9 w-9 items-center justify-center rounded-full border border-border bg-canvas">
                  <User size={18} color={mutedColor} strokeWidth={2} />
                </View>
              )}
            </Pressable>
          </Link>
        </View>
      </View>

    </View>
  )
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href as never} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityState={{ selected: active }}
        className={cn(
          'min-h-[40px] justify-center rounded-sm px-md py-xs active:opacity-70',
          active && 'bg-canvas',
        )}
      >
        <Text
          variant="caption"
          className={cn(
            'text-[13px] font-semibold tracking-wide text-muted-text',
            active && 'text-text',
          )}
        >
          {label}
        </Text>
      </Pressable>
    </Link>
  )
}
