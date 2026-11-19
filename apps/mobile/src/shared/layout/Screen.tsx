import type { ReactNode } from 'react'
import { Platform, ScrollView, View, type ViewProps, type ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { cn } from '@/lib/utils'
import { Text } from '@/shared/ui/Text'
import { BackButton } from '@/shared/ui/BackButton'
import { LAYOUT } from './layoutConstants'
import { usePageTitle } from '@/lib/pageTitle'

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
  /**
   * Layout policy:
   * - 'full' (default): Full-width responsive layout using available horizontal space with standard page gutters.
   * - 'workspace': Edge-to-edge application workspace occupying available viewport width and height (Card Studio).
   * - 'contained': Constrained max-width central column (for narrow forms, auth, or focused reading).
   */
  layout?: 'full' | 'workspace' | 'contained'
}

export function Screen({
  title,
  scroll,
  withBack,
  headerActions,
  insetTop = true,
  className,
  contentClassName,
  layout = 'full',
  children,
  style,
  ...props
}: ScreenProps) {
  usePageTitle(title)
  const insets = useSafeAreaInsets()
  const showHeader = Boolean(title || withBack || headerActions)
  const usesDocumentScroll = Platform.OS === 'web'

  // Dedicated full-viewport application workspace layout (e.g., Card Studio)
  if (layout === 'workspace') {
    return (
      <View
        className={cn('flex-1 w-full bg-canvas', className)}
        style={[
          {
            paddingTop: insetTop ? insets.top : 0,
            ...(usesDocumentScroll ? ({ flexGrow: 1, minHeight: 'calc(100vh - 56px)', width: '100%' } as unknown as ViewStyle) : null),
          },
          style,
        ]}
        {...props}
      >
        {showHeader ? (
          <View className="flex-row items-center gap-sm px-md md:px-lg lg:px-xl pt-md pb-sm border-b border-border bg-surface">
            {withBack ? <BackButton tone="dark" /> : null}
            {title ? <Text className="flex-1 text-xl font-bold text-text">{title}</Text> : <View className="flex-1" />}
            {headerActions}
          </View>
        ) : null}
        <View className={cn('flex-1 w-full', contentClassName)}>{children}</View>
      </View>
    )
  }

  const isContained = layout === 'contained'

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
          ...(isContained ? { maxWidth: LAYOUT.pageMaxWidth, alignSelf: 'center' } : null),
          ...(!usesDocumentScroll ? { flex: 1 } : null),
        }}
        className={cn(!isContained && 'px-md md:px-lg lg:px-xl')}
      >
        {showHeader ? (
          <View className={cn('flex-row items-center gap-sm pt-md pb-sm', isContained && 'px-lg')}>
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
