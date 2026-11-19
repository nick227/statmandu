/**
 * RARE Flagship Designs & Variable Positional Content Engine
 *
 * Each flagship design defines a complete, visually distinctive composition:
 * - Specific spatial layout and geometric bounds
 * - Variable positional inputs (DesignInput[]) with preferred/min font sizes, wrapping rules, and bounds
 * - Unique backgrounds, decorative layers, and visual traditions
 *
 * All designs compile through the deterministic adaptive typography engine into rdc-composition-v1.
 */

import type {
  CardComposition,
  CardCompositionLayer,
} from '@/modules/cards/CardCompositionRenderer'
import {
  fitTextToSlot,
  type FontRole,
  type Rect,
  type DesignInput,
} from '@/modules/typography/textFit'
import { getCardTypeById } from './cardTypes'

export type { Rect, DesignInput }

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
  inputs: DesignInput[]
  decorations?: (palette: FlagshipDesign['palette']) => CardCompositionLayer[]
}

// ----------------------------------------------------------------------------
// The Curated Flagship Prefabs & Classic Designs
// ----------------------------------------------------------------------------

export const FLAGSHIP_DESIGNS: FlagshipDesign[] = [
  // 1. Royal Heritage
  {
    id: 'royal-heritage',
    name: 'Royal Heritage',
    family: 'Heritage',
    description: 'Deep obsidian, 24k gold leaf ornamentation, regal filigree, and dramatic portrait framing.',
    visualTradition: 'Royal Portraiture & Regal Numismatics',
    palette: {
      background: '#090A0F',
      surface: '#151922',
      foreground: '#FFFFFF',
      accent: '#D4AF37',
      border: '#F59E0B',
      subtext: '#94A3B8',
    },
    artwork: { x: 44, y: 56, width: 512, height: 480, tint: '#0F172A', borderWidth: 3, borderColor: '#D4AF37' },
    inputs: [
      {
        id: 'input1',
        label: 'Subject Name',
        bounds: { x: 50, y: 570, width: 500, height: 60 },
        preferredFontSize: 34,
        minFontSize: 20,
        maxLines: 1,
        required: true,
        fill: '#FFFFFF',
        fontRole: 'serif',
        allCaps: true,
      },
      {
        id: 'input2',
        label: 'Title / Moniker',
        bounds: { x: 50, y: 636, width: 500, height: 32 },
        preferredFontSize: 16,
        minFontSize: 12,
        maxLines: 1,
        required: false,
        fill: '#D4AF37',
        fontRole: 'sans',
        allCaps: true,
      },
      {
        id: 'input3',
        label: 'Chronicle / Significance',
        bounds: { x: 50, y: 680, width: 500, height: 160 },
        preferredFontSize: 15,
        minFontSize: 11,
        maxLines: 6,
        required: false,
        fill: '#CBD5E1',
        fontRole: 'serif',
      },
    ],
    decorations: (p) => [
      { id: 'dec-outer-frame', type: 'RECTANGLE', x: 16, y: 16, width: 568, height: 868, fill: p.border },
      { id: 'dec-inner-mat', type: 'RECTANGLE', x: 20, y: 20, width: 560, height: 860, fill: p.background },
      { id: 'dec-gold-filigree-top', type: 'RECTANGLE', x: 44, y: 38, width: 512, height: 2, fill: p.accent },
      { id: 'dec-gold-bar', type: 'RECTANGLE', x: 44, y: 546, width: 512, height: 4, fill: p.accent },
      { id: 'dec-corner-tl', type: 'RECTANGLE', x: 26, y: 26, width: 12, height: 12, fill: p.accent },
      { id: 'dec-corner-tr', type: 'RECTANGLE', x: 562, y: 26, width: 12, height: 12, fill: p.accent },
      { id: 'dec-corner-bl', type: 'RECTANGLE', x: 26, y: 862, width: 12, height: 12, fill: p.accent },
      { id: 'dec-corner-br', type: 'RECTANGLE', x: 562, y: 862, width: 12, height: 12, fill: p.accent },
    ],
  },

  // 2. Arcade Legends
  {
    id: 'arcade-legends',
    name: 'Arcade Legends',
    family: 'Retro Arcade',
    description: 'Electric neon cyan, hot magenta, CRT scanline borders, and retro gaming stat power bars.',
    visualTradition: 'Coin-Op Arcade Cabinets & Pixel Art Era',
    palette: {
      background: '#080B1C',
      surface: '#121A38',
      foreground: '#00F0FF',
      accent: '#FF007A',
      border: '#FFE600',
      subtext: '#7DD3FC',
    },
    artwork: { x: 40, y: 54, width: 520, height: 460, tint: '#0D142D', borderWidth: 3, borderColor: '#00F0FF' },
    inputs: [
      {
        id: 'input1',
        label: 'Player Identifier',
        bounds: { x: 48, y: 540, width: 504, height: 56 },
        preferredFontSize: 32,
        minFontSize: 18,
        maxLines: 1,
        required: true,
        fill: '#00F0FF',
        fontRole: 'display',
        allCaps: true,
      },
      {
        id: 'input2',
        label: 'Character Class / Stage',
        bounds: { x: 48, y: 604, width: 504, height: 30 },
        preferredFontSize: 16,
        minFontSize: 11,
        maxLines: 1,
        required: false,
        fill: '#FFE600',
        fontRole: 'mono',
        allCaps: true,
      },
      {
        id: 'input3',
        label: 'Lore & High Score Feats',
        bounds: { x: 48, y: 644, width: 504, height: 170 },
        preferredFontSize: 14,
        minFontSize: 10,
        maxLines: 6,
        required: false,
        fill: '#E0F2FE',
        fontRole: 'sans',
      },
    ],
    decorations: (p) => [
      { id: 'dec-neon-outer', type: 'RECTANGLE', x: 14, y: 14, width: 572, height: 872, fill: p.border },
      { id: 'dec-neon-inner', type: 'RECTANGLE', x: 18, y: 18, width: 564, height: 864, fill: p.background },
      { id: 'dec-arcade-strip-top', type: 'RECTANGLE', x: 40, y: 32, width: 520, height: 4, fill: p.accent },
      { id: 'dec-arcade-power-bar', type: 'RECTANGLE', x: 40, y: 524, width: 520, height: 6, fill: p.foreground },
      { id: 'dec-arcade-box-1', type: 'RECTANGLE', x: 24, y: 24, width: 8, height: 8, fill: p.accent },
      { id: 'dec-arcade-box-2', type: 'RECTANGLE', x: 568, y: 24, width: 8, height: 8, fill: p.accent },
    ],
  },

  // 3. Modern Editorial
  {
    id: 'modern-editorial',
    name: 'Modern Editorial',
    family: 'Swiss Editorial',
    description: 'Gallery-quality Swiss typography, confident whitespace, stark monochrome, and vermilion accents.',
    visualTradition: 'International Typographic Style & Fine Art Monographs',
    palette: {
      background: '#0D0D0D',
      surface: '#1A1A1E',
      foreground: '#FAFAF9',
      accent: '#FF3B30',
      border: '#27272A',
      subtext: '#A1A1AA',
    },
    artwork: { x: 36, y: 44, width: 528, height: 500, tint: '#141416', borderWidth: 0 },
    inputs: [
      {
        id: 'input1',
        label: 'Subject Name',
        bounds: { x: 36, y: 570, width: 528, height: 64 },
        preferredFontSize: 36,
        minFontSize: 22,
        maxLines: 1,
        required: true,
        fill: '#FAFAF9',
        fontRole: 'sans',
        allCaps: false,
      },
      {
        id: 'input2',
        label: 'Discipline & Origin',
        bounds: { x: 36, y: 640, width: 528, height: 30 },
        preferredFontSize: 15,
        minFontSize: 11,
        maxLines: 1,
        required: false,
        fill: '#FF3B30',
        fontRole: 'mono',
        allCaps: true,
      },
      {
        id: 'input3',
        label: 'Critical Appraisal / Essay',
        bounds: { x: 36, y: 680, width: 528, height: 160 },
        preferredFontSize: 14,
        minFontSize: 10,
        maxLines: 6,
        required: false,
        fill: '#D4D4D8',
        fontRole: 'sans',
      },
    ],
    decorations: (p) => [
      { id: 'dec-editorial-bar', type: 'RECTANGLE', x: 36, y: 556, width: 48, height: 4, fill: p.accent },
      { id: 'dec-grid-rule', type: 'RECTANGLE', x: 36, y: 852, width: 528, height: 1, fill: p.border },
    ],
  },

  // 4. Psychedelic Archive
  {
    id: 'psychedelic-archive',
    name: 'Psychedelic Archive',
    family: 'Art Nouveau Psychedelia',
    description: 'Cosmic plum, liquid electric pink, amber gold, and ornate 1960s poster graphics.',
    visualTradition: 'San Francisco Concert Posters & Victoriana Nouveau',
    palette: {
      background: '#1A092A',
      surface: '#2B1245',
      foreground: '#FDF4FF',
      accent: '#EC4899',
      border: '#A855F7',
      subtext: '#E9D5FF',
    },
    artwork: { x: 44, y: 50, width: 512, height: 470, tint: '#230E39', borderWidth: 2, borderColor: '#A855F7' },
    inputs: [
      {
        id: 'input1',
        label: 'Iconic Name',
        bounds: { x: 44, y: 544, width: 512, height: 60 },
        preferredFontSize: 34,
        minFontSize: 20,
        maxLines: 1,
        required: true,
        fill: '#FDF4FF',
        fontRole: 'display',
        allCaps: true,
      },
      {
        id: 'input2',
        label: 'Movement / Sound',
        bounds: { x: 44, y: 610, width: 512, height: 32 },
        preferredFontSize: 16,
        minFontSize: 11,
        maxLines: 1,
        required: false,
        fill: '#F59E0B',
        fontRole: 'sans',
        allCaps: true,
      },
      {
        id: 'input3',
        label: 'Mythos & Anthology',
        bounds: { x: 44, y: 652, width: 512, height: 170 },
        preferredFontSize: 14,
        minFontSize: 10,
        maxLines: 6,
        required: false,
        fill: '#F3E8FF',
        fontRole: 'serif',
      },
    ],
    decorations: (p) => [
      { id: 'dec-psych-outer', type: 'RECTANGLE', x: 18, y: 18, width: 564, height: 864, fill: p.border },
      { id: 'dec-psych-inner', type: 'RECTANGLE', x: 22, y: 22, width: 556, height: 856, fill: p.background },
      { id: 'dec-psych-liquid-top', type: 'RECTANGLE', x: 44, y: 34, width: 512, height: 4, fill: p.accent },
      { id: 'dec-psych-divider', type: 'RECTANGLE', x: 44, y: 530, width: 512, height: 3, fill: '#F59E0B' },
    ],
  },

  // 5. Chrome Future
  {
    id: 'chrome-future',
    name: 'Chrome Future',
    family: 'Titanium Cyber',
    description: 'Polished metallic titanium, holographic cyan glow, sharp geometry, and futuristic telemetry.',
    visualTradition: 'Industrial Sci-Fi & Speculative Cybernetics',
    palette: {
      background: '#090D16',
      surface: '#0F172A',
      foreground: '#E2E8F0',
      accent: '#06B6D4',
      border: '#38BDF8',
      subtext: '#64748B',
    },
    artwork: { x: 38, y: 52, width: 524, height: 470, tint: '#0F172A', borderWidth: 2, borderColor: '#38BDF8' },
    inputs: [
      {
        id: 'input1',
        label: 'Cybernetic Designation',
        bounds: { x: 42, y: 540, width: 516, height: 58 },
        preferredFontSize: 32,
        minFontSize: 18,
        maxLines: 1,
        required: true,
        fill: '#38BDF8',
        fontRole: 'mono',
        allCaps: true,
      },
      {
        id: 'input2',
        label: 'Clearance & Registry',
        bounds: { x: 42, y: 606, width: 516, height: 28 },
        preferredFontSize: 14,
        minFontSize: 10,
        maxLines: 1,
        required: false,
        fill: '#06B6D4',
        fontRole: 'mono',
        allCaps: true,
      },
      {
        id: 'input3',
        label: 'System Diagnostics & Telemetry',
        bounds: { x: 42, y: 642, width: 516, height: 160 },
        preferredFontSize: 13,
        minFontSize: 10,
        maxLines: 5,
        required: false,
        fill: '#94A3B8',
        fontRole: 'mono',
      },
    ],
    decorations: (p) => [
      { id: 'dec-chrome-frame', type: 'RECTANGLE', x: 16, y: 16, width: 568, height: 868, fill: p.border },
      { id: 'dec-chrome-mat', type: 'RECTANGLE', x: 20, y: 20, width: 560, height: 860, fill: p.background },
      { id: 'dec-chrome-accent-bar', type: 'RECTANGLE', x: 38, y: 530, width: 524, height: 3, fill: p.accent },
      { id: 'dec-hud-notch-1', type: 'RECTANGLE', x: 28, y: 28, width: 14, height: 4, fill: p.accent },
      { id: 'dec-hud-notch-2', type: 'RECTANGLE', x: 558, y: 28, width: 14, height: 4, fill: p.accent },
    ],
  },

  // 6. Museum Archive
  {
    id: 'museum-archive',
    name: 'Museum Archive',
    family: 'Botanical Naturalist Plate',
    description: 'Antique vellum paper, botanical sepia ink, hand-ruled borders, and historic wax seal.',
    visualTradition: '18th Century Naturalist Plates & Archival Herbarium',
    palette: {
      background: '#F5EFEB',
      surface: '#EBE2D8',
      foreground: '#291811',
      accent: '#8B4513',
      border: '#A0522D',
      subtext: '#6E5D53',
    },
    artwork: { x: 44, y: 54, width: 512, height: 470, tint: '#EFE7DD', borderWidth: 2, borderColor: '#A0522D' },
    inputs: [
      {
        id: 'input1',
        label: 'Specimen Designation',
        bounds: { x: 48, y: 546, width: 504, height: 56 },
        preferredFontSize: 30,
        minFontSize: 18,
        maxLines: 1,
        required: true,
        fill: '#291811',
        fontRole: 'serif',
        allCaps: false,
      },
      {
        id: 'input2',
        label: 'Classification / Taxon',
        bounds: { x: 48, y: 608, width: 504, height: 28 },
        preferredFontSize: 14,
        minFontSize: 10,
        maxLines: 1,
        required: false,
        fill: '#8B4513',
        fontRole: 'serif',
        allCaps: true,
      },
      {
        id: 'input3',
        label: 'Curator Notes & Field Observation',
        bounds: { x: 48, y: 644, width: 504, height: 160 },
        preferredFontSize: 13,
        minFontSize: 10,
        maxLines: 6,
        required: false,
        fill: '#4A3728',
        fontRole: 'serif',
      },
    ],
    decorations: (p) => [
      { id: 'dec-archive-border-outer', type: 'RECTANGLE', x: 18, y: 18, width: 564, height: 864, fill: p.border },
      { id: 'dec-archive-border-gap', type: 'RECTANGLE', x: 20, y: 20, width: 560, height: 860, fill: p.background },
      { id: 'dec-archive-border-inner', type: 'RECTANGLE', x: 24, y: 24, width: 552, height: 852, fill: p.border },
      { id: 'dec-archive-paper', type: 'RECTANGLE', x: 26, y: 26, width: 548, height: 848, fill: p.background },
      { id: 'dec-archive-colophon-bar', type: 'RECTANGLE', x: 48, y: 532, width: 504, height: 1, fill: p.accent },
    ],
  },

  // 7. Classic Collector (Legacy)
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
    inputs: [
      {
        id: 'input1',
        label: 'Subject Name',
        bounds: { x: 50, y: 570, width: 500, height: 60 },
        preferredFontSize: 34,
        minFontSize: 20,
        maxLines: 1,
        required: true,
        fill: '#FFFFFF',
        fontRole: 'serif',
        allCaps: true,
      },
      {
        id: 'input2',
        label: 'Discipline / Team',
        bounds: { x: 50, y: 636, width: 500, height: 32 },
        preferredFontSize: 16,
        minFontSize: 12,
        maxLines: 1,
        required: false,
        fill: '#EAB308',
        fontRole: 'sans',
        allCaps: true,
      },
      {
        id: 'input3',
        label: 'Career Highlights / Bio',
        bounds: { x: 50, y: 680, width: 500, height: 160 },
        preferredFontSize: 15,
        minFontSize: 11,
        maxLines: 6,
        required: false,
        fill: '#CBD5E1',
        fontRole: 'sans',
      },
    ],
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
    inputs: [
      {
        id: 'input1',
        label: 'Headline',
        bounds: { x: 40, y: 594, width: 520, height: 64 },
        preferredFontSize: 36,
        minFontSize: 22,
        maxLines: 1,
        required: true,
        fill: '#FDFBF7',
        fontRole: 'serif',
        allCaps: true,
      },
      {
        id: 'input2',
        label: 'Title / Moniker',
        bounds: { x: 40, y: 664, width: 520, height: 28 },
        preferredFontSize: 14,
        minFontSize: 10,
        maxLines: 1,
        required: false,
        fill: '#D4AF37',
        fontRole: 'mono',
        allCaps: true,
      },
      {
        id: 'input3',
        label: 'Provenance / Citation',
        bounds: { x: 40, y: 698, width: 520, height: 110 },
        preferredFontSize: 14,
        minFontSize: 10,
        maxLines: 4,
        required: false,
        fill: '#A3997F',
        fontRole: 'serif',
      },
      {
        id: 'input4',
        label: 'Edition & Serial',
        bounds: { x: 40, y: 820, width: 520, height: 26 },
        preferredFontSize: 12,
        minFontSize: 9,
        maxLines: 1,
        required: false,
        fill: '#D4AF37',
        fontRole: 'mono',
        allCaps: true,
      },
    ],
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
    inputs: [
      {
        id: 'input1',
        label: 'Subject',
        bounds: { x: 36, y: 560, width: 528, height: 100 },
        preferredFontSize: 46,
        minFontSize: 24,
        maxLines: 2,
        required: true,
        fill: '#0A0A0B',
        fontRole: 'sans',
        allCaps: true,
      },
      {
        id: 'input2',
        label: 'Monograph / Statement',
        bounds: { x: 36, y: 676, width: 528, height: 160 },
        preferredFontSize: 16,
        minFontSize: 12,
        maxLines: 6,
        required: false,
        fill: '#52525B',
        fontRole: 'sans',
      },
    ],
    decorations: (p) => [
      { id: 'dec-orange-square', type: 'RECTANGLE', x: 36, y: 856, width: 14, height: 14, fill: p.accent },
    ],
  },

  // 4. Editorial
  {
    id: 'editorial-broadsheet',
    name: 'Editorial',
    family: 'Editorial',
    description: 'Dramatic 2-column split layout, tall vertical portrait, sophisticated serif magazine typography.',
    visualTradition: 'High-Fashion & Investigative Journalism',
    palette: {
      background: '#FAF7F2',
      surface: '#F1ECE1',
      foreground: '#18181B',
      accent: '#B91C1C',
      border: '#DCD4C4',
      subtext: '#3F3F46',
    },
    artwork: { x: 36, y: 70, width: 250, height: 790, tint: '#E7DFCF' },
    inputs: [
      {
        id: 'input1',
        label: 'Headline',
        bounds: { x: 304, y: 104, width: 260, height: 160 },
        preferredFontSize: 28,
        minFontSize: 18,
        maxLines: 4,
        required: true,
        fill: '#18181B',
        fontRole: 'serif',
      },
      {
        id: 'input2',
        label: 'Category / Dateline',
        bounds: { x: 304, y: 72, width: 260, height: 26 },
        preferredFontSize: 12,
        minFontSize: 9,
        maxLines: 1,
        required: false,
        fill: '#B91C1C',
        fontRole: 'sans',
        allCaps: true,
      },
      {
        id: 'input3',
        label: 'Editorial Feature Bio',
        bounds: { x: 304, y: 280, width: 260, height: 580 },
        preferredFontSize: 14,
        minFontSize: 10,
        maxLines: 18,
        required: false,
        fill: '#3F3F46',
        fontRole: 'serif',
      },
    ],
    decorations: (p) => [
      { id: 'dec-masthead', type: 'TEXT', x: 36, y: 24, width: 528, height: 26, text: 'THE CHRONICLE ARCHIVE', fontSize: 13, fill: p.subtext, fontRole: 'serif' as any },
      { id: 'dec-masthead-rule', type: 'RECTANGLE', x: 36, y: 54, width: 528, height: 1, fill: p.border },
      { id: 'dec-editorial-col-rule', type: 'RECTANGLE', x: 295, y: 70, width: 1, height: 790, fill: p.border },
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
    inputs: [
      {
        id: 'input1',
        label: 'Athlete Name',
        bounds: { x: 36, y: 554, width: 528, height: 58 },
        preferredFontSize: 38,
        minFontSize: 22,
        maxLines: 1,
        required: true,
        fill: '#FFFFFF',
        fontRole: 'display',
        allCaps: true,
      },
      {
        id: 'input2',
        label: 'Team & Number',
        bounds: { x: 36, y: 618, width: 528, height: 28 },
        preferredFontSize: 16,
        minFontSize: 12,
        maxLines: 1,
        required: false,
        fill: '#FF0055',
        fontRole: 'sans',
        allCaps: true,
      },
      {
        id: 'input3',
        label: 'Career Milestones & Stats',
        bounds: { x: 36, y: 652, width: 528, height: 100 },
        preferredFontSize: 14,
        minFontSize: 10,
        maxLines: 4,
        required: false,
        fill: '#A7BED3',
        fontRole: 'sans',
      },
      {
        id: 'input4',
        label: 'Primary Stat',
        bounds: { x: 36, y: 764, width: 250, height: 40 },
        preferredFontSize: 15,
        minFontSize: 11,
        maxLines: 1,
        required: false,
        fill: '#FF0055',
        fontRole: 'display',
        allCaps: true,
      },
      {
        id: 'input5',
        label: 'Era / Season',
        bounds: { x: 314, y: 764, width: 250, height: 40 },
        preferredFontSize: 15,
        minFontSize: 11,
        maxLines: 1,
        required: false,
        fill: '#FFFFFF',
        fontRole: 'sans',
        allCaps: true,
      },
      {
        id: 'input6',
        label: 'Hall of Fame / Badge',
        bounds: { x: 36, y: 816, width: 528, height: 32 },
        preferredFontSize: 13,
        minFontSize: 10,
        maxLines: 1,
        required: false,
        fill: '#A7BED3',
        fontRole: 'mono',
        allCaps: true,
      },
    ],
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
    inputs: [
      {
        id: 'input1',
        label: 'Player 1',
        bounds: { x: 40, y: 524, width: 520, height: 62 },
        preferredFontSize: 34,
        minFontSize: 20,
        maxLines: 1,
        required: true,
        fill: '#FFE600',
        fontRole: 'display',
        allCaps: true,
      },
      {
        id: 'input2',
        label: 'Specialty / Class',
        bounds: { x: 40, y: 594, width: 520, height: 28 },
        preferredFontSize: 15,
        minFontSize: 11,
        maxLines: 1,
        required: false,
        fill: '#00F5FF',
        fontRole: 'mono',
        allCaps: true,
      },
      {
        id: 'input3',
        label: 'Quest History',
        bounds: { x: 40, y: 628, width: 520, height: 110 },
        preferredFontSize: 13,
        minFontSize: 10,
        maxLines: 4,
        required: false,
        fill: '#A78BFA',
        fontRole: 'mono',
      },
      {
        id: 'input4',
        label: 'High Score',
        bounds: { x: 40, y: 752, width: 250, height: 38 },
        preferredFontSize: 14,
        minFontSize: 10,
        maxLines: 1,
        required: false,
        fill: '#FFE600',
        fontRole: 'mono',
        allCaps: true,
      },
      {
        id: 'input5',
        label: 'Insert Coin / Credits',
        bounds: { x: 310, y: 752, width: 250, height: 38 },
        preferredFontSize: 14,
        minFontSize: 10,
        maxLines: 1,
        required: false,
        fill: '#FF31C8',
        fontRole: 'mono',
        allCaps: true,
      },
    ],
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
    inputs: [
      {
        id: 'input1',
        label: 'Agent Identifier',
        bounds: { x: 40, y: 536, width: 520, height: 58 },
        preferredFontSize: 30,
        minFontSize: 18,
        maxLines: 1,
        required: true,
        fill: '#38BDF8',
        fontRole: 'mono',
        allCaps: true,
      },
      {
        id: 'input2',
        label: 'Sector & Clearance',
        bounds: { x: 40, y: 604, width: 520, height: 26 },
        preferredFontSize: 14,
        minFontSize: 10,
        maxLines: 1,
        required: false,
        fill: '#22C55E',
        fontRole: 'mono',
        allCaps: true,
      },
      {
        id: 'input3',
        label: 'Telemetry Readout',
        bounds: { x: 40, y: 638, width: 520, height: 110 },
        preferredFontSize: 13,
        minFontSize: 10,
        maxLines: 4,
        required: false,
        fill: '#94A3B8',
        fontRole: 'mono',
      },
      {
        id: 'input4',
        label: 'Net Node / Hash',
        bounds: { x: 40, y: 760, width: 250, height: 36 },
        preferredFontSize: 12,
        minFontSize: 9,
        maxLines: 1,
        required: false,
        fill: '#38BDF8',
        fontRole: 'mono',
        allCaps: true,
      },
      {
        id: 'input5',
        label: 'Security Clearance',
        bounds: { x: 310, y: 760, width: 250, height: 36 },
        preferredFontSize: 12,
        minFontSize: 9,
        maxLines: 1,
        required: false,
        fill: '#22C55E',
        fontRole: 'mono',
        allCaps: true,
      },
    ],
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
    inputs: [
      {
        id: 'input1',
        label: 'Title',
        bounds: { x: 40, y: 550, width: 520, height: 76 },
        preferredFontSize: 40,
        minFontSize: 22,
        maxLines: 1,
        required: true,
        fill: '#FF71CE',
        fontRole: 'display',
        allCaps: true,
      },
      {
        id: 'input2',
        label: 'Genre / Tempo',
        bounds: { x: 40, y: 636, width: 520, height: 30 },
        preferredFontSize: 15,
        minFontSize: 11,
        maxLines: 1,
        required: false,
        fill: '#01CDFE',
        fontRole: 'sans',
        allCaps: true,
      },
      {
        id: 'input3',
        label: 'Tracklist / Lore',
        bounds: { x: 40, y: 678, width: 520, height: 170 },
        preferredFontSize: 14,
        minFontSize: 11,
        maxLines: 6,
        required: false,
        fill: '#E2B4FF',
        fontRole: 'sans',
      },
    ],
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
    inputs: [
      {
        id: 'input1',
        label: 'Hero / Issue Name',
        bounds: { x: 36, y: 534, width: 528, height: 80 },
        preferredFontSize: 44,
        minFontSize: 24,
        maxLines: 1,
        required: true,
        fill: '#000000',
        fontRole: 'display',
        allCaps: true,
      },
      {
        id: 'input2',
        label: 'Superpower / Origin',
        bounds: { x: 36, y: 622, width: 528, height: 34 },
        preferredFontSize: 18,
        minFontSize: 13,
        maxLines: 1,
        required: false,
        fill: '#E60000',
        fontRole: 'display',
        allCaps: true,
      },
      {
        id: 'input3',
        label: 'Issue Synopsis',
        bounds: { x: 36, y: 666, width: 528, height: 170 },
        preferredFontSize: 14,
        minFontSize: 11,
        maxLines: 6,
        required: false,
        fill: '#1C1917',
        fontRole: 'sans',
      },
    ],
    decorations: (p) => [
      { id: 'dec-action-badge', type: 'RECTANGLE', x: 440, y: 20, width: 120, height: 30, fill: p.accent },
      { id: 'dec-action-text', type: 'TEXT', x: 445, y: 26, width: 110, height: 20, text: 'AUTHENTIC #1', fontSize: 11, fill: '#FFFFFF', fontRole: 'sans' as any },
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
    inputs: [
      {
        id: 'input1',
        label: 'Figure Name',
        bounds: { x: 44, y: 544, width: 512, height: 76 },
        preferredFontSize: 36,
        minFontSize: 20,
        maxLines: 1,
        required: true,
        fill: '#E8D7D8',
        fontRole: 'serif',
      },
      {
        id: 'input2',
        label: 'Title / Epitaph',
        bounds: { x: 44, y: 630, width: 512, height: 30 },
        preferredFontSize: 15,
        minFontSize: 11,
        maxLines: 1,
        required: false,
        fill: '#9B111E',
        fontRole: 'serif',
        allCaps: true,
      },
      {
        id: 'input3',
        label: 'Legend & Testament',
        bounds: { x: 44, y: 672, width: 512, height: 180 },
        preferredFontSize: 14,
        minFontSize: 10,
        maxLines: 7,
        required: false,
        fill: '#A38F92',
        fontRole: 'serif',
      },
    ],
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
    description: 'Illuminated parchment borders, aged leather tones, heroic attribute block.',
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
    inputs: [
      {
        id: 'input1',
        label: 'Hero / Entity',
        bounds: { x: 44, y: 536, width: 512, height: 72 },
        preferredFontSize: 36,
        minFontSize: 22,
        maxLines: 1,
        required: true,
        fill: '#2B1E16',
        fontRole: 'serif',
      },
      {
        id: 'input2',
        label: 'Guild / Realm',
        bounds: { x: 44, y: 618, width: 512, height: 30 },
        preferredFontSize: 15,
        minFontSize: 11,
        maxLines: 1,
        required: false,
        fill: '#8A5D28',
        fontRole: 'serif',
        allCaps: true,
      },
      {
        id: 'input3',
        label: 'Chronicles',
        bounds: { x: 44, y: 660, width: 512, height: 180 },
        preferredFontSize: 14,
        minFontSize: 10,
        maxLines: 7,
        required: false,
        fill: '#594436',
        fontRole: 'serif',
      },
    ],
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
    inputs: [
      {
        id: 'input1',
        label: 'Title',
        bounds: { x: 40, y: 590, width: 520, height: 70 },
        preferredFontSize: 38,
        minFontSize: 22,
        maxLines: 1,
        required: true,
        fill: '#FAFAFA',
        fontRole: 'serif',
        allCaps: true,
      },
      {
        id: 'input2',
        label: 'Case Number / Year',
        bounds: { x: 40, y: 670, width: 520, height: 26 },
        preferredFontSize: 13,
        minFontSize: 10,
        maxLines: 1,
        required: false,
        fill: '#A3A3A3',
        fontRole: 'mono',
        allCaps: true,
      },
      {
        id: 'input3',
        label: 'Case Synopsis',
        bounds: { x: 40, y: 706, width: 520, height: 140 },
        preferredFontSize: 14,
        minFontSize: 10,
        maxLines: 5,
        required: false,
        fill: '#E5E5E5',
        fontRole: 'serif',
      },
    ],
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
    inputs: [
      {
        id: 'input1',
        label: 'Artist / Alias',
        bounds: { x: 40, y: 560, width: 520, height: 80 },
        preferredFontSize: 44,
        minFontSize: 24,
        maxLines: 1,
        required: true,
        fill: '#FFFFFF',
        fontRole: 'display',
        allCaps: true,
      },
      {
        id: 'input2',
        label: 'Mixtape Volume',
        bounds: { x: 40, y: 650, width: 520, height: 30 },
        preferredFontSize: 16,
        minFontSize: 12,
        maxLines: 1,
        required: false,
        fill: '#FF0033',
        fontRole: 'sans',
        allCaps: true,
      },
      {
        id: 'input3',
        label: 'Credits & Production',
        bounds: { x: 40, y: 692, width: 520, height: 150 },
        preferredFontSize: 13,
        minFontSize: 10,
        maxLines: 6,
        required: false,
        fill: '#9E9E9E',
        fontRole: 'mono',
      },
    ],
    decorations: (p) => [
      { id: 'dec-parental-box', type: 'RECTANGLE', x: 44, y: 490, width: 110, height: 40, fill: '#000000' },
      { id: 'dec-parental-text', type: 'TEXT', x: 48, y: 502, width: 100, height: 18, text: 'RARE EXCLUSIVE', fontSize: 10, fill: '#FFFFFF', fontRole: 'sans' as any },
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
    inputs: [
      {
        id: 'input1',
        label: 'Headliner Name',
        bounds: { x: 40, y: 40, width: 520, height: 96 },
        preferredFontSize: 52,
        minFontSize: 28,
        maxLines: 1,
        required: true,
        fill: '#FF6B35',
        fontRole: 'display',
        allCaps: true,
      },
      {
        id: 'input2',
        label: 'Support Acts / Tour',
        bounds: { x: 40, y: 620, width: 520, height: 34 },
        preferredFontSize: 18,
        minFontSize: 12,
        maxLines: 1,
        required: false,
        fill: '#F7C59F',
        fontRole: 'sans',
        allCaps: true,
      },
      {
        id: 'input3',
        label: 'Dates & Venue Schedule',
        bounds: { x: 40, y: 666, width: 520, height: 180 },
        preferredFontSize: 13,
        minFontSize: 10,
        maxLines: 7,
        required: false,
        fill: '#EFEFD0',
        fontRole: 'mono',
      },
    ],
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
    inputs: [
      {
        id: 'input1',
        label: 'Name',
        bounds: { x: 44, y: 536, width: 512, height: 72 },
        preferredFontSize: 36,
        minFontSize: 20,
        maxLines: 1,
        required: true,
        fill: '#362B28',
        fontRole: 'serif',
        allCaps: true,
      },
      {
        id: 'input2',
        label: 'Occupation',
        bounds: { x: 44, y: 618, width: 512, height: 30 },
        preferredFontSize: 15,
        minFontSize: 11,
        maxLines: 1,
        required: false,
        fill: '#8B4513',
        fontRole: 'serif',
        allCaps: true,
      },
      {
        id: 'input3',
        label: 'Historical Account',
        bounds: { x: 44, y: 660, width: 512, height: 180 },
        preferredFontSize: 14,
        minFontSize: 10,
        maxLines: 7,
        required: false,
        fill: '#5E4F49',
        fontRole: 'serif',
      },
    ],
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
    inputs: [
      {
        id: 'input1',
        label: 'Subject Headline',
        bounds: { x: 40, y: 556, width: 520, height: 76 },
        preferredFontSize: 40,
        minFontSize: 22,
        maxLines: 1,
        required: true,
        fill: '#0E3B43',
        fontRole: 'sans',
        allCaps: true,
      },
      {
        id: 'input2',
        label: 'Edition & Ink Run',
        bounds: { x: 40, y: 642, width: 520, height: 30 },
        preferredFontSize: 15,
        minFontSize: 11,
        maxLines: 1,
        required: false,
        fill: '#FF5733',
        fontRole: 'mono',
        allCaps: true,
      },
      {
        id: 'input3',
        label: 'Artist Statement',
        bounds: { x: 40, y: 684, width: 520, height: 160 },
        preferredFontSize: 14,
        minFontSize: 10,
        maxLines: 6,
        required: false,
        fill: '#285960',
        fontRole: 'sans',
      },
    ],
    decorations: (p) => [
      { id: 'dec-riso-offset', type: 'RECTANGLE', x: 44, y: 54, width: 520, height: 480, fill: 'rgba(255, 87, 51, 0.15)' },
    ],
  },

  // 17. Brutalist
  {
    id: 'brutalist-block',
    name: 'Brutalist',
    family: 'Brutalism',
    description: 'Raw high-contrast asymmetric grid, heavy black dividing blocks, vertical telemetry sidebar.',
    visualTradition: 'Architectural Brutalism & Raw Web Aesthetics',
    palette: {
      background: '#FFFFFF',
      surface: '#EAEAEA',
      foreground: '#000000',
      accent: '#000000',
      border: '#000000',
      subtext: '#222222',
    },
    artwork: { x: 24, y: 72, width: 320, height: 530, tint: '#D4D4D4', borderWidth: 8, borderColor: '#000000' },
    inputs: [
      {
        id: 'input1',
        label: 'ID NAME',
        bounds: { x: 24, y: 620, width: 552, height: 86 },
        preferredFontSize: 46,
        minFontSize: 24,
        maxLines: 1,
        required: true,
        fill: '#000000',
        fontRole: 'mono',
        allCaps: true,
      },
      {
        id: 'input2',
        label: 'CATEGORY CODE',
        bounds: { x: 360, y: 72, width: 216, height: 48 },
        preferredFontSize: 15,
        minFontSize: 11,
        maxLines: 2,
        required: false,
        fill: '#000000',
        fontRole: 'mono',
        allCaps: true,
      },
      {
        id: 'input3',
        label: 'DATA SPECIFICATION',
        bounds: { x: 360, y: 140, width: 216, height: 460 },
        preferredFontSize: 13,
        minFontSize: 10,
        maxLines: 14,
        required: false,
        fill: '#222222',
        fontRole: 'mono',
      },
    ],
    decorations: (p) => [
      { id: 'dec-brutalist-top-bar', type: 'RECTANGLE', x: 24, y: 20, width: 552, height: 36, fill: '#000000' },
      { id: 'dec-brutalist-top-text', type: 'TEXT', x: 34, y: 28, width: 500, height: 20, text: 'SPEC // ARCHIVE SYSTEM 01', fontSize: 12, fill: '#FFFFFF', fontRole: 'mono' as any },
      { id: 'dec-brutalist-rule', type: 'RECTANGLE', x: 24, y: 610, width: 552, height: 4, fill: '#000000' },
      { id: 'dec-brutalist-col-rule', type: 'RECTANGLE', x: 350, y: 72, width: 4, height: 530, fill: '#000000' },
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
    inputs: [
      {
        id: 'input1',
        label: 'Story Title',
        bounds: { x: 36, y: 536, width: 528, height: 80 },
        preferredFontSize: 42,
        minFontSize: 22,
        maxLines: 1,
        required: true,
        fill: '#C1121F',
        fontRole: 'display',
        allCaps: true,
      },
      {
        id: 'input2',
        label: 'The Case Of...',
        bounds: { x: 36, y: 624, width: 528, height: 30 },
        preferredFontSize: 15,
        minFontSize: 11,
        maxLines: 1,
        required: false,
        fill: '#1B140E',
        fontRole: 'serif',
        allCaps: true,
      },
      {
        id: 'input3',
        label: 'Dime Story Synopsis',
        bounds: { x: 36, y: 666, width: 528, height: 180 },
        preferredFontSize: 14,
        minFontSize: 10,
        maxLines: 7,
        required: false,
        fill: '#453225',
        fontRole: 'serif',
      },
    ],
    decorations: (p) => [
      { id: 'dec-pulp-price', type: 'TEXT', x: 480, y: 16, width: 80, height: 24, text: '10¢ RARE', fontSize: 13, fill: p.accent, fontRole: 'display' as any },
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
    artwork: { x: 50, y: 50, width: 500, height: 500, tint: '#1E293B' },
    inputs: [
      {
        id: 'input1',
        label: 'Photo Caption',
        bounds: { x: 50, y: 580, width: 500, height: 80 },
        preferredFontSize: 32,
        minFontSize: 18,
        maxLines: 2,
        required: true,
        fill: '#111827',
        fontRole: 'sans',
      },
      {
        id: 'input2',
        label: 'Date & Location',
        bounds: { x: 50, y: 680, width: 500, height: 35 },
        preferredFontSize: 15,
        minFontSize: 11,
        maxLines: 1,
        required: false,
        fill: '#4B5563',
        fontRole: 'mono',
        allCaps: true,
      },
    ],
    decorations: (p) => [
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
    inputs: [
      {
        id: 'input1',
        label: 'Manifesto Title',
        bounds: { x: 40, y: 604, width: 520, height: 84 },
        preferredFontSize: 44,
        minFontSize: 22,
        maxLines: 1,
        required: true,
        fill: '#0E0E10',
        fontRole: 'display',
        allCaps: true,
      },
      {
        id: 'input2',
        label: 'Movement / Sector',
        bounds: { x: 40, y: 700, width: 520, height: 30 },
        preferredFontSize: 16,
        minFontSize: 11,
        maxLines: 1,
        required: false,
        fill: '#2B50EC',
        fontRole: 'sans',
        allCaps: true,
      },
      {
        id: 'input3',
        label: 'Thesis Statement',
        bounds: { x: 40, y: 740, width: 520, height: 120 },
        preferredFontSize: 13,
        minFontSize: 10,
        maxLines: 5,
        required: false,
        fill: '#3A3A40',
        fontRole: 'sans',
      },
    ],
    decorations: (p) => [
      { id: 'dec-blue-pillar', type: 'RECTANGLE', x: 40, y: 40, width: 60, height: 540, fill: p.accent },
    ],
  },
]

// ----------------------------------------------------------------------------
// Compiler & Positional Text Fit Engine
// ----------------------------------------------------------------------------

export type ContentStore = Record<string, string>
export type PositionalInputs = ContentStore

export const INITIAL_CONTENT_STORE: ContentStore = {
  input1: '',
  input2: '',
  input3: '',
  input4: '',
  input5: '',
  input6: '',
}

export interface FlagshipCompilationResult {
  composition: CardComposition
  backComposition: CardComposition
  design: FlagshipDesign
  fittedFontSizes: Record<string, number>
  isOverflow: Record<string, boolean>
  contentStore: ContentStore
}

export const CURATED_PREFAB_DESIGNS: FlagshipDesign[] = FLAGSHIP_DESIGNS.slice(0, 6)

export function getFlagshipDesignById(id?: string): FlagshipDesign {
  if (!id) return FLAGSHIP_DESIGNS[0]
  const found = FLAGSHIP_DESIGNS.find((d) => d.id === id)
  if (found) return found

  const ALIASES: Record<string, string> = {
    'classic': 'royal-heritage',
    'classic-collector': 'royal-heritage',
    'prestige-gold': 'royal-heritage',
    'arcade-1985': 'arcade-legends',
    'retro-synthwave': 'arcade-legends',
    'synthwave-outrun': 'arcade-legends',
    'minimal': 'modern-editorial',
    'minimalist-swiss': 'modern-editorial',
    'brutalist-block': 'modern-editorial',
    'editorial-broadsheet': 'modern-editorial',
    'concert-poster': 'psychedelic-archive',
    'cyber-tech': 'chrome-future',
    'vintage-press': 'museum-archive',
    'fantasy-parchment': 'museum-archive',
  }
  const aliasId = ALIASES[id]
  if (aliasId) {
    const aliasFound = FLAGSHIP_DESIGNS.find((d) => d.id === aliasId)
    if (aliasFound) return aliasFound
  }

  return FLAGSHIP_DESIGNS[0]
}

export type LayoutVariant = 'portrait' | 'balanced' | 'editorial'

export type ArtworkStyle =
  | 'photographic'
  | 'illustrated'
  | 'vintage'
  | 'cinematic'
  | 'abstract'
  | 'painterly'
  | 'psychedelic'
  | 'retro'

export type FinishEffect = 'matte' | 'metallic' | 'holographic' | 'textured'

export interface StudioAppearanceState {
  backgroundColor?: string
  accentColor?: string
  borderColor?: string
  textColor?: string
  fontRole?: FontRole
  borderWidth?: number
  textureEffect?: 'none' | 'grain' | 'foil' | 'holo'
  vignetteEffect?: boolean
  artworkStyle?: ArtworkStyle
  framingStyle?: 'borderless' | 'minimal' | 'classic' | 'ornate'
  layoutVariant?: LayoutVariant
  finishEffect?: FinishEffect
}

/**
 * Compiles a Flagship Design with variable positional text inputs into an rdc-composition-v1 CardComposition.
 */
export function compileFlagshipDesign(
  designId: string,
  inputs: PositionalInputs = {},
  person?: { displayName?: string | null; bio?: string | null; hometown?: string | null } | null,
  assets?: Array<{ id: string; url: string; objectKey?: string }>,
  cardTypeId: string = 'profile',
  selectedImageId?: string,
  appearance?: StudioAppearanceState,
): FlagshipCompilationResult {
  const design = getFlagshipDesignById(designId) || FLAGSHIP_DESIGNS[0]
  const cardType = getCardTypeById(cardTypeId)
  const palette = {
    ...design.palette,
    ...(appearance?.backgroundColor ? { background: appearance.backgroundColor } : {}),
    ...(appearance?.accentColor ? { accent: appearance.accentColor } : {}),
    ...(appearance?.borderColor ? { border: appearance.borderColor } : {}),
    ...(appearance?.textColor ? { foreground: appearance.textColor } : {}),
  }
  const { artwork, inputs: designInputs } = design

  const fittedFontSizes: Record<string, number> = {}
  const isOverflow: Record<string, boolean> = {}
  const resolvedInputs: Record<string, string> = {}

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

  // Partition decorations into background mats/frames (behind artwork) and foreground accents (above artwork)
  const rawDecorations = design.decorations ? design.decorations(palette) : []
  const bgDecorations: CardCompositionLayer[] = []
  const fgDecorations: CardCompositionLayer[] = []

  for (const dec of rawDecorations) {
    const isLargeRect = dec.type === 'RECTANGLE' && ((dec.width ?? 0) >= 480 && (dec.height ?? 0) >= 550)
    const isFrameOrMat = dec.id && (
      dec.id.includes('frame') ||
      dec.id.includes('mat') ||
      dec.id.includes('casing') ||
      dec.id.includes('void') ||
      dec.id.includes('inset') ||
      dec.id.includes('pillar')
    )
    if (dec.type === 'RECTANGLE' && (isLargeRect || isFrameOrMat)) {
      bgDecorations.push(dec)
    } else {
      fgDecorations.push(dec)
    }
  }

  // 2. Pre-artwork decorations (e.g. outer frames, inner mats, casings)
  if (bgDecorations.length > 0) {
    layers.push(...bgDecorations)
  }

  // 3. Layout geometry adaptation based on selected Template:
  // - 'minimal': Full-bleed maximized artwork canvas with sleek lower title band
  // - 'stats': Upper artwork window with prominent hero metric callout band
  // - 'standard': Balanced portrait artwork window with identity & bio block
  let artX = artwork.x
  let artY = artwork.y
  let artW = artwork.width
  let artH = artwork.height

  if (cardType.id === 'minimal') {
    artX = 20
    artY = 20
    artW = 560
    artH = 745
  } else if (cardType.id === 'stats') {
    artX = artwork.x
    artY = Math.min(artwork.y, 80)
    artW = artwork.width
    artH = Math.min(artwork.height, 420)
  } else if (appearance?.layoutVariant === 'portrait') {
    artH = Math.min(artwork.height + 40, 580)
  } else if (appearance?.layoutVariant === 'editorial') {
    artH = Math.max(artwork.height - 40, 440)
  }

  // 3. Artwork backdrop tint
  layers.push({
    id: 'artwork-backdrop-frame',
    type: 'RECTANGLE',
    x: artX,
    y: artY,
    width: artW,
    height: artH,
    fill: artwork.tint || palette.surface,
  })

  // 4. Artwork subject image
  const borderWidth = appearance?.borderWidth !== undefined ? appearance.borderWidth : (artwork.borderWidth || 0)
  const effectiveImageAssetId = selectedImageId || assets?.[0]?.id || 'art-angelou'
  layers.push({
    id: 'artwork-subject-image',
    type: 'IMAGE',
    x: artX + borderWidth,
    y: artY + borderWidth,
    width: artW - borderWidth * 2,
    height: artH - borderWidth * 2,
    imageAssetId: effectiveImageAssetId,
  })

  // Template-specific layout accents:
  if (cardType.id === 'stats') {
    // Prominent stat hero callout banner
    layers.push({
      id: 'stat-metric-hero-banner',
      type: 'RECTANGLE',
      x: 36,
      y: 520,
      width: 528,
      height: 105,
      fill: palette.surface,
    })
  } else if (cardType.id === 'minimal') {
    // Sleek lower caption plate
    layers.push({
      id: 'minimal-caption-plate',
      type: 'RECTANGLE',
      x: 20,
      y: 775,
      width: 560,
      height: 100,
      fill: palette.surface,
    })
  }

  // 5. Post-artwork foreground decorations (e.g. accent lines, dividers, badges)
  if (fgDecorations.length > 0 && cardType.id !== 'minimal') {
    layers.push(...fgDecorations)
  }

  // 6. Variable Positional Content Slots
  for (let i = 0; i < designInputs.length; i++) {
    const inputDef = designInputs[i]
    let rawText = inputs[inputDef.id]
    if (rawText === undefined) {
      if (person?.displayName && (inputDef.id === 'input1' || i === 0)) {
        rawText = person.displayName
      } else {
        rawText = ''
      }
    }
    const cleanText = (rawText || '').trim()
    resolvedInputs[inputDef.id] = cleanText

    // Tailor bounds based on template layout
    let slotBounds = { ...inputDef.bounds }
    if (cardType.id === 'minimal') {
      if (inputDef.id === 'input1') {
        slotBounds = { x: 40, y: 785, width: 520, height: 40 }
      } else if (inputDef.id === 'input2') {
        slotBounds = { x: 40, y: 830, width: 340, height: 28 }
      } else if (inputDef.id === 'input3') {
        slotBounds = { x: 400, y: 830, width: 160, height: 28 }
      }
    } else if (cardType.id === 'stats') {
      if (inputDef.id === 'input3') {
        slotBounds = { x: 50, y: 535, width: 500, height: 60 }
      }
    }

    const effectiveFontRole = appearance?.fontRole || inputDef.fontRole

    // Run text-fitting
    const fit = fitTextToSlot(cleanText, {
      width: slotBounds.width,
      height: slotBounds.height,
      preferredFontSize: inputDef.preferredFontSize,
      minFontSize: inputDef.minFontSize,
      maxLines: inputDef.maxLines,
      fontRole: effectiveFontRole,
    })

    fittedFontSizes[inputDef.id] = fit.fontSize
    isOverflow[inputDef.id] = fit.isOverflow

    layers.push({
      id: `slot-${inputDef.id}`,
      type: 'TEXT',
      x: slotBounds.x,
      y: slotBounds.y,
      width: slotBounds.width,
      height: slotBounds.height,
      text: inputDef.allCaps ? cleanText.toUpperCase() : cleanText,
      fontSize: fit.fontSize,
      fill: inputDef.fill || palette.foreground,
      fontRole: effectiveFontRole,
    } as any)
  }

  // 7. Optional custom appearance effect overlays
  if (appearance?.vignetteEffect || appearance?.artworkStyle === 'cinematic') {
    layers.push({
      id: 'effect-vignette-frame',
      type: 'RECTANGLE',
      x: 0,
      y: 0,
      width: 600,
      height: 900,
      fill: 'rgba(0, 0, 0, 0.22)',
    })
  }
  if (appearance?.artworkStyle === 'vintage') {
    layers.push({
      id: 'effect-vintage-tone',
      type: 'RECTANGLE',
      x: 0,
      y: 0,
      width: 600,
      height: 900,
      fill: 'rgba(180, 140, 80, 0.12)',
    })
  } else if (appearance?.artworkStyle === 'psychedelic') {
    layers.push({
      id: 'effect-psychedelic-accent',
      type: 'RECTANGLE',
      x: 20,
      y: 20,
      width: 560,
      height: 3,
      fill: '#EC4899',
    })
  } else if (appearance?.artworkStyle === 'retro') {
    layers.push({
      id: 'effect-retro-accent',
      type: 'RECTANGLE',
      x: 16,
      y: 16,
      width: 568,
      height: 4,
      fill: '#F59E0B',
    })
  }

  const isHolo = appearance?.finishEffect === 'holographic' || appearance?.textureEffect === 'holo'
  const isMetallic = appearance?.finishEffect === 'metallic' || appearance?.textureEffect === 'foil'
  const isTextured = appearance?.finishEffect === 'textured' || appearance?.textureEffect === 'grain'

  if (isHolo) {
    layers.push({
      id: 'effect-holo-sheen',
      type: 'RECTANGLE',
      x: 8,
      y: 8,
      width: 584,
      height: 6,
      fill: 'rgba(255, 255, 255, 0.5)',
    })
  } else if (isMetallic) {
    layers.push({
      id: 'effect-foil-sheen',
      type: 'RECTANGLE',
      x: 16,
      y: 16,
      width: 568,
      height: 4,
      fill: palette.accent || '#F59E0B',
    })
  } else if (isTextured) {
    layers.push({
      id: 'effect-textured-grain',
      type: 'RECTANGLE',
      x: 0,
      y: 0,
      width: 600,
      height: 900,
      fill: 'rgba(255, 255, 255, 0.04)',
    })
  }

  // Preserve entire design-independent content store
  const allContent: ContentStore = {
    ...inputs,
    ...resolvedInputs,
  }

  // Generate coordinated back composition sharing the same content model
  const backComposition = generateCoordinatedBackComposition({
    design,
    palette,
    inputs: allContent,
    person,
    appearance,
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
        cardTypeId,
        selectedImageId: effectiveImageAssetId,
        inputs: allContent,
        contentStore: allContent,
        fittedFontSizes,
        isOverflow,
        profile: person || null,
        appearance: appearance || null,
        backComposition,
      },
    },
  }

  return {
    composition,
    backComposition,
    design,
    fittedFontSizes,
    isOverflow,
    contentStore: allContent,
  }
}

/**
 * Generates a coordinated, high-information card back composition.
 * Front and Back share one content model without requiring creator double-work.
 */
export function generateCoordinatedBackComposition({
  design,
  palette,
  inputs,
  person,
  appearance,
}: {
  design: FlagshipDesign
  palette: FlagshipDesign['palette']
  inputs: ContentStore
  person: any
  appearance?: StudioAppearanceState
}): CardComposition {
  const backLayers: CardCompositionLayer[] = []

  // 1. Base card background
  backLayers.push({
    id: 'back-base-card-bg',
    type: 'RECTANGLE',
    x: 0,
    y: 0,
    width: 600,
    height: 900,
    fill: palette.background,
  })

  // 2. Coordinated border
  backLayers.push({
    id: 'back-dec-outer-frame',
    type: 'RECTANGLE',
    x: 16,
    y: 16,
    width: 568,
    height: 868,
    fill: palette.border,
  })
  backLayers.push({
    id: 'back-dec-inner-mat',
    type: 'RECTANGLE',
    x: 20,
    y: 20,
    width: 560,
    height: 860,
    fill: palette.background,
  })

  // 3. Top Header Colophon
  backLayers.push({
    id: 'back-header-plate',
    type: 'RECTANGLE',
    x: 40,
    y: 40,
    width: 520,
    height: 32,
    fill: palette.surface,
  })
  backLayers.push({
    id: 'back-header-text',
    type: 'TEXT',
    x: 50,
    y: 48,
    width: 500,
    height: 18,
    text: 'RARE COLLECTIBLE ARCHIVE · OFFICIAL REGISTRY',
    fontSize: 11,
    fontRole: 'mono',
    fill: palette.subtext,
    allCaps: true,
  })

  // 4. Subject Identity
  const subjectName = inputs.input1 || person?.displayName || 'COLLECTIBLE SUBJECT'
  const subjectRole = inputs.input2 || person?.bio?.slice(0, 40) || 'AUTHENTIC ISSUE'
  backLayers.push({
    id: 'back-subject-name',
    type: 'TEXT',
    x: 44,
    y: 88,
    width: 512,
    height: 40,
    text: subjectName,
    fontSize: 26,
    fontRole: appearance?.fontRole || design.inputs[0]?.fontRole || 'serif',
    fill: palette.foreground,
    allCaps: true,
  })
  backLayers.push({
    id: 'back-subject-role',
    type: 'TEXT',
    x: 44,
    y: 132,
    width: 512,
    height: 24,
    text: subjectRole,
    fontSize: 13,
    fontRole: 'sans',
    fill: palette.accent,
    allCaps: true,
  })
  backLayers.push({
    id: 'back-divider-1',
    type: 'RECTANGLE',
    x: 44,
    y: 164,
    width: 512,
    height: 2,
    fill: palette.accent,
  })

  // 5. The Story / Biography Block
  backLayers.push({
    id: 'back-story-label',
    type: 'TEXT',
    x: 44,
    y: 180,
    width: 512,
    height: 18,
    text: 'THE CHRONICLE & SIGNIFICANCE',
    fontSize: 10,
    fontRole: 'mono',
    fill: palette.subtext,
    allCaps: true,
  })
  backLayers.push({
    id: 'back-story-box',
    type: 'RECTANGLE',
    x: 44,
    y: 204,
    width: 512,
    height: 216,
    fill: palette.surface,
  })
  const storyText =
    inputs.input3 ||
    person?.bio ||
    'An authentic chronicle of milestones, historic achievements, and cultural significance permanently cataloged in the RARE collectible index.'
  backLayers.push({
    id: 'back-story-text',
    type: 'TEXT',
    x: 58,
    y: 218,
    width: 484,
    height: 188,
    text: storyText,
    fontSize: 14,
    fontRole: 'sans',
    fill: palette.foreground,
  })

  // 6. Milestones / Career Highlights
  backLayers.push({
    id: 'back-milestones-label',
    type: 'TEXT',
    x: 44,
    y: 438,
    width: 512,
    height: 18,
    text: 'KEY MILESTONES & HONORS',
    fontSize: 10,
    fontRole: 'mono',
    fill: palette.subtext,
    allCaps: true,
  })
  const milestone1 = inputs.input4 || 'Registered benchmark achievement in official archives'
  const milestone2 = inputs.input5 || 'Distinguished honorary recognition and master accreditation'

  backLayers.push({
    id: 'back-milestone-bullet-1',
    type: 'RECTANGLE',
    x: 48,
    y: 468,
    width: 8,
    height: 8,
    fill: palette.accent,
  })
  backLayers.push({
    id: 'back-milestone-text-1',
    type: 'TEXT',
    x: 66,
    y: 462,
    width: 490,
    height: 24,
    text: milestone1,
    fontSize: 13,
    fontRole: 'sans',
    fill: palette.foreground,
  })

  backLayers.push({
    id: 'back-milestone-bullet-2',
    type: 'RECTANGLE',
    x: 48,
    y: 498,
    width: 8,
    height: 8,
    fill: palette.accent,
  })
  backLayers.push({
    id: 'back-milestone-text-2',
    type: 'TEXT',
    x: 66,
    y: 492,
    width: 490,
    height: 24,
    text: milestone2,
    fontSize: 13,
    fontRole: 'sans',
    fill: palette.foreground,
  })

  // 7. Recorded Metrics & Statistics
  backLayers.push({
    id: 'back-stats-label',
    type: 'TEXT',
    x: 44,
    y: 536,
    width: 512,
    height: 18,
    text: 'VERIFIED METRICS & RECORD',
    fontSize: 10,
    fontRole: 'mono',
    fill: palette.subtext,
    allCaps: true,
  })

  const metricValue = inputs.input6 || '99.4'
  backLayers.push({
    id: 'back-stat-card-1',
    type: 'RECTANGLE',
    x: 44,
    y: 560,
    width: 160,
    height: 80,
    fill: palette.surface,
  })
  backLayers.push({
    id: 'back-stat-card-1-label',
    type: 'TEXT',
    x: 54,
    y: 570,
    width: 140,
    height: 16,
    text: 'RATING / RECORD',
    fontSize: 10,
    fontRole: 'mono',
    fill: palette.subtext,
    allCaps: true,
  })
  backLayers.push({
    id: 'back-stat-card-1-val',
    type: 'TEXT',
    x: 54,
    y: 592,
    width: 140,
    height: 36,
    text: metricValue,
    fontSize: 22,
    fontRole: 'mono',
    fill: palette.accent,
  })

  backLayers.push({
    id: 'back-stat-card-2',
    type: 'RECTANGLE',
    x: 220,
    y: 560,
    width: 160,
    height: 80,
    fill: palette.surface,
  })
  backLayers.push({
    id: 'back-stat-card-2-label',
    type: 'TEXT',
    x: 230,
    y: 570,
    width: 140,
    height: 16,
    text: 'ARCHIVE STATUS',
    fontSize: 10,
    fontRole: 'mono',
    fill: palette.subtext,
    allCaps: true,
  })
  backLayers.push({
    id: 'back-stat-card-2-val',
    type: 'TEXT',
    x: 230,
    y: 592,
    width: 140,
    height: 36,
    text: 'VERIFIED',
    fontSize: 18,
    fontRole: 'mono',
    fill: palette.foreground,
  })

  backLayers.push({
    id: 'back-stat-card-3',
    type: 'RECTANGLE',
    x: 396,
    y: 560,
    width: 160,
    height: 80,
    fill: palette.surface,
  })
  backLayers.push({
    id: 'back-stat-card-3-label',
    type: 'TEXT',
    x: 406,
    y: 570,
    width: 140,
    height: 16,
    text: 'RARITY TIER',
    fontSize: 10,
    fontRole: 'mono',
    fill: palette.subtext,
    allCaps: true,
  })
  backLayers.push({
    id: 'back-stat-card-3-val',
    type: 'TEXT',
    x: 406,
    y: 592,
    width: 140,
    height: 36,
    text: 'LEGENDARY',
    fontSize: 16,
    fontRole: 'mono',
    fill: palette.accent,
  })

  // 8. Footer Provenance & Edition Colophon
  backLayers.push({
    id: 'back-divider-2',
    type: 'RECTANGLE',
    x: 44,
    y: 666,
    width: 512,
    height: 2,
    fill: palette.border,
  })
  backLayers.push({
    id: 'back-footer-edition',
    type: 'TEXT',
    x: 44,
    y: 680,
    width: 512,
    height: 18,
    text: 'SERIES 01 · 1 OF 25 LIMITED ISSUE · VERIFIED PROVENANCE',
    fontSize: 10,
    fontRole: 'mono',
    fill: palette.subtext,
    allCaps: true,
  })
  backLayers.push({
    id: 'back-footer-barcode',
    type: 'RECTANGLE',
    x: 44,
    y: 710,
    width: 200,
    height: 24,
    fill: palette.surface,
  })
  backLayers.push({
    id: 'back-footer-security-code',
    type: 'TEXT',
    x: 52,
    y: 715,
    width: 184,
    height: 14,
    text: 'RARE-SEC-7749-012X',
    fontSize: 9,
    fontRole: 'mono',
    fill: palette.subtext,
    allCaps: true,
  })
  backLayers.push({
    id: 'back-footer-seal',
    type: 'RECTANGLE',
    x: 476,
    y: 700,
    width: 80,
    height: 42,
    fill: palette.accent,
  })
  backLayers.push({
    id: 'back-footer-seal-text',
    type: 'TEXT',
    x: 484,
    y: 712,
    width: 64,
    height: 20,
    text: 'RARE',
    fontSize: 15,
    fontRole: 'display',
    fill: palette.background,
    allCaps: true,
  })

  return {
    schemaVersion: 1,
    canvas: { width: 600, height: 900 },
    layers: backLayers,
    metadata: {
      rendererVersion: 'rdc-composition-v1',
      flagship: {
        id: `${design.id}-back`,
        name: `${design.name} (Back)`,
        cardTypeId: 'standard',
        selectedImageId: null,
        inputs,
        contentStore: inputs,
        fittedFontSizes: {},
        isOverflow: {},
        profile: person || null,
        appearance: appearance || null,
      },
    },
  }
}
