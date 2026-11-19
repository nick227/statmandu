/**
 * Studio Panel Navigation Types
 *
 * Implements the 3-level contextual panel hierarchy:
 * Level 1: Category (Subject, Card, Content, Artwork, Appearance)
 * Level 2: Property Group (e.g. under Appearance: Layout, Typography, Colors, Framing, Effects)
 * Level 3: Detailed Controls (Sliders, pickers, steppers, swatches)
 */

export type StudioCategory = 'subject' | 'card' | 'content' | 'artwork' | 'appearance'

export type AppearanceGroup = 'layout' | 'typography' | 'colors' | 'framing' | 'effects'

export type StudioPanelLocation =
  | { level: 1; category?: StudioCategory }
  | { level: 2; category: StudioCategory }
  | { level: 3; category: 'appearance'; group: AppearanceGroup }
  | { level: 3; category: 'artwork'; group: 'adjust' }

export interface StudioBreadcrumb {
  label: string
  location: StudioPanelLocation
}
