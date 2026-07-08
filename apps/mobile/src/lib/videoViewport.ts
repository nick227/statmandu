import { useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

/** Full-bleed film page height for the video browse destination. */
export function useImmersiveFilmStageHeight() {
  const { height } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  return Math.max(height - insets.top, 320)
}
