export const LAYOUT = {
  wideBreakpoint: 1024,
  pageMaxWidth: 1180,
  pagePadding: 16,
  pagePaddingWide: 24,
  sectionGap: 24,
  /** Leaves the two exterior Card 1A flip tabs clear between rail items. */
  railGap: 48,
  /** Canonical 320px card plus 24px exterior controls on both sides. */
  railCardWidth: 368,
  railCardHeight: 448,
  /** Room for SiteHeader + safe-area; bump if header chrome grows. */
  sidebarStickyTop: 96,
} as const

/** Measurements shared by public surfaces. Component-specific geometry
 * stays with its owner instead of growing this into a second design system. */
export const UI = {
  controlHeight: { sm: 36, md: 44, lg: 52 },
  iconSize: { sm: 16, md: 20, lg: 24 },
  cardRadius: 16,
} as const
