import { forwardRef, type ReactNode } from 'react'
import GorhomBottomSheet, { BottomSheetScrollView, useBottomSheetTimingConfigs, type BottomSheetProps } from '@gorhom/bottom-sheet'
import { useNativeColor, motion } from '@/lib/theme'

// Collapsed / half / expanded sliding sheet — the entity profile shell's
// core interaction per the brand style guide's "UI language" section.
// Thin wrapper so every screen configures snap points the same way instead
// of hand-tuning @gorhom/bottom-sheet props per screen.
export type SheetSnapPoint = 'collapsed' | 'half' | 'expanded'

const SNAP_POINTS: Record<SheetSnapPoint, string> = {
  collapsed: '12%',
  half: '50%',
  expanded: '92%',
}

export interface SheetProps extends Omit<BottomSheetProps, 'snapPoints' | 'children'> {
  snaps?: SheetSnapPoint[]
  /** Which snap to start at (defaults to first snap). */
  initialSnap?: SheetSnapPoint
  children: ReactNode
}

export const Sheet = forwardRef<GorhomBottomSheet, SheetProps>(function Sheet(
  { snaps = ['collapsed', 'half', 'expanded'], initialSnap, children, ...props },
  ref
) {
  const surfaceColor = useNativeColor('surface')
  const borderColor = useNativeColor('border')
  const animationConfigs = useBottomSheetTimingConfigs({ duration: motion.sheetSnapMs })
  const initialIndex = Math.max(0, snaps.indexOf(initialSnap ?? snaps[0] ?? 'collapsed'))
  return (
    <GorhomBottomSheet
      ref={ref}
      index={initialIndex}
      snapPoints={snaps.map((s) => SNAP_POINTS[s])}
      backgroundStyle={{ backgroundColor: surfaceColor }}
      handleIndicatorStyle={{ backgroundColor: borderColor }}
      animationConfigs={animationConfigs}
      {...props}
    >
      {children}
    </GorhomBottomSheet>
  )
})

export { BottomSheetScrollView as SheetScrollView }
