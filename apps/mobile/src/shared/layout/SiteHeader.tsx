import { View, Pressable, ScrollView, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Link, usePathname } from 'expo-router'
import { Search, User } from 'lucide-react-native'
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

const NAV_ITEMS = [
  { label: 'Articles', href: '/articles' },
  { label: 'Athletes', href: '/players' },
  { label: 'Leaderboard', href: '/explore' },
  { label: 'Games', href: '/scores' },
  { label: 'Trading Cards', href: '/cards' },
] as const

function navItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function SiteHeader({ user }: SiteHeaderProps) {
  const insets = useSafeAreaInsets()
  const pathname = usePathname()
  const { width } = useWindowDimensions()
  const iconColor = useNativeColor('text')
  const mutedColor = useNativeColor('mutedText')
  const isWide = width >= LAYOUT.wideBreakpoint

  return (
    <View
      style={{ paddingTop: Math.max(insets.top, 12) }}
      className="z-50 border-b border-border bg-surface"
    >
      <View
        className="w-full flex-row items-center gap-md self-center px-lg pb-sm"
        style={{ maxWidth: LAYOUT.pageMaxWidth }}
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
          <Link href="/explore" asChild>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="Search"
              className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
            >
              <Search size={20} color={iconColor} strokeWidth={2} />
            </Pressable>
          </Link>

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

      {!isWide ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-xs px-lg pb-sm"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} active={navItemActive(pathname, item.href)} />
          ))}
        </ScrollView>
      ) : null}
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
