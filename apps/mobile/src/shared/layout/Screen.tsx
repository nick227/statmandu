import type { ReactNode } from 'react'
import { ScrollView, View, type ViewProps } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { cn } from '@/lib/utils'
import { Text } from '@/shared/ui/Text'
import { BackButton } from '@/shared/ui/BackButton'
import { LAYOUT } from './layoutConstants'

export interface ScreenProps extends ViewProps {
  /** Big screen title, e.g. hubs ("Home", "Explore"). Omit for hero/detail screens that have their own identity. */
  title?: string
  /** Content scrolls (lists compose their own scroll container — leave false for those) */
  scroll?: boolean
  /** Show a back control before the title — for destinations pushed from Home. */
  withBack?: boolean
  /** Trailing chrome beside the title (search, account, write, etc.). */
  headerActions?: ReactNode
  /** When parent chrome (e.g. SiteHeader) already owns the top safe-area inset. */
  insetTop?: boolean
  className?: string
  contentClassName?: string
}

export function Screen({
  title,
  scroll,
  withBack,
  headerActions,
  insetTop = true,
  className,
  contentClassName,
  children,
  ...props
}: ScreenProps) {
  const insets = useSafeAreaInsets()
  const showHeader = Boolean(title || withBack || headerActions)

  const body = scroll ? (
    <ScrollView contentContainerClassName={cn('pb-xxl', contentClassName)}>{children}</ScrollView>
  ) : (
    <View className={cn('flex-1', contentClassName)}>{children}</View>
  )

  return (
    <View
      className={cn('flex-1 bg-canvas', className)}
      style={{ paddingTop: insetTop ? insets.top : 0 }}
      {...props}
    >
      <View style={{ width: '100%', maxWidth: LAYOUT.pageMaxWidth, alignSelf: 'center', flex: 1 }}>
        {showHeader ? (
          <View className="flex-row items-center gap-sm px-lg pt-md pb-sm">
            {withBack ? <BackButton tone="dark" /> : null}
            {title ? <Text className="flex-1 text-2xl font-bold text-text">{title}</Text> : <View className="flex-1" />}
            {headerActions}
          </View>
        ) : null}
        {body}
      </View>
    </View>
  )
}
