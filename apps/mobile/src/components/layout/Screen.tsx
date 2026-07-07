import { ScrollView, View, type ViewProps } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { cn } from '@/lib/utils'
import { Text } from '@/components/ui/Text'

export interface ScreenProps extends ViewProps {
  /** Big screen title, e.g. tab roots ("Home", "Explore"). Omit for hero/detail screens that have their own identity. */
  title?: string
  /** Content scrolls (lists compose their own scroll container — leave false for those) */
  scroll?: boolean
  className?: string
  contentClassName?: string
}

// Every tab root and simple screen renders through this so top safe-area
// padding and the title treatment never drift screen-to-screen again (see
// docs/frontend-architecture.md "Navigation & layout foundation" — this
// replaces five copies of ad-hoc `style={{ paddingTop: insets.top }}` that
// had already drifted out of sync with each other).
export function Screen({ title, scroll, className, contentClassName, children, ...props }: ScreenProps) {
  const insets = useSafeAreaInsets()
  const Container = scroll ? ScrollView : View
  const containerProps = scroll
    ? { contentContainerClassName: cn('pb-xxl', contentClassName) }
    : { className: cn('flex-1', contentClassName) }

  return (
    <View className={cn('flex-1 bg-canvas', className)} style={{ paddingTop: insets.top }} {...props}>
      {title ? <Text variant="entityName" className="px-lg pt-md pb-sm">{title}</Text> : null}
      <Container {...(containerProps as any)}>{children}</Container>
    </View>
  )
}
