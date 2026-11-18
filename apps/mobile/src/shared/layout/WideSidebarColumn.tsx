import type { ReactNode } from 'react'
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native'
import { LAYOUT } from './layoutConstants'

/** Sticky right rail for wide web layouts (entity profiles, game detail). */
export function WideSidebarColumn({ children }: { children: ReactNode }) {
  // Sticky within the document scroll. Never create a second vertical
  // scrollbar inside the rail; long sidebars remain part of page flow.
  const webSticky = Platform.OS === 'web'
    ? ({
        position: 'sticky',
        top: LAYOUT.sidebarStickyTop,
        alignSelf: 'flex-start',
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
