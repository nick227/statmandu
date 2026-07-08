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

/** Film snap page with floating tab bar visible. */
export function useFilmStageHeight() {
  const { height } = useWindowDimensions()
  const tabInset = useFloatingTabBarInset()
  const insets = useSafeAreaInsets()
  return Math.max(height - insets.top - tabInset, 320)
}

/** Full-bleed film page when tab bar is hidden (immersive browse). */
export function useImmersiveFilmStageHeight() {
  const { height } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  return Math.max(height, 320)
}
