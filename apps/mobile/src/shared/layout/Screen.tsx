import { ScrollView, View, type ViewProps } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { cn } from '@/lib/utils'
import { Text } from '@/shared/ui/Text'
import { LAYOUT } from './layoutConstants'

export interface ScreenProps extends ViewProps {
  /** Big screen title, e.g. tab roots ("Home", "Explore"). Omit for hero/detail screens that have their own identity. */
  title?: string
  /** Content scrolls (lists compose their own scroll container — leave false for those) */
  scroll?: boolean
  className?: string
  contentClassName?: string
}

export function Screen({ title, scroll, className, contentClassName, children, ...props }: ScreenProps) {
  const insets = useSafeAreaInsets()
  const Container = scroll ? ScrollView : View
  const containerProps = scroll
    ? { contentContainerClassName: cn('pb-xxl', contentClassName) }
    : { className: cn('flex-1', contentClassName) }

  return (
    <View className={cn('flex-1 bg-canvas', className)} style={{ paddingTop: insets.top }} {...props}>
      <View style={{ width: '100%', maxWidth: LAYOUT.pageMaxWidth, alignSelf: 'center' }}>
        {title ? <Text variant="entityName" className="px-lg pt-md pb-sm">{title}</Text> : null}
        <Container {...(containerProps as any)}>{children}</Container>
      </View>
    </View>
  )
}
