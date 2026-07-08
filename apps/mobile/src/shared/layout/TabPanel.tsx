import type { ReactNode } from 'react'
import Animated, { FadeIn } from 'react-native-reanimated'

export interface TabPanelProps {
  active: string
  tab: string
  children: ReactNode
  className?: string
  animated?: boolean
}

export function TabPanel({ active, tab, children, className, animated = true }: TabPanelProps) {
  if (active !== tab) return null
  return (
    <Animated.View entering={animated ? FadeIn.duration(200) : undefined} className={className}>
      {children}
    </Animated.View>
  )
}
