import type { ViewStyle } from 'react-native'
import type { ReactNode } from 'react'
import { Platform, View, useWindowDimensions } from 'react-native'
import { cn } from '@/lib/utils'
import { LAYOUT } from './layoutConstants'

export interface PageFrameProps {
  main: ReactNode
  sidebar?: ReactNode
  className?: string
  mainClassName?: string
  sidebarClassName?: string
  /** How the sidebar behaves below `LAYOUT.wideBreakpoint`. Default stacks below main. */
  narrowSidebar?: 'below' | 'hidden'
}

export function PageFrame({
  main,
  sidebar,
  className,
  mainClassName,
  sidebarClassName,
  narrowSidebar = 'below',
}: PageFrameProps) {
  const { width } = useWindowDimensions()
  const isWide = width >= LAYOUT.wideBreakpoint && Boolean(sidebar)

  if (!isWide) {
    return (
      <View className={cn('w-full gap-md', className)}>
        {main}
        {sidebar && narrowSidebar === 'below' ? <View className={sidebarClassName}>{sidebar}</View> : null}
      </View>
    )
  }

  return (
    <View className={cn('w-full flex-row items-start gap-xl', className)}>
      <View className={cn('gap-md flex-1 min-w-0', mainClassName)}>
        {main}
      </View>
      <View
        className={cn('gap-md flex-shrink-0', sidebarClassName)}
        style={{
          width: 340,
          ...(Platform.OS === 'web'
            ? ({ position: 'sticky', top: LAYOUT.sidebarStickyTop } as unknown as ViewStyle)
            : null),
        }}
      >
        {sidebar}
      </View>
    </View>
  )
}
