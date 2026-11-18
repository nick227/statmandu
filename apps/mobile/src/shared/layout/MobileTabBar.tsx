import { useEffect, useState } from 'react'
import { Modal, Platform, Pressable, View, useWindowDimensions, type ViewStyle } from 'react-native'
import { Link, usePathname, useRouter } from 'expo-router'
import { ClipboardList, CreditCard, Home, Plus, Radio, Shield, Trophy, User, UserRound, X } from 'lucide-react-native'
import type { LucideIcon } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '@/shared/ui/Text'
import { useNativeColor } from '@/lib/theme'
import { cn } from '@/lib/utils'
import { LAYOUT } from './layoutConstants'

const ITEMS: ReadonlyArray<{ label: string; href: string; icon: LucideIcon; prominent?: boolean }> = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Cards', href: '/cards', icon: CreditCard },
  { label: 'Create', href: '#create', icon: Plus, prominent: true },
  { label: 'Games', href: '/games', icon: Radio },
  { label: 'Profile', href: '/me', icon: User },
]

const CREATE_ACTIONS: ReadonlyArray<{ label: string; description: string; href: string | { pathname: string; params: Record<string, string> }; icon: LucideIcon }> = [
  { label: 'Card', description: 'Open Card Studio', href: '/cards/studio', icon: CreditCard },
  { label: 'Game', description: 'Add a game', href: { pathname: '/games', params: { create: '1' } }, icon: Trophy },
  { label: 'Team', description: 'Create a team', href: '/teams/create', icon: Shield },
  { label: 'Athlete', description: 'Build a profile', href: '/players/create', icon: UserRound },
  { label: 'Broadcast', description: 'Choose a live game', href: { pathname: '/games', params: { action: 'broadcast' } }, icon: Radio },
  { label: 'Score', description: 'Choose any game', href: { pathname: '/games', params: { action: 'score' } }, icon: ClipboardList },
]

// 52px touch target + 4px top inset + at least 4px bottom inset + border.
// Mobile web reserves this exact footprint while the visible bar is fixed
// to the device viewport instead of drifting to the end of the document.
const TAB_BAR_BASE_HEIGHT = 61

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
}

export function MobileTabBar() {
  const pathname = usePathname()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [createOpen, setCreateOpen] = useState(false)
  const { width } = useWindowDimensions()
  const brandColor = useNativeColor('brand')
  const mutedColor = useNativeColor('mutedText')
  const bottomInset = Math.max(insets.bottom, 4)
  const isWeb = Platform.OS === 'web'

  useEffect(() => setCreateOpen(false), [pathname])

  if (width >= LAYOUT.wideBreakpoint) return null

  const tabBar = (
    <View
      accessibilityRole="tablist"
      className="flex-row border-t border-border bg-surface px-sm pt-xs"
      style={[
        { paddingBottom: bottomInset },
        isWeb ? webFixedStyle : null,
      ]}
    >
      {ITEMS.map(({ label, href, icon: Icon, prominent }) => {
        const active = isActive(pathname, href)
        if (prominent) {
          return (
            <Pressable
              key={href}
              accessibilityRole="button"
              accessibilityLabel="Open create menu"
              accessibilityState={{ expanded: createOpen }}
              onPress={() => setCreateOpen(true)}
              className="min-h-[52px] flex-1 items-center justify-center gap-[2px] active:opacity-70"
            >
              <View className="h-7 min-w-10 items-center justify-center rounded-pill bg-brand">
                <Plus size={20} color="#FFFFFF" strokeWidth={2} />
              </View>
              <Text className="text-[11px] font-semibold text-muted-text">Create</Text>
            </Pressable>
          )
        }
        return (
          <Link key={href} href={href as never} asChild>
            <Pressable
              accessibilityRole="tab"
              accessibilityLabel={label === 'Create' ? 'Create a trading card' : label}
              accessibilityState={{ selected: active }}
              className="min-h-[52px] flex-1 items-center justify-center gap-[2px] active:opacity-70"
            >
              <View className={cn('h-7 min-w-10 items-center justify-center rounded-pill', prominent && 'bg-brand', active && !prominent && 'bg-brand/10')}>
                <Icon size={prominent ? 20 : 19} color={prominent ? '#FFFFFF' : active ? brandColor : mutedColor} strokeWidth={active ? 2.5 : 2} />
              </View>
              <Text className={cn('text-[11px] font-semibold text-muted-text', active && 'text-brand')}>{label}</Text>
            </Pressable>
          </Link>
        )
      })}
    </View>
  )

  const createGate = (
    <Modal visible={createOpen} transparent animationType="fade" onRequestClose={() => setCreateOpen(false)}>
      <View className="flex-1 justify-end bg-black/45" accessibilityViewIsModal>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close create menu"
          className="absolute inset-0"
          onPress={() => setCreateOpen(false)}
        />
        <View className="mx-md gap-md rounded-t-xl border border-border bg-surface p-md" style={{ marginBottom: TAB_BAR_BASE_HEIGHT + bottomInset - 4 }}>
          <View className="flex-row items-center justify-between gap-sm">
            <View className="min-w-0 flex-1">
              <Text className="text-lg font-bold">Create or start</Text>
              <Text variant="caption">Choose what you want to do.</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close create menu"
              onPress={() => setCreateOpen(false)}
              className="h-11 w-11 items-center justify-center rounded-full border border-border active:opacity-70"
            >
              <X size={18} color={mutedColor} />
            </Pressable>
          </View>
          <View className="flex-row flex-wrap gap-sm">
            {CREATE_ACTIONS.map(({ label, description, href, icon: ActionIcon }) => (
              <Pressable
                key={label}
                accessibilityRole="button"
                accessibilityLabel={`${label}. ${description}`}
                onPress={() => {
                  setCreateOpen(false)
                  router.push(href as never)
                }}
                className="min-h-[72px] w-[48%] flex-grow flex-row items-center gap-sm rounded-md border border-border bg-canvas p-sm active:opacity-70"
              >
                <View className="h-10 w-10 items-center justify-center rounded-full bg-brand/10">
                  <ActionIcon size={19} color={brandColor} />
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="font-semibold">{label}</Text>
                  <Text variant="caption" numberOfLines={1}>{description}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  )

  if (!isWeb) return <>{tabBar}{createGate}</>

  return (
    <>
      <View aria-hidden style={{ height: TAB_BAR_BASE_HEIGHT + bottomInset - 4 }} />
      {tabBar}
      {createGate}
    </>
  )
}

const webFixedStyle = {
  position: 'fixed',
  right: 0,
  bottom: 0,
  left: 0,
  zIndex: 100,
  boxShadow: '0 -6px 18px rgba(15, 23, 42, 0.10)',
} as unknown as ViewStyle
