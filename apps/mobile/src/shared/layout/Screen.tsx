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
  className?: string
  contentClassName?: string
}

export function Screen({
  title,
  scroll,
  withBack,
  headerActions,
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
    <View className={cn('flex-1 bg-canvas', className)} style={{ paddingTop: insets.top }} {...props}>
      <View style={{ width: '100%', maxWidth: LAYOUT.pageMaxWidth, alignSelf: 'center', flex: 1 }}>
        {showHeader ? (
          <View className="flex-row items-center gap-sm px-lg pt-md pb-sm">
            {withBack ? <BackButton tone="dark" /> : null}
            {title ? <Text variant="entityName" className="flex-1">{title}</Text> : <View className="flex-1" />}
            {headerActions}
          </View>
        ) : null}
        {body}
      </View>
    </View>
  )
}
