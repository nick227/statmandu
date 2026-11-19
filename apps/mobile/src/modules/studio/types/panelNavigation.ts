/**
 * Studio Panel Navigation Types
 *
 * Implements the 3-level contextual panel hierarchy:
 * Level 1: Category Menu (Subject, Card, Content, Artwork, Appearance)
 * Level 2: Options (Specific category workflows and presets)
 * Level 3: Detailed visual selections / presets (Capped at 3 levels)
 */

export type StudioCategory = 'subject' | 'card' | 'content' | 'artwork' | 'appearance'

export type AppearanceGroup = 'layout' | 'typography' | 'colors' | 'framing' | 'effects'

export type StudioPanelLocation =
  | { level: 1; category?: StudioCategory }
  | { level: 2; category: StudioCategory }
  | { level: 3; category: 'appearance'; group: AppearanceGroup }
  | { level: 3; category: 'artwork'; group: 'adjust' | 'style' }
  | { level: 3; category: 'subject'; group: 'cutout' }
  | { level: 3; category: 'card'; group: 'design' }

export interface StudioBreadcrumb {
  label: string
  location: StudioPanelLocation
}
