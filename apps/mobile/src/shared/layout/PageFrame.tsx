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
      <View
        className={cn('w-full gap-md px-md', className)}
        style={{ maxWidth: LAYOUT.pageMaxWidth, alignSelf: 'center' }}
      >
        {main}
        {sidebar && narrowSidebar === 'below' ? <View className={sidebarClassName}>{sidebar}</View> : null}
      </View>
    )
  }

  return (
    <View
      className={cn('w-full flex-row items-start gap-md px-lg', className)}
      style={{ maxWidth: LAYOUT.pageMaxWidth, alignSelf: 'center' }}
    >
      <View className={cn('gap-md', mainClassName)} style={{ flexBasis: '70%', maxWidth: '70%' }}>
        {main}
      </View>
      <View
        className={cn('gap-md', sidebarClassName)}
        style={{
          flexBasis: '30%',
          maxWidth: '30%',
          ...(Platform.OS === 'web'
            ? ({ position: 'sticky', top: LAYOUT.sidebarStickyTop } as const)
            : null),
        }}
      >
        {sidebar}
      </View>
    </View>
  )
}
