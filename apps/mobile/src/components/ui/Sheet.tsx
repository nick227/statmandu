import { forwardRef, type ReactNode } from 'react'
import GorhomBottomSheet, { BottomSheetScrollView, type BottomSheetProps } from '@gorhom/bottom-sheet'

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
  children: ReactNode
}

export const Sheet = forwardRef<GorhomBottomSheet, SheetProps>(function Sheet(
  { snaps = ['collapsed', 'half', 'expanded'], children, ...props },
  ref
) {
  return (
    <GorhomBottomSheet
      ref={ref}
      index={0}
      snapPoints={snaps.map((s) => SNAP_POINTS[s])}
      backgroundStyle={{ backgroundColor: 'rgb(255 255 255)' }}
      handleIndicatorStyle={{ backgroundColor: 'rgb(229 231 235)' }}
      {...props}
    >
      {children}
    </GorhomBottomSheet>
  )
})

export { BottomSheetScrollView as SheetScrollView }
