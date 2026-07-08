import type { ReactNode } from 'react'
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native'
import { LAYOUT } from './layoutConstants'

/** Sticky right rail for wide web layouts (entity profiles, game detail). */
export function WideSidebarColumn({ children }: { children: ReactNode }) {
  // `sticky` / `100vh` are web CSS values RN's ViewStyle doesn't model.
  const webSticky = Platform.OS === 'web'
    ? ({
        position: 'sticky',
        top: LAYOUT.sidebarStickyTop,
        alignSelf: 'flex-start',
        maxHeight: '100vh',
        overflow: 'auto',
      } as unknown as ViewStyle)
    : null

  const style: StyleProp<ViewStyle> = {
    width: '30%',
    maxWidth: 360,
    ...webSticky,
  }

  return (
    <View className="gap-md border-l border-border bg-canvas px-md py-md" style={style}>
      {children}
    </View>
  )
}
