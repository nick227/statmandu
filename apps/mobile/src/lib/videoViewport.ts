import { useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

/** Matches floating tab bar in app/(tabs)/_layout.tsx */
export const FLOATING_TAB_BAR = {
  height: 62,
  bottom: 18,
} as const

export function useFloatingTabBarInset() {
  const insets = useSafeAreaInsets()
  return FLOATING_TAB_BAR.height + FLOATING_TAB_BAR.bottom + insets.bottom
}

/** Height available for a full-bleed page inside a tab (no screen title). */
export function useFilmStageHeight() {
  const { height } = useWindowDimensions()
  const tabInset = useFloatingTabBarInset()
  const insets = useSafeAreaInsets()
  return Math.max(height - insets.top - tabInset, 320)
}
