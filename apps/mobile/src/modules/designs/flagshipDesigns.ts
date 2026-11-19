/**
 * RARE 20 Flagship Designs & Positional Content Slot Engine
 *
 * Each flagship design defines a complete, visually distinctive composition:
 * - Specific spatial layout and geometric slots
 * - Positional inputs (input1, input2, input3) with preferred/min font sizes, wrapping rules, and bounds
 * - Unique backgrounds, decorative layers, and visual traditions
 *
 * All 20 designs compile through the deterministic adaptive typography engine into rdc-composition-v1.
 */

import type {
  CardComposition,
  CardCompositionLayer,
} from '@/modules/cards/CardCompositionRenderer'
import {
  fitTextToSlot,
  type FontRole,
  type TextSlotBounds,
} from '@/modules/typography/textFit'

export interface PositionalTextSlot {
  id: 'input1' | 'input2' | 'input3'
  label: string
  bounds: TextSlotBounds
  x: number
  y: number
  fill: string
  fontRole: FontRole
  allCaps?: boolean
}

export interface FlagshipDesign {
  id: string
  name: string
  family: string
  description: string
  visualTradition: string
  palette: {
    background: string
    surface: string
    foreground: string
    accent: string
    border: string
    subtext: string
  }
  artwork: {
    x: number
    y: number
    width: number
    height: number
    tint?: string
    borderWidth?: number
    borderColor?: string
  }
  slots: {
    input1: PositionalTextSlot
    input2: PositionalTextSlot
    input3: PositionalTextSlot
  }
  decorations?: (palette: FlagshipDesign['palette']) => CardCompositionLayer[]
}

// ----------------------------------------------------------------------------
// The 20 Curated Flagship Designs
// ----------------------------------------------------------------------------

export const FLAGSHIP_DESIGNS: FlagshipDesign[] = [
  // 1. Classic Collector
  {
    id: 'classic-collector',
    name: 'Classic Collector',
    family: 'Classic',
    description: 'Traditional portrait window, structured nameplate, gold and navy trading card border.',
    visualTradition: 'Heritage Baseball & Physical Trading Cards',
    palette: {
      background: '#1A2332',
      surface: '#243044',
      foreground: '#FFFFFF',
      accent: '#EAB308',
      border: '#D4AF37',
      subtext: '#94A3B8',
    },
    artwork: { x: 44, y: 56, width: 512, height: 480, tint: '#0F172A', borderWidth: 3, borderColor: '#D4AF37' },
    slots: {
      input1: {
        id: 'input1',
        label: 'Subject Name',
        x: 50,
        y: 570,
        fill: '#FFFFFF',
        fontRole: 'serif',
        allCaps: true,
        bounds: { width: 500, height: 60, preferredFontSize: 34, minFontSize: 20, maxLines: 1, fontRole: 'serif' },
      },
      input2: {
        id: 'input2',
        label: 'Discipline / Team',
        x: 50,
        y: 636,
        fill: '#EAB308',
        fontRole: 'sans',
        allCaps: true,
        bounds: { width: 500, height: 32, preferredFontSize: 16, minFontSize: 12, maxLines: 1, fontRole: 'sans' },
      },
      input3: {
        id: 'input3',
        label: 'Career Highlights / Bio',
        x: 50,
        y: 680,
        fill: '#CBD5E1',
        fontRole: 'sans',
        bounds: { width: 500, height: 160, preferredFontSize: 15, minFontSize: 11, maxLines: 6, fontRole: 'sans' },
      },
    },
    decorations: (p) => [
      { id: 'dec-outer-frame', type: 'RECTANGLE', x: 16, y: 16, width: 568, height: 868, fill: p.border },
      { id: 'dec-inner-mat', type: 'RECTANGLE', x: 20, y: 20, width: 560, height: 860, fill: p.background },
      { id: 'dec-gold-bar', type: 'RECTANGLE', x: 44, y: 546, width: 512, height: 4, fill: p.accent },
    ],
  },

  // 2. Prestige Gold
  {
    id: 'prestige-gold',
    name: 'Prestige Gold',
    family: 'Prestige',
    description: 'Oversized portrait with deep obsidian card face and restrained 24k gold metallic frame.',
    visualTradition: 'High-End Luxury Memorabilia',
    palette: {
      background: '#08080A',
      surface: '#121215',
      foreground: '#FDFBF7',
      accent: '#D4AF37',
      border: '#3A321E',
      subtext: '#A3997F',
    },
    artwork: { x: 36, y: 44, width: 528, height: 530, tint: '#141418', borderWidth: 2, borderColor: '#D4AF37' },
    slots: {
      input1: {
        id: 'input1',
        label: 'Headline',
        x: 40,
        y: 600,
        fill: '#FDFBF7',
        fontRole: 'serif',
        allCaps: true,
        bounds: { width: 520, height: 72, preferredFontSize: 38, minFontSize: 22, maxLines: 1, fontRole: 'serif' },
      },
      input2: {
        id: 'input2',
        label: 'Title / Moniker',
        x: 40,
        y: 680,
        fill: '#D4AF37',
        fontRole: 'mono',
        allCaps: true,
        bounds: { width: 520, height: 30, preferredFontSize: 14, minFontSize: 10, maxLines: 1, fontRole: 'mono' },
      },
      input3: {
        id: 'input3',
        label: 'Provenance / Citation',
        x: 40,
        y: 722,
        fill: '#A3997F',
        fontRole: 'serif',
        bounds: { width: 520, height: 130, preferredFontSize: 15, minFontSize: 11, maxLines: 5, fontRole: 'serif' },
      },
    },
    decorations: (p) => [
      { id: 'dec-prestige-inset', type: 'RECTANGLE', x: 12, y: 12, width: 576, height: 876, fill: p.accent },
      { id: 'dec-prestige-void', type: 'RECTANGLE', x: 15, y: 15, width: 570, height: 870, fill: p.background },
    ],
  },

  // 3. Minimalist
  {
    id: 'minimalist-swiss',
    name: 'Minimalist',
    family: 'Minimalist',
    description: 'Dramatic negative space, stark Swiss typographic grid, and pure monochrome balance.',
    visualTradition: 'Swiss Modernist International Typographic Style',
    palette: {
      background: '#FFFFFF',
      surface: '#F4F4F5',
      foreground: '#0A0A0B',
      accent: '#FF4800',
      border: '#E4E4E7',
      subtext: '#52525B',
    },
    artwork: { x: 36, y: 36, width: 528, height: 500, tint: '#E4E4E7' },
    slots: {
      input1: {
        id: 'input1',
        label: 'Subject',
        x: 36,
        y: 560,
        fill: '#0A0A0B',
        fontRole: 'sans',
        allCaps: true,
        bounds: { width: 528, height: 90, preferredFontSize: 46, minFontSize: 24, maxLines: 2, fontRole: 'sans' },
      },
      input2: {
        id: 'input2',
        label: 'Discipline',
        x: 36,
        y: 662,
        fill: '#FF4800',
        fontRole: 'sans',
        allCaps: true,
        bounds: { width: 528, height: 28, preferredFontSize: 15, minFontSize: 11, maxLines: 1, fontRole: 'sans' },
      },
      input3: {
        id: 'input3',
        label: 'Statement',
        x: 36,
        y: 704,
        fill: '#52525B',
        fontRole: 'sans',
        bounds: { width: 528, height: 140, preferredFontSize: 14, minFontSize: 11, maxLines: 6, fontRole: 'sans' },
      },
    },
    decorations: (p) => [
      { id: 'dec-orange-square', type: 'RECTANGLE', x: 36, y: 856, width: 14, height: 14, fill: p.accent },
    ],
  },

  // 4. Editorial
  {
    id: 'editorial-broadsheet',
    name: 'Editorial',
    family: 'Editorial',
    description: 'Asymmetric portrait placement, sophisticated magazine typography, multiple editorial fields.',
    visualTradition: 'High-Fashion & Investigative Journalism',
    palette: {
      background: '#FAF7F2',
      surface: '#F1ECE1',
      foreground: '#18181B',
      accent: '#B91C1C',
      border: '#DCD4C4',
      subtext: '#3F3F46',
    },
    artwork: { x: 40, y: 70, width: 520, height: 430, tint: '#E7DFCF' },
    slots: {
      input1: {
        id: 'input1',
        label: 'Headline',
        x: 40,
        y: 524,
        fill: '#18181B',
        fontRole: 'serif',
        bounds: { width: 520, height: 76, preferredFontSize: 36, minFontSize: 22, maxLines: 2, fontRole: 'serif' },
      },
      input2: {
        id: 'input2',
        label: 'Category / Dateline',
        x: 40,
        y: 612,
        fill: '#B91C1C',
        fontRole: 'sans',
        allCaps: true,
        bounds: { width: 520, height: 26, preferredFontSize: 13, minFontSize: 10, maxLines: 1, fontRole: 'sans' },
      },
      input3: {
        id: 'input3',
        label: 'Editorial Feature Bio',
        x: 40,
        y: 648,
        fill: '#3F3F46',
        fontRole: 'serif',
        bounds: { width: 520, height: 180, preferredFontSize: 15, minFontSize: 11, maxLines: 7, fontRole: 'serif' },
      },
    },
    decorations: (p) => [
      { id: 'dec-masthead', type: 'TEXT', x: 40, y: 28, width: 520, height: 30, text: 'THE CHRONICLE ARCHIVE', fontSize: 13, fill: p.subtext },
      { id: 'dec-masthead-rule', type: 'RECTANGLE', x: 40, y: 56, width: 520, height: 1, fill: p.border },
    ],
  },

  // 5. Sports Legend
  {
    id: 'sports-legend',
    name: 'Sports Legend',
    family: 'Sports',
    description: 'Dynamic athletic framing, energetic color blocking, and statistics achievement panel.',
    visualTradition: 'Championship Athletic Cards & Memorabilia',
    palette: {
      background: '#0B132B',
      surface: '#1C2541',
      foreground: '#FFFFFF',
      accent: '#FF0055',
      border: '#3A506B',
      subtext: '#A7BED3',
    },
    artwork: { x: 30, y: 40, width: 540, height: 490, tint: '#121A30' },
    slots: {
      input1: {
        id: 'input1',
        label: 'Athlete Name',
        x: 36,
        y: 554,
        fill: '#FFFFFF',
        fontRole: 'display',
        allCaps: true,
        bounds: { width: 528, height: 74, preferredFontSize: 40, minFontSize: 24, maxLines: 1, fontRole: 'display' },
      },
      input2: {
        id: 'input2',
        label: 'Team & Number',
        x: 36,
        y: 638,
        fill: '#FF0055',
        fontRole: 'sans',
        allCaps: true,
        bounds: { width: 528, height: 32, preferredFontSize: 17, minFontSize: 12, maxLines: 1, fontRole: 'sans' },
      },
      input3: {
        id: 'input3',
        label: 'Career Milestones & Stats',
        x: 36,
        y: 684,
        fill: '#A7BED3',
        fontRole: 'sans',
        bounds: { width: 528, height: 160, preferredFontSize: 14, minFontSize: 11, maxLines: 6, fontRole: 'sans' },
      },
    },
    decorations: (p) => [
      { id: 'dec-pink-chevron', type: 'RECTANGLE', x: 0, y: 535, width: 600, height: 8, fill: p.accent },
    ],
  },

  // 6. Arcade 1985
  {
    id: 'arcade-1985',
    name: 'Arcade 1985',
    family: 'Arcade',
    description: 'Pixel typography, CRT phosphorus colors, and geometric 8-bit game cartridge aesthetics.',
    visualTradition: 'Golden Age Coin-Op & 8-Bit Consoles',
    palette: {
      background: '#0A051B',
      surface: '#1B0E3D',
      foreground: '#00F5FF',
      accent: '#FF31C8',
      border: '#FFE600',
      subtext: '#A78BFA',
    },
    artwork: { x: 40, y: 40, width: 520, height: 460, tint: '#150A2E', borderWidth: 4, borderColor: '#00F5FF' },
    slots: {
      input1: {
        id: 'input1',
        label: 'Player 1',
        x: 40,
        y: 530,
        fill: '#FFE600',
        fontRole: 'display',
        allCaps: true,
        bounds: { width: 520, height: 70, preferredFontSize: 36, minFontSize: 20, maxLines: 1, fontRole: 'display' },
      },
      input2: {
        id: 'input2',
        label: 'Specialty / High Score',
        x: 40,
        y: 610,
        fill: '#00F5FF',
        fontRole: 'mono',
        allCaps: true,
        bounds: { width: 520, height: 32, preferredFontSize: 15, minFontSize: 11, maxLines: 1, fontRole: 'mono' },
      },
      input3: {
        id: 'input3',
        label: 'Quest History',
        x: 40,
        y: 654,
        fill: '#A78BFA',
        fontRole: 'mono',
        bounds: { width: 520, height: 180, preferredFontSize: 13, minFontSize: 10, maxLines: 7, fontRole: 'mono' },
      },
    },
    decorations: (p) => [
      { id: 'dec-corner-1', type: 'RECTANGLE', x: 20, y: 20, width: 16, height: 16, fill: p.accent },
      { id: 'dec-corner-2', type: 'RECTANGLE', x: 564, y: 20, width: 16, height: 16, fill: p.accent },
      { id: 'dec-corner-3', type: 'RECTANGLE', x: 20, y: 864, width: 16, height: 16, fill: p.accent },
      { id: 'dec-corner-4', type: 'RECTANGLE', x: 564, y: 864, width: 16, height: 16, fill: p.accent },
    ],
  },

  // 7. Cyber Tech
  {
    id: 'cyber-tech',
    name: 'Cyber Tech',
    family: 'Cyber Tech',
    description: 'Technical HUD coordinates, telemetry data brackets, and high-density monospace layout.',
    visualTradition: 'Cyberpunk & Tactical Science Fiction',
    palette: {
      background: '#030712',
      surface: '#0B1329',
      foreground: '#38BDF8',
      accent: '#22C55E',
      border: '#1E293B',
      subtext: '#64748B',
    },
    artwork: { x: 36, y: 50, width: 528, height: 470, tint: '#0F172A', borderWidth: 2, borderColor: '#38BDF8' },
    slots: {
      input1: {
        id: 'input1',
        label: 'Agent Identifier',
        x: 40,
        y: 546,
        fill: '#38BDF8',
        fontRole: 'mono',
        allCaps: true,
        bounds: { width: 520, height: 64, preferredFontSize: 32, minFontSize: 18, maxLines: 1, fontRole: 'mono' },
      },
      input2: {
        id: 'input2',
        label: 'Sector & Clearance',
        x: 40,
        y: 620,
        fill: '#22C55E',
        fontRole: 'mono',
        allCaps: true,
        bounds: { width: 520, height: 28, preferredFontSize: 14, minFontSize: 10, maxLines: 1, fontRole: 'mono' },
      },
      input3: {
        id: 'input3',
        label: 'Telemetry Readout',
        x: 40,
        y: 658,
        fill: '#94A3B8',
        fontRole: 'mono',
        bounds: { width: 520, height: 180, preferredFontSize: 13, minFontSize: 10, maxLines: 7, fontRole: 'mono' },
      },
    },
    decorations: (p) => [
      { id: 'dec-hud-bar', type: 'RECTANGLE', x: 36, y: 24, width: 200, height: 4, fill: p.foreground },
      { id: 'dec-status-dot', type: 'RECTANGLE', x: 550, y: 22, width: 8, height: 8, fill: p.accent },
    ],
  },

  // 8. Synthwave
  {
    id: 'synthwave-outrun',
    name: 'Synthwave',
    family: 'Synthwave',
    description: 'Electric horizon lines, outrun sunset palette, and expressive 80s typography.',
    visualTradition: 'Retro-Futurism & Neon Electronic Music',
    palette: {
      background: '#1F0338',
      surface: '#33085A',
      foreground: '#FF71CE',
      accent: '#01CDFE',
      border: '#7209B7',
      subtext: '#E2B4FF',
    },
    artwork: { x: 36, y: 44, width: 528, height: 480, tint: '#290647' },
    slots: {
      input1: {
        id: 'input1',
        label: 'Title',
        x: 40,
        y: 550,
        fill: '#FF71CE',
        fontRole: 'display',
        allCaps: true,
        bounds: { width: 520, height: 76, preferredFontSize: 40, minFontSize: 22, maxLines: 1, fontRole: 'display' },
      },
      input2: {
        id: 'input2',
        label: 'Genre / Tempo',
        x: 40,
        y: 636,
        fill: '#01CDFE',
        fontRole: 'sans',
        allCaps: true,
        bounds: { width: 520, height: 30, preferredFontSize: 15, minFontSize: 11, maxLines: 1, fontRole: 'sans' },
      },
      input3: {
        id: 'input3',
        label: 'Tracklist / Lore',
        x: 40,
        y: 678,
        fill: '#E2B4FF',
        fontRole: 'sans',
        bounds: { width: 520, height: 170, preferredFontSize: 14, minFontSize: 11, maxLines: 6, fontRole: 'sans' },
      },
    },
    decorations: (p) => [
      { id: 'dec-laser-line-1', type: 'RECTANGLE', x: 0, y: 532, width: 600, height: 2, fill: p.accent },
      { id: 'dec-laser-line-2', type: 'RECTANGLE', x: 0, y: 538, width: 600, height: 4, fill: p.foreground },
    ],
  },

  // 9. Comic Book
  {
    id: 'comic-book',
    name: 'Comic Book',
    family: 'Comic Book',
    description: 'Heavy ink contours, pop action yellow, energetic title badges, and pulp halftone vibrancy.',
    visualTradition: 'Silver & Bronze Age Graphic Novels',
    palette: {
      background: '#FFF000',
      surface: '#FFFFFF',
      foreground: '#000000',
      accent: '#E60000',
      border: '#000000',
      subtext: '#1C1917',
    },
    artwork: { x: 30, y: 40, width: 540, height: 470, tint: '#FFFFFF', borderWidth: 6, borderColor: '#000000' },
    slots: {
      input1: {
        id: 'input1',
        label: 'Hero / Issue Name',
        x: 36,
        y: 534,
        fill: '#000000',
        fontRole: 'display',
        allCaps: true,
        bounds: { width: 528, height: 80, preferredFontSize: 44, minFontSize: 24, maxLines: 1, fontRole: 'display' },
      },
      input2: {
        id: 'input2',
        label: 'Superpower / Origin',
        x: 36,
        y: 622,
        fill: '#E60000',
        fontRole: 'display',
        allCaps: true,
        bounds: { width: 528, height: 34, preferredFontSize: 18, minFontSize: 13, maxLines: 1, fontRole: 'display' },
      },
      input3: {
        id: 'input3',
        label: 'Issue Synopsis',
        x: 36,
        y: 666,
        fill: '#1C1917',
        fontRole: 'sans',
        bounds: { width: 528, height: 170, preferredFontSize: 14, minFontSize: 11, maxLines: 6, fontRole: 'sans' },
      },
    },
    decorations: (p) => [
      { id: 'dec-action-badge', type: 'RECTANGLE', x: 440, y: 20, width: 120, height: 30, fill: p.accent },
      { id: 'dec-action-text', type: 'TEXT', x: 445, y: 26, width: 110, height: 20, text: 'AUTHENTIC #1', fontSize: 11, fill: '#FFFFFF' },
    ],
  },

  // 10. Gothic
  {
    id: 'gothic-nocturne',
    name: 'Gothic',
    family: 'Gothic',
    description: 'Cathedral arches, deep crimson and obsidian tones, ornate serif filigree.',
    visualTradition: 'Dark Romanticism & Antique Lithographs',
    palette: {
      background: '#0D090A',
      surface: '#1A1114',
      foreground: '#E8D7D8',
      accent: '#9B111E',
      border: '#4A1D24',
      subtext: '#A38F92',
    },
    artwork: { x: 44, y: 60, width: 512, height: 460, tint: '#160E11', borderWidth: 3, borderColor: '#9B111E' },
    slots: {
      input1: {
        id: 'input1',
        label: 'Figure Name',
        x: 44,
        y: 544,
        fill: '#E8D7D8',
        fontRole: 'serif',
        bounds: { width: 512, height: 76, preferredFontSize: 36, minFontSize: 20, maxLines: 1, fontRole: 'serif' },
      },
      input2: {
        id: 'input2',
        label: 'Title / Epitaph',
        x: 44,
        y: 630,
        fill: '#9B111E',
        fontRole: 'serif',
        allCaps: true,
        bounds: { width: 512, height: 30, preferredFontSize: 15, minFontSize: 11, maxLines: 1, fontRole: 'serif' },
      },
      input3: {
        id: 'input3',
        label: 'Legend & Testament',
        x: 44,
        y: 672,
        fill: '#A38F92',
        fontRole: 'serif',
        bounds: { width: 512, height: 180, preferredFontSize: 14, minFontSize: 10, maxLines: 7, fontRole: 'serif' },
      },
    },
    decorations: (p) => [
      { id: 'dec-outer-crimson', type: 'RECTANGLE', x: 14, y: 14, width: 572, height: 872, fill: p.accent },
      { id: 'dec-inner-night', type: 'RECTANGLE', x: 18, y: 18, width: 564, height: 864, fill: p.background },
    ],
  },

  // 11. Fantasy
  {
    id: 'fantasy-parchment',
    name: 'Fantasy',
    family: 'Fantasy',
    description: 'Illuminated parchment borders, aged parchment field, heroic mythical attributes.',
    visualTradition: 'Medieval Manuscripts & Tabletop Lore',
    palette: {
      background: '#EAE1CE',
      surface: '#DFCDB5',
      foreground: '#2B1E16',
      accent: '#8A5D28',
      border: '#785429',
      subtext: '#594436',
    },
    artwork: { x: 44, y: 50, width: 512, height: 460, tint: '#CBBBA3', borderWidth: 4, borderColor: '#785429' },
    slots: {
      input1: {
        id: 'input1',
        label: 'Hero / Entity',
        x: 44,
        y: 536,
        fill: '#2B1E16',
        fontRole: 'serif',
        bounds: { width: 512, height: 72, preferredFontSize: 36, minFontSize: 22, maxLines: 1, fontRole: 'serif' },
      },
      input2: {
        id: 'input2',
        label: 'Guild / Realm',
        x: 44,
        y: 618,
        fill: '#8A5D28',
        fontRole: 'serif',
        allCaps: true,
        bounds: { width: 512, height: 30, preferredFontSize: 15, minFontSize: 11, maxLines: 1, fontRole: 'serif' },
      },
      input3: {
        id: 'input3',
        label: 'Chronicles',
        x: 44,
        y: 660,
        fill: '#594436',
        fontRole: 'serif',
        bounds: { width: 512, height: 180, preferredFontSize: 14, minFontSize: 10, maxLines: 7, fontRole: 'serif' },
      },
    },
    decorations: (p) => [
      { id: 'dec-parchment-border', type: 'RECTANGLE', x: 20, y: 20, width: 560, height: 860, fill: p.border },
      { id: 'dec-parchment-fill', type: 'RECTANGLE', x: 24, y: 24, width: 552, height: 852, fill: p.background },
    ],
  },

  // 12. Film Noir
  {
    id: 'film-noir',
    name: 'Film Noir',
    family: 'Film Noir',
    description: 'High-contrast monochrome chiaroscuro, cinematic letterbox aspect, understated typography.',
    visualTradition: '1940s Classic Cinema & Chiaroscuro Photography',
    palette: {
      background: '#0A0A0A',
      surface: '#171717',
      foreground: '#FAFAFA',
      accent: '#E5E5E5',
      border: '#404040',
      subtext: '#A3A3A3',
    },
    artwork: { x: 0, y: 80, width: 600, height: 480, tint: '#171717' },
    slots: {
      input1: {
        id: 'input1',
        label: 'Title',
        x: 40,
        y: 590,
        fill: '#FAFAFA',
        fontRole: 'serif',
        allCaps: true,
        bounds: { width: 520, height: 70, preferredFontSize: 38, minFontSize: 22, maxLines: 1, fontRole: 'serif' },
      },
      input2: {
        id: 'input2',
        label: 'Case Number / Year',
        x: 40,
        y: 670,
        fill: '#A3A3A3',
        fontRole: 'mono',
        allCaps: true,
        bounds: { width: 520, height: 26, preferredFontSize: 13, minFontSize: 10, maxLines: 1, fontRole: 'mono' },
      },
      input3: {
        id: 'input3',
        label: 'Case Synopsis',
        x: 40,
        y: 706,
        fill: '#E5E5E5',
        fontRole: 'serif',
        bounds: { width: 520, height: 140, preferredFontSize: 14, minFontSize: 10, maxLines: 5, fontRole: 'serif' },
      },
    },
    decorations: (p) => [
      { id: 'dec-cinematic-top', type: 'RECTANGLE', x: 0, y: 0, width: 600, height: 80, fill: '#000000' },
      { id: 'dec-cinematic-rule', type: 'RECTANGLE', x: 40, y: 574, width: 520, height: 1, fill: p.border },
    ],
  },

  // 13. Hip-Hop Mixtape
  {
    id: 'hiphop-mixtape',
    name: 'Hip-Hop Mixtape',
    family: 'Hip-Hop',
    description: 'Album-cover square aspect crop, raw street typography, textured collage vibe.',
    visualTradition: 'Urban Street Culture & Cassette Era Releases',
    palette: {
      background: '#121212',
      surface: '#1E1E1E',
      foreground: '#FFFFFF',
      accent: '#FF0033',
      border: '#333333',
      subtext: '#9E9E9E',
    },
    artwork: { x: 40, y: 40, width: 520, height: 500, tint: '#262626' },
    slots: {
      input1: {
        id: 'input1',
        label: 'Artist / Alias',
        x: 40,
        y: 560,
        fill: '#FFFFFF',
        fontRole: 'display',
        allCaps: true,
        bounds: { width: 520, height: 80, preferredFontSize: 44, minFontSize: 24, maxLines: 1, fontRole: 'display' },
      },
      input2: {
        id: 'input2',
        label: 'Mixtape Volume',
        x: 40,
        y: 650,
        fill: '#FF0033',
        fontRole: 'sans',
        allCaps: true,
        bounds: { width: 520, height: 30, preferredFontSize: 16, minFontSize: 12, maxLines: 1, fontRole: 'sans' },
      },
      input3: {
        id: 'input3',
        label: 'Credits & Production',
        x: 40,
        y: 692,
        fill: '#9E9E9E',
        fontRole: 'mono',
        bounds: { width: 520, height: 150, preferredFontSize: 13, minFontSize: 10, maxLines: 6, fontRole: 'mono' },
      },
    },
    decorations: (p) => [
      { id: 'dec-parental-box', type: 'RECTANGLE', x: 44, y: 490, width: 110, height: 40, fill: '#000000' },
      { id: 'dec-parental-text', type: 'TEXT', x: 48, y: 502, width: 100, height: 18, text: 'RARE EXCLUSIVE', fontSize: 10, fill: '#FFFFFF' },
    ],
  },

  // 14. Concert Poster
  {
    id: 'concert-poster',
    name: 'Concert Poster',
    family: 'Concert Poster',
    description: 'Towering gig typography, live-performance frame crop, tour and venue details.',
    visualTradition: 'Screen-Printed Gig Posters & Festival Promos',
    palette: {
      background: '#1A0C08',
      surface: '#2B160F',
      foreground: '#FF6B35',
      accent: '#F7C59F',
      border: '#572E1B',
      subtext: '#EFEFD0',
    },
    artwork: { x: 40, y: 150, width: 520, height: 450, tint: '#331B13' },
    slots: {
      input1: {
        id: 'input1',
        label: 'Headliner Name',
        x: 40,
        y: 40,
        fill: '#FF6B35',
        fontRole: 'display',
        allCaps: true,
        bounds: { width: 520, height: 96, preferredFontSize: 52, minFontSize: 28, maxLines: 1, fontRole: 'display' },
      },
      input2: {
        id: 'input2',
        label: 'Support Acts / Tour',
        x: 40,
        y: 620,
        fill: '#F7C59F',
        fontRole: 'sans',
        allCaps: true,
        bounds: { width: 520, height: 34, preferredFontSize: 18, minFontSize: 12, maxLines: 1, fontRole: 'sans' },
      },
      input3: {
        id: 'input3',
        label: 'Dates & Venue Schedule',
        x: 40,
        y: 666,
        fill: '#EFEFD0',
        fontRole: 'mono',
        bounds: { width: 520, height: 180, preferredFontSize: 13, minFontSize: 10, maxLines: 7, fontRole: 'mono' },
      },
    },
    decorations: (p) => [
      { id: 'dec-tour-rule-top', type: 'RECTANGLE', x: 40, y: 140, width: 520, height: 2, fill: p.accent },
      { id: 'dec-tour-rule-bottom', type: 'RECTANGLE', x: 40, y: 608, width: 520, height: 2, fill: p.accent },
    ],
  },

  // 15. Vintage Press
  {
    id: 'vintage-press',
    name: 'Vintage Press',
    family: 'Vintage',
    description: 'Aged paper parchment, delicate letterpress ruling, traditional serif typography.',
    visualTradition: '19th Century Broadside & Letterpress Printing',
    palette: {
      background: '#F4ECE1',
      surface: '#EAE0D0',
      foreground: '#362B28',
      accent: '#8B4513',
      border: '#BFB19E',
      subtext: '#5E4F49',
    },
    artwork: { x: 44, y: 56, width: 512, height: 460, tint: '#DDD2C0', borderWidth: 2, borderColor: '#362B28' },
    slots: {
      input1: {
        id: 'input1',
        label: 'Name',
        x: 44,
        y: 536,
        fill: '#362B28',
        fontRole: 'serif',
        allCaps: true,
        bounds: { width: 512, height: 72, preferredFontSize: 36, minFontSize: 20, maxLines: 1, fontRole: 'serif' },
      },
      input2: {
        id: 'input2',
        label: 'Occupation',
        x: 44,
        y: 618,
        fill: '#8B4513',
        fontRole: 'serif',
        allCaps: true,
        bounds: { width: 512, height: 30, preferredFontSize: 15, minFontSize: 11, maxLines: 1, fontRole: 'serif' },
      },
      input3: {
        id: 'input3',
        label: 'Historical Account',
        x: 44,
        y: 660,
        fill: '#5E4F49',
        fontRole: 'serif',
        bounds: { width: 512, height: 180, preferredFontSize: 14, minFontSize: 10, maxLines: 7, fontRole: 'serif' },
      },
    },
    decorations: (p) => [
      { id: 'dec-press-border-outer', type: 'RECTANGLE', x: 18, y: 18, width: 564, height: 864, fill: p.foreground },
      { id: 'dec-press-border-inner', type: 'RECTANGLE', x: 22, y: 22, width: 556, height: 856, fill: p.background },
    ],
  },

  // 16. Risograph
  {
    id: 'risograph-print',
    name: 'Risograph',
    family: 'Risograph',
    description: 'Two-color tactile spot inks, slight misregistration offset bars, and vibrant contemporary print look.',
    visualTradition: 'Art Publishing & Independent Print Workshops',
    palette: {
      background: '#FFF9F0',
      surface: '#FDF0DF',
      foreground: '#0E3B43',
      accent: '#FF5733',
      border: '#FF5733',
      subtext: '#285960',
    },
    artwork: { x: 40, y: 50, width: 520, height: 480, tint: '#F0E6D6' },
    slots: {
      input1: {
        id: 'input1',
        label: 'Subject Headline',
        x: 40,
        y: 556,
        fill: '#0E3B43',
        fontRole: 'sans',
        allCaps: true,
        bounds: { width: 520, height: 76, preferredFontSize: 40, minFontSize: 22, maxLines: 1, fontRole: 'sans' },
      },
      input2: {
        id: 'input2',
        label: 'Edition & Ink Run',
        x: 40,
        y: 642,
        fill: '#FF5733',
        fontRole: 'mono',
        allCaps: true,
        bounds: { width: 520, height: 30, preferredFontSize: 15, minFontSize: 11, maxLines: 1, fontRole: 'mono' },
      },
      input3: {
        id: 'input3',
        label: 'Artist Statement',
        x: 40,
        y: 684,
        fill: '#285960',
        fontRole: 'sans',
        bounds: { width: 520, height: 160, preferredFontSize: 14, minFontSize: 10, maxLines: 6, fontRole: 'sans' },
      },
    },
    decorations: (p) => [
      // Simulated misregistration offset rectangle
      { id: 'dec-riso-offset', type: 'RECTANGLE', x: 44, y: 54, width: 520, height: 480, fill: 'rgba(255, 87, 51, 0.15)' },
    ],
  },

  // 17. Brutalist
  {
    id: 'brutalist-block',
    name: 'Brutalist',
    family: 'Brutalism',
    description: 'Raw high-contrast geometric blocks, uncompromising grid borders, giant monospace typography.',
    visualTradition: 'Architectural Brutalism & Raw Web Aesthetics',
    palette: {
      background: '#FFFFFF',
      surface: '#EAEAEA',
      foreground: '#000000',
      accent: '#000000',
      border: '#000000',
      subtext: '#222222',
    },
    artwork: { x: 24, y: 24, width: 552, height: 490, tint: '#D4D4D4', borderWidth: 8, borderColor: '#000000' },
    slots: {
      input1: {
        id: 'input1',
        label: 'ID NAME',
        x: 24,
        y: 536,
        fill: '#000000',
        fontRole: 'mono',
        allCaps: true,
        bounds: { width: 552, height: 86, preferredFontSize: 46, minFontSize: 24, maxLines: 1, fontRole: 'mono' },
      },
      input2: {
        id: 'input2',
        label: 'CATEGORY CODE',
        x: 24,
        y: 634,
        fill: '#000000',
        fontRole: 'mono',
        allCaps: true,
        bounds: { width: 552, height: 32, preferredFontSize: 17, minFontSize: 12, maxLines: 1, fontRole: 'mono' },
      },
      input3: {
        id: 'input3',
        label: 'DATA SPECIFICATION',
        x: 24,
        y: 678,
        fill: '#222222',
        fontRole: 'mono',
        bounds: { width: 552, height: 180, preferredFontSize: 13, minFontSize: 10, maxLines: 7, fontRole: 'mono' },
      },
    },
    decorations: (p) => [
      { id: 'dec-brutalist-rule', type: 'RECTANGLE', x: 24, y: 626, width: 552, height: 4, fill: '#000000' },
    ],
  },

  // 18. Pulp Fiction
  {
    id: 'pulp-fiction',
    name: 'Pulp Fiction',
    family: 'Pulp Fiction',
    description: 'Sensationalist adventure headlines, weathered newsprint palette, high-drama action framing.',
    visualTradition: '1930s Dime Novels & Detective Mystery Pulps',
    palette: {
      background: '#E8D5B5',
      surface: '#DCC39A',
      foreground: '#1B140E',
      accent: '#C1121F',
      border: '#780000',
      subtext: '#453225',
    },
    artwork: { x: 36, y: 44, width: 528, height: 470, tint: '#CBB48B', borderWidth: 4, borderColor: '#1B140E' },
    slots: {
      input1: {
        id: 'input1',
        label: 'Story Title',
        x: 36,
        y: 536,
        fill: '#C1121F',
        fontRole: 'display',
        allCaps: true,
        bounds: { width: 528, height: 80, preferredFontSize: 42, minFontSize: 22, maxLines: 1, fontRole: 'display' },
      },
      input2: {
        id: 'input2',
        label: 'The Case Of...',
        x: 36,
        y: 624,
        fill: '#1B140E',
        fontRole: 'serif',
        allCaps: true,
        bounds: { width: 528, height: 30, preferredFontSize: 15, minFontSize: 11, maxLines: 1, fontRole: 'serif' },
      },
      input3: {
        id: 'input3',
        label: 'Dime Story Synopsis',
        x: 36,
        y: 666,
        fill: '#453225',
        fontRole: 'serif',
        bounds: { width: 528, height: 180, preferredFontSize: 14, minFontSize: 10, maxLines: 7, fontRole: 'serif' },
      },
    },
    decorations: (p) => [
      { id: 'dec-pulp-price', type: 'TEXT', x: 480, y: 16, width: 80, height: 24, text: '10¢ RARE', fontSize: 13, fill: p.accent },
    ],
  },

  // 19. Polaroid
  {
    id: 'polaroid-instant',
    name: 'Polaroid',
    family: 'Film Photography',
    description: 'Instant film white border with deep bottom margin, sparse handwritten-style caption.',
    visualTradition: 'Instant Analogue Film & Personal Memorabilia',
    palette: {
      background: '#18181B',
      surface: '#FDFBF7',
      foreground: '#111827',
      accent: '#3B82F6',
      border: '#E5E7EB',
      subtext: '#4B5563',
    },
    // The photo area is centered inside the white film housing
    artwork: { x: 50, y: 50, width: 500, height: 500, tint: '#1E293B' },
    slots: {
      input1: {
        id: 'input1',
        label: 'Photo Caption',
        x: 50,
        y: 580,
        fill: '#111827',
        fontRole: 'sans',
        bounds: { width: 500, height: 60, preferredFontSize: 30, minFontSize: 18, maxLines: 1, fontRole: 'sans' },
      },
      input2: {
        id: 'input2',
        label: 'Date & Location',
        x: 50,
        y: 650,
        fill: '#4B5563',
        fontRole: 'sans',
        bounds: { width: 500, height: 28, preferredFontSize: 15, minFontSize: 11, maxLines: 1, fontRole: 'sans' },
      },
      input3: {
        id: 'input3',
        label: 'Memory Note',
        x: 50,
        y: 688,
        fill: '#6B7280',
        fontRole: 'sans',
        bounds: { width: 500, height: 130, preferredFontSize: 14, minFontSize: 10, maxLines: 5, fontRole: 'sans' },
      },
    },
    decorations: (p) => [
      // The iconic instant film casing
      { id: 'dec-polaroid-casing', type: 'RECTANGLE', x: 26, y: 26, width: 548, height: 830, fill: '#FFFFFF' },
    ],
  },

  // 20. Avant-Garde
  {
    id: 'avant-garde',
    name: 'Avant-Garde',
    family: 'Avant-Garde',
    description: 'Experimental vertical headline, asymmetrical crop, unconventional composition geometry.',
    visualTradition: 'De Stijl, Bauhaus & Experimental Graphic Design',
    palette: {
      background: '#F1F1ED',
      surface: '#E2E2DC',
      foreground: '#0E0E10',
      accent: '#2B50EC',
      border: '#0E0E10',
      subtext: '#3A3A40',
    },
    artwork: { x: 120, y: 40, width: 440, height: 540, tint: '#C8C8BF' },
    slots: {
      input1: {
        id: 'input1',
        label: 'Manifesto Title',
        x: 40,
        y: 604,
        fill: '#0E0E10',
        fontRole: 'display',
        allCaps: true,
        bounds: { width: 520, height: 84, preferredFontSize: 44, minFontSize: 22, maxLines: 1, fontRole: 'display' },
      },
      input2: {
        id: 'input2',
        label: 'Movement / Sector',
        x: 40,
        y: 700,
        fill: '#2B50EC',
        fontRole: 'sans',
        allCaps: true,
        bounds: { width: 520, height: 30, preferredFontSize: 16, minFontSize: 11, maxLines: 1, fontRole: 'sans' },
      },
      input3: {
        id: 'input3',
        label: 'Thesis Statement',
        x: 40,
        y: 740,
        fill: '#3A3A40',
        fontRole: 'sans',
        bounds: { width: 520, height: 120, preferredFontSize: 13, minFontSize: 10, maxLines: 5, fontRole: 'sans' },
      },
    },
    decorations: (p) => [
      // Blue avant-garde color block column on the left
      { id: 'dec-blue-pillar', type: 'RECTANGLE', x: 40, y: 40, width: 60, height: 540, fill: p.accent },
    ],
  },
]

// ----------------------------------------------------------------------------
// Compiler & Positional Text Fit Engine
// ----------------------------------------------------------------------------

export interface PositionalInputs {
  input1?: string
  input2?: string
  input3?: string
}

export interface FlagshipCompilationResult {
  composition: CardComposition
  design: FlagshipDesign
  fittedFontSizes: Record<'input1' | 'input2' | 'input3', number>
  isOverflow: Record<'input1' | 'input2' | 'input3', boolean>
}

export function getFlagshipDesignById(id: string): FlagshipDesign | undefined {
  return FLAGSHIP_DESIGNS.find((d) => d.id === id) || FLAGSHIP_DESIGNS[0]
}

/**
 * Compiles a Flagship Design with 3 positional text inputs into an rdc-composition-v1 CardComposition.
 */
export function compileFlagshipDesign(
  designId: string,
  inputs: PositionalInputs = {},
  person?: { displayName?: string | null; bio?: string | null; hometown?: string | null } | null,
  assets?: Array<{ id: string; url: string; objectKey?: string }>,
): FlagshipCompilationResult {
  const design = getFlagshipDesignById(designId) || FLAGSHIP_DESIGNS[0]
  const { palette, artwork, slots } = design

  // Resolve input texts with sensible fallbacks from person or defaults
  const resolvedText1 = (inputs.input1?.trim() || person?.displayName || 'MAYA ANGELOU').trim()
  const resolvedText2 = (inputs.input2?.trim() || person?.hometown || 'POET & CIVIL RIGHTS ICON').trim()
  const resolvedText3 = (inputs.input3?.trim() || person?.bio || 'Phenomenal Woman, celebrated author, presidential poet, and civil rights champion whose literary voice moved generations.').trim()

  // Run bounded binary search text fitting for each of the 3 slots
  const fit1 = fitTextToSlot(resolvedText1, slots.input1.bounds)
  const fit2 = fitTextToSlot(resolvedText2, slots.input2.bounds)
  const fit3 = fitTextToSlot(resolvedText3, slots.input3.bounds)

  const fittedFontSizes = {
    input1: fit1.fontSize,
    input2: fit2.fontSize,
    input3: fit3.fontSize,
  }

  const isOverflow = {
    input1: fit1.isOverflow,
    input2: fit2.isOverflow,
    input3: fit3.isOverflow,
  }

  const layers: CardCompositionLayer[] = []

  // 1. Base card background
  layers.push({
    id: 'base-card-bg',
    type: 'RECTANGLE',
    x: 0,
    y: 0,
    width: 600,
    height: 900,
    fill: palette.background,
  })

  // 2. Pre-artwork decorations (e.g. polaroid white body casing)
  if (design.id === 'polaroid-instant' && design.decorations) {
    layers.push(...design.decorations(palette))
  }

  // 3. Artwork backdrop tint
  layers.push({
    id: 'artwork-backdrop-frame',
    type: 'RECTANGLE',
    x: artwork.x,
    y: artwork.y,
    width: artwork.width,
    height: artwork.height,
    fill: artwork.tint || palette.surface,
  })

  // 4. Artwork subject image
  const borderWidth = artwork.borderWidth || 0
  layers.push({
    id: 'artwork-subject-image',
    type: 'IMAGE',
    x: artwork.x + borderWidth,
    y: artwork.y + borderWidth,
    width: artwork.width - borderWidth * 2,
    height: artwork.height - borderWidth * 2,
    imageAssetId: assets?.[0]?.id,
  })

  // 5. Non-polaroid decorations
  if (design.id !== 'polaroid-instant' && design.decorations) {
    layers.push(...design.decorations(palette))
  }

  // 6. Positional Text Slot 1 (Headline)
  layers.push({
    id: 'slot-input1',
    type: 'TEXT',
    x: slots.input1.x,
    y: slots.input1.y,
    width: slots.input1.bounds.width,
    height: slots.input1.bounds.height,
    text: slots.input1.allCaps ? resolvedText1.toUpperCase() : resolvedText1,
    fontSize: fit1.fontSize,
    fill: slots.input1.fill,
  })

  // 7. Positional Text Slot 2 (Subhead)
  layers.push({
    id: 'slot-input2',
    type: 'TEXT',
    x: slots.input2.x,
    y: slots.input2.y,
    width: slots.input2.bounds.width,
    height: slots.input2.bounds.height,
    text: slots.input2.allCaps ? resolvedText2.toUpperCase() : resolvedText2,
    fontSize: fit2.fontSize,
    fill: slots.input2.fill,
  })

  // 8. Positional Text Slot 3 (Bio / Details)
  layers.push({
    id: 'slot-input3',
    type: 'TEXT',
    x: slots.input3.x,
    y: slots.input3.y,
    width: slots.input3.bounds.width,
    height: slots.input3.bounds.height,
    text: slots.input3.allCaps ? resolvedText3.toUpperCase() : resolvedText3,
    fontSize: fit3.fontSize,
    fill: slots.input3.fill,
  })

  const composition: CardComposition = {
    schemaVersion: 1,
    canvas: { width: 600, height: 900 },
    layers: layers.slice(0, 100),
    metadata: {
      rendererVersion: 'rdc-composition-v1',
      flagship: {
        id: design.id,
        name: design.name,
        inputs: {
          input1: resolvedText1,
          input2: resolvedText2,
          input3: resolvedText3,
        },
        fittedFontSizes,
        isOverflow,
      },
    },
  }

  return {
    composition,
    design,
    fittedFontSizes,
    isOverflow,
  }
}
