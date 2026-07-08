import type { ViewStyle } from 'react-native'
import { FLOATING_TAB_BAR } from '@/lib/videoViewport'

export const FLOATING_TAB_BAR_STYLE: ViewStyle = {
  position: 'absolute',
  left: 20,
  right: 20,
  bottom: FLOATING_TAB_BAR.bottom,
  height: FLOATING_TAB_BAR.height,
  borderRadius: 999,
  borderTopWidth: 0,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.12)',
  backgroundColor: 'rgba(8,10,16,0.92)',
}
