import type { ReactNode } from 'react'
import { Platform, ScrollView, View, type ViewProps, type ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { cn } from '@/lib/utils'
import { Text } from '@/shared/ui/Text'
import { BackButton } from '@/shared/ui/BackButton'
import { LAYOUT } from './layoutConstants'

export interface ScreenProps extends ViewProps {
  /** Big screen title, e.g. hubs ("Home", "Explore"). Omit for hero/detail screens that have their own identity. */
  title?: string
  /** Native-only content scrolling. Web always uses the root document shell;
   *  lists compose their own native scroll container, so leave false there. */
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
  style,
  ...props
}: ScreenProps) {
  const insets = useSafeAreaInsets()
  const showHeader = Boolean(title || withBack || headerActions)
  const usesDocumentScroll = Platform.OS === 'web'

  const body = scroll && !usesDocumentScroll ? (
    <ScrollView contentContainerClassName={cn('pb-xxl', contentClassName)}>{children}</ScrollView>
  ) : (
    <View className={cn(!usesDocumentScroll && 'flex-1', scroll && 'pb-xxl', contentClassName)}>{children}</View>
  )

  return (
    <View
      className={cn(!usesDocumentScroll && 'flex-1', 'bg-canvas', className)}
      style={[
        {
          paddingTop: insetTop ? insets.top : 0,
          ...(usesDocumentScroll ? ({ flexGrow: 1, width: '100%' } as ViewStyle) : null),
        },
        style,
      ]}
      {...props}
    >
      <View
        style={{
          width: '100%',
          maxWidth: LAYOUT.pageMaxWidth,
          alignSelf: 'center',
          ...(!usesDocumentScroll ? { flex: 1 } : null),
        }}
      >
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
