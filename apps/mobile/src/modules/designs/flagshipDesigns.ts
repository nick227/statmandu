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
  // 1. Royal Heritage (Museum Relic Benchmark)
  {
    id: 'royal-heritage',
    name: 'Royal Heritage',
    family: 'Heritage',
    description: 'Deep obsidian, 24k gold leaf ornamentation, regal filigree, and dramatic portrait framing.',
    visualTradition: 'Royal Portraiture & Regal Numismatics',
    palette: {
      background: '#07090E',
      surface: '#121620',
      foreground: '#FFFFFF',
      accent: '#D4AF37',
      border: '#F59E0B',
      subtext: '#94A3B8',
    },
    artwork: { x: 44, y: 64, width: 512, height: 550, tint: '#0F172A', borderWidth: 3.5, borderColor: '#D4AF37' },
    inputs: [
      {
        id: 'input1',
        label: 'Subject Name',
        bounds: { x: 64, y: 668, width: 472, height: 42 },
        preferredFontSize: 28,
        minFontSize: 18,
        maxLines: 1,
        required: true,
        fill: '#0F172A',
        fontRole: 'serif',
        allCaps: true,
        textAlign: 'center',
      },
      {
        id: 'input2',
        label: 'Title / Moniker',
        bounds: { x: 44, y: 726, width: 512, height: 24 },
        preferredFontSize: 13,
        minFontSize: 10,
        maxLines: 1,
        required: false,
        fill: '#D4AF37',
        fontRole: 'sans',
        allCaps: true,
        textAlign: 'center',
      },
      {
        id: 'input3',
        label: 'Chronicle / Quote',
        bounds: { x: 44, y: 756, width: 512, height: 44 },
        preferredFontSize: 13.5,
        minFontSize: 11,
        maxLines: 2,
        required: false,
        fill: '#FCD34D',
        fontRole: 'serif',
        textAlign: 'center',
      },
    ],
    decorations: (p) => [
      // Outer Gilded Frame & Obsidian Mat
      { id: 'dec-outer-frame', type: 'RECTANGLE', x: 14, y: 14, width: 572, height: 872, fill: p.border, borderRadius: 20 },
      { id: 'dec-inner-mat', type: 'RECTANGLE', x: 18, y: 18, width: 564, height: 864, fill: p.background, borderRadius: 18 },

      // Corner Rosettes
      { id: 'dec-corner-tl', type: 'RECTANGLE', x: 24, y: 24, width: 14, height: 14, fill: p.accent, borderRadius: 3 },
      { id: 'dec-corner-tr', type: 'RECTANGLE', x: 562, y: 24, width: 14, height: 14, fill: p.accent, borderRadius: 3 },
      { id: 'dec-corner-bl', type: 'RECTANGLE', x: 24, y: 862, width: 14, height: 14, fill: p.accent, borderRadius: 3 },
      { id: 'dec-corner-br', type: 'RECTANGLE', x: 562, y: 862, width: 14, height: 14, fill: p.accent, borderRadius: 3 },

      // Top Colophon Header
      { id: 'dec-topps-badge-bg', type: 'RECTANGLE', x: 44, y: 30, width: 90, height: 22, fill: '#141824', borderColor: p.accent, borderWidth: 1, borderRadius: 4 },
      { id: 'dec-topps-badge-txt', type: 'TEXT', x: 44, y: 32, width: 90, height: 18, text: 'RARE 1/1', fontSize: 10, fill: p.accent, fontRole: 'mono', allCaps: true, bold: true },
      { id: 'dec-serial-badge-bg', type: 'RECTANGLE', x: 466, y: 30, width: 90, height: 22, fill: '#141824', borderColor: p.accent, borderWidth: 1, borderRadius: 4 },
      { id: 'dec-serial-badge-txt', type: 'TEXT', x: 466, y: 32, width: 90, height: 18, text: '#GD-01', fontSize: 10, fill: p.accent, fontRole: 'mono', allCaps: true, bold: true },
      { id: 'dec-banner-txt', type: 'TEXT', x: 140, y: 32, width: 320, height: 18, text: 'ULTRA LEGACY SERIES · SPECIAL EDITION', fontSize: 10, fill: p.border, fontRole: 'sans', allCaps: true, tracking: 1.2 },

      // Golden Autograph Script Overlay across lower portrait
      { id: 'dec-autograph-script', type: 'TEXT', x: 60, y: 566, width: 480, height: 36, text: '~ Jerry Garcia ~', fontSize: 24, fill: '#FEF08A', fontRole: 'display', italic: true, bold: true, tracking: 2, textAlign: 'center' },

      // Multi-tier Hardware Plaques
      { id: 'dec-pill-plaque-bg', type: 'RECTANGLE', x: 170, y: 624, width: 260, height: 26, fill: '#1A1814', borderColor: p.accent, borderWidth: 1.5, borderRadius: 13 },
      { id: 'dec-pill-plaque-txt', type: 'TEXT', x: 170, y: 627, width: 260, height: 20, text: '★ ONE OF ONE · 1965-2025 ★', fontSize: 11, fill: '#FDE68A', fontRole: 'mono', allCaps: true, bold: true, textAlign: 'center' },

      // Beveled Ivory Nameplate Box & Rivets
      { id: 'dec-ivory-plate-bg', type: 'RECTANGLE', x: 44, y: 660, width: 512, height: 56, fill: '#FAF8F5', borderColor: '#B45309', borderWidth: 2.5, borderRadius: 8 },
      { id: 'dec-rivet-tl', type: 'RECTANGLE', x: 52, y: 668, width: 6, height: 6, fill: '#B45309', borderRadius: 3 },
      { id: 'dec-rivet-tr', type: 'RECTANGLE', x: 542, y: 668, width: 6, height: 6, fill: '#B45309', borderRadius: 3 },
      { id: 'dec-rivet-bl', type: 'RECTANGLE', x: 52, y: 702, width: 6, height: 6, fill: '#B45309', borderRadius: 3 },
      { id: 'dec-rivet-br', type: 'RECTANGLE', x: 542, y: 702, width: 6, height: 6, fill: '#B45309', borderRadius: 3 },

      // Bottom Archival Quote Plate
      { id: 'dec-bottom-quote-plate', type: 'RECTANGLE', x: 54, y: 810, width: 492, height: 32, fill: '#141824', borderColor: p.accent, borderWidth: 1, borderRadius: 6 },
      { id: 'dec-bottom-quote-txt', type: 'TEXT', x: 54, y: 817, width: 492, height: 18, text: '"What a long, strange trip it\'s been"', fontSize: 13, fill: '#FDE047', fontRole: 'serif', italic: true, textAlign: 'center' },
      { id: 'dec-bottom-colophon', type: 'TEXT', x: 44, y: 852, width: 512, height: 16, text: 'TOPPS OFFICIAL 1-OF-1 COLLECTIBLE · ALL RIGHTS RESERVED', fontSize: 9.5, fill: p.subtext, fontRole: 'mono', allCaps: true, textAlign: 'center' },
    ],
  },

  // 2. Arcade Legends (Retro Pixel HUD)
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
    artwork: { x: 36, y: 56, width: 528, height: 500, tint: '#0D142D', borderWidth: 3, borderColor: '#00F0FF' },
    inputs: [
      {
        id: 'input1',
        label: 'Player Identifier',
        bounds: { x: 36, y: 588, width: 528, height: 48 },
        preferredFontSize: 32,
        minFontSize: 20,
        maxLines: 1,
        required: true,
        fill: '#00F0FF',
        fontRole: 'display',
        allCaps: true,
      },
      {
        id: 'input2',
        label: 'Character Class / Stage',
        bounds: { x: 36, y: 642, width: 528, height: 26 },
        preferredFontSize: 13,
        minFontSize: 10,
        maxLines: 1,
        required: false,
        fill: '#FFE600',
        fontRole: 'mono',
        allCaps: true,
      },
      {
        id: 'input3',
        label: 'Lore & High Score Feats',
        bounds: { x: 36, y: 674, width: 528, height: 130 },
        preferredFontSize: 13.5,
        minFontSize: 10,
        maxLines: 5,
        required: false,
        fill: '#E0F2FE',
        fontRole: 'sans',
      },
    ],
    decorations: (p) => [
      // CRT Monitor Bezel Frame
      { id: 'dec-crt-bezel', type: 'RECTANGLE', x: 12, y: 12, width: 576, height: 876, fill: p.background, borderColor: p.foreground, borderWidth: 3.5, borderRadius: 28 },

      // Top Arcade CRT HUD
      { id: 'dec-crt-1up', type: 'TEXT', x: 36, y: 30, width: 160, height: 22, text: '1UP 3,333,360', fontSize: 12, fill: p.border, fontRole: 'mono', bold: true },
      { id: 'dec-crt-hi', type: 'TEXT', x: 210, y: 30, width: 180, height: 22, text: 'HIGH SCORE 3,333,360', fontSize: 12, fill: p.accent, fontRole: 'mono', bold: true },
      { id: 'dec-crt-coin', type: 'TEXT', x: 460, y: 30, width: 100, height: 22, text: 'CREDIT 02', fontSize: 12, fill: p.foreground, fontRole: 'mono', bold: true },

      // Power Meter Graphic Bars
      { id: 'dec-power-bar-bg', type: 'RECTANGLE', x: 36, y: 566, width: 528, height: 14, fill: '#141E3C', borderRadius: 4 },
      { id: 'dec-power-bar-seg1', type: 'RECTANGLE', x: 38, y: 568, width: 170, height: 10, fill: p.foreground, borderRadius: 2 },
      { id: 'dec-power-bar-seg2', type: 'RECTANGLE', x: 212, y: 568, width: 170, height: 10, fill: p.border, borderRadius: 2 },
      { id: 'dec-power-bar-seg3', type: 'RECTANGLE', x: 386, y: 568, width: 174, height: 10, fill: p.accent, borderRadius: 2 },

      // Coin-Op Footer
      { id: 'dec-arcade-footer', type: 'TEXT', x: 36, y: 818, width: 528, height: 22, text: 'INSERT COIN TO CONTINUE · 1985 HALL OF FAME', fontSize: 11, fill: p.accent, fontRole: 'mono', bold: true, textAlign: 'center' },
      { id: 'dec-arcade-dip', type: 'TEXT', x: 36, y: 846, width: 528, height: 18, text: 'DIP SWITCH: 01-B ON · TWIN GALAXIES VERIFIED #85', fontSize: 9.5, fill: p.border, fontRole: 'mono', textAlign: 'center' },
    ],
  },

  // 3. Modern Editorial (Swiss Broadsheet)
  {
    id: 'modern-editorial',
    name: 'Modern Editorial',
    family: 'Swiss Editorial',
    description: 'Gallery-quality Swiss typography, confident whitespace, stark monochrome, and vermilion accents.',
    visualTradition: 'International Typographic Style & Fine Art Monographs',
    palette: {
      background: '#F8F9FA',
      surface: '#FFFFFF',
      foreground: '#0F172A',
      accent: '#E11D48',
      border: '#0F172A',
      subtext: '#64748B',
    },
    artwork: { x: 32, y: 54, width: 536, height: 460, tint: '#FFFFFF', borderWidth: 1, borderColor: '#0F172A' },
    inputs: [
      {
        id: 'input1',
        label: 'Subject Name',
        bounds: { x: 32, y: 530, width: 536, height: 64 },
        preferredFontSize: 44,
        minFontSize: 24,
        maxLines: 1,
        required: true,
        fill: '#0F172A',
        fontRole: 'sans',
        allCaps: false,
      },
      {
        id: 'input2',
        label: 'Discipline & Origin',
        bounds: { x: 32, y: 610, width: 536, height: 26 },
        preferredFontSize: 13,
        minFontSize: 10,
        maxLines: 1,
        required: false,
        fill: '#E11D48',
        fontRole: 'mono',
        allCaps: true,
      },
      {
        id: 'input3',
        label: 'Critical Appraisal / Essay',
        bounds: { x: 32, y: 644, width: 536, height: 170 },
        preferredFontSize: 14,
        minFontSize: 10,
        maxLines: 6,
        required: false,
        fill: '#334155',
        fontRole: 'sans',
      },
    ],
    decorations: (p) => [
      // Top Swiss Index
      { id: 'dec-swiss-index', type: 'TEXT', x: 32, y: 28, width: 536, height: 20, text: 'ISSUE 04 / ARCHITECTURE MONOGRAPH / RARE BASEL', fontSize: 11, fill: p.foreground, fontRole: 'mono', bold: true },

      // Red Accent Monograph Rule
      { id: 'dec-editorial-bar', type: 'RECTANGLE', x: 32, y: 598, width: 536, height: 3, fill: p.accent },

      // Coordinate Tag
      { id: 'dec-coordinate-tag', type: 'TEXT', x: 32, y: 830, width: 536, height: 20, text: '950+ BUILT WORKS · 44 NATIONS · LONDON / BASEL', fontSize: 10, fill: p.subtext, fontRole: 'mono' },
    ],
  },

  // 4. Psychedelic Archive (Concert Poster / Art Nouveau)
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
      border: '#F59E0B',
      subtext: '#E9D5FF',
    },
    artwork: { x: 40, y: 56, width: 520, height: 500, tint: '#230E39', borderWidth: 2.5, borderColor: '#EC4899' },
    inputs: [
      {
        id: 'input1',
        label: 'Iconic Name',
        bounds: { x: 40, y: 580, width: 520, height: 54 },
        preferredFontSize: 36,
        minFontSize: 22,
        maxLines: 1,
        required: true,
        fill: '#FDF4FF',
        fontRole: 'display',
        allCaps: true,
        textAlign: 'center',
      },
      {
        id: 'input2',
        label: 'Movement / Sound',
        bounds: { x: 40, y: 638, width: 520, height: 24 },
        preferredFontSize: 13,
        minFontSize: 10,
        maxLines: 1,
        required: false,
        fill: '#F59E0B',
        fontRole: 'sans',
        allCaps: true,
        textAlign: 'center',
      },
      {
        id: 'input3',
        label: 'Mythos & Anthology',
        bounds: { x: 40, y: 668, width: 520, height: 130 },
        preferredFontSize: 13.5,
        minFontSize: 10,
        maxLines: 5,
        required: false,
        fill: '#F3E8FF',
        fontRole: 'serif',
        textAlign: 'center',
      },
    ],
    decorations: (p) => [
      // Sinuous Art Nouveau Arch Frame
      { id: 'dec-psych-outer', type: 'RECTANGLE', x: 16, y: 16, width: 568, height: 868, fill: p.border, borderRadius: 26 },
      { id: 'dec-psych-inner', type: 'RECTANGLE', x: 20, y: 20, width: 560, height: 860, fill: p.background, borderRadius: 22 },

      // Top Concert Header
      { id: 'dec-psych-header', type: 'TEXT', x: 40, y: 28, width: 520, height: 24, text: 'WOODSTOCK 1969 · HISTORIC HEADLINER', fontSize: 12, fill: p.border, fontRole: 'display', allCaps: true, textAlign: 'center' },

      // Flowing Liquid Divider
      { id: 'dec-psych-divider', type: 'RECTANGLE', x: 150, y: 568, width: 300, height: 3, fill: p.accent, borderRadius: 2 },

      // VIP Pass & Colophon
      { id: 'dec-psych-vip-bg', type: 'RECTANGLE', x: 120, y: 808, width: 360, height: 28, fill: '#2B1245', borderColor: p.border, borderWidth: 1.5, borderRadius: 14 },
      { id: 'dec-psych-vip-txt', type: 'TEXT', x: 120, y: 814, width: 360, height: 18, text: '★ BILL GRAHAM PRESENTS · FILLMORE WEST ★', fontSize: 10, fill: '#FDE047', fontRole: 'display', allCaps: true, textAlign: 'center' },
      { id: 'dec-psych-colophon', type: 'TEXT', x: 40, y: 844, width: 520, height: 22, text: 'THE ELECTRIC SKY CHRONICLES · 1969 ARCHIVE', fontSize: 10.5, fill: '#C084FC', fontRole: 'serif', italic: true, textAlign: 'center' },
    ],
  },

  // 5. Chrome Future (Special Illustration Rare - SAR)
  {
    id: 'chrome-future',
    name: 'Chrome Future',
    family: 'Titanium Cyber',
    description: 'Full-bleed cyberpunk illustration, floating frosted glass HUD capsules, and secret rare stamp.',
    visualTradition: 'Pokémon Special Illustration Rare & Cyberpunk Mecha',
    palette: {
      background: '#090D16',
      surface: '#0F172A',
      foreground: '#E2E8F0',
      accent: '#00F0FF',
      border: '#38BDF8',
      subtext: '#64748B',
    },
    artwork: { x: 14, y: 14, width: 572, height: 872, tint: '#0F172A', borderWidth: 2, borderColor: '#00F0FF' },
    inputs: [
      {
        id: 'input1',
        label: 'Cybernetic Designation',
        bounds: { x: 82, y: 44, width: 470, height: 26 },
        preferredFontSize: 19,
        minFontSize: 14,
        maxLines: 1,
        required: true,
        fill: '#FFFFFF',
        fontRole: 'mono',
        allCaps: true,
      },
      {
        id: 'input2',
        label: 'Clearance & Registry',
        bounds: { x: 48, y: 574, width: 504, height: 28 },
        preferredFontSize: 16,
        minFontSize: 11,
        maxLines: 1,
        required: false,
        fill: '#00F0FF',
        fontRole: 'mono',
        allCaps: true,
      },
      {
        id: 'input3',
        label: 'System Diagnostics & Telemetry',
        bounds: { x: 48, y: 608, width: 504, height: 100 },
        preferredFontSize: 13.5,
        minFontSize: 10,
        maxLines: 4,
        required: false,
        fill: '#E2E8F0',
        fontRole: 'sans',
      },
    ],
    decorations: (p) => [
      // Top Floating Glass Capsule
      { id: 'dec-glass-top-bg', type: 'RECTANGLE', x: 32, y: 32, width: 536, height: 48, fill: 'rgba(6, 11, 28, 0.85)', borderColor: p.accent, borderWidth: 1.5, borderRadius: 24 },
      { id: 'dec-glass-top-orb', type: 'RECTANGLE', x: 44, y: 42, width: 28, height: 28, fill: p.accent, borderRadius: 14 },

      // Bottom Floating Glass Ability Capsule
      { id: 'dec-glass-ability-bg', type: 'RECTANGLE', x: 32, y: 560, width: 536, height: 160, fill: 'rgba(6, 11, 28, 0.88)', borderColor: p.border, borderWidth: 1.5, borderRadius: 16 },

      // Base Secret Rare Ribbon
      { id: 'dec-glass-ribbon-bg', type: 'RECTANGLE', x: 32, y: 732, width: 536, height: 36, fill: 'rgba(6, 11, 28, 0.80)', borderColor: p.accent, borderWidth: 1, borderRadius: 8 },
      { id: 'dec-glass-ribbon-txt', type: 'TEXT', x: 32, y: 742, width: 536, height: 18, text: '★★★ SPECIAL ILLUSTRATION RARE #231/198 · SECRET HYPER RARE', fontSize: 11, fill: p.border, fontRole: 'mono', bold: true },
    ],
  },

  // 6. Museum Archive (Cosmos Heritage)
  {
    id: 'museum-archive',
    name: 'Museum Archive',
    family: 'Botanical Naturalist Plate',
    description: 'Antique vellum paper, botanical sepia ink, dual-stroke bronze frame, and historic wax seal.',
    visualTradition: '1999 Base Set Holofoil & Victorian Scientific Specimen Folio',
    palette: {
      background: '#1C160E',
      surface: '#2A1F14',
      foreground: '#FBF8F3',
      accent: '#8B4513',
      border: '#C4A47C',
      subtext: '#A88B6E',
    },
    artwork: { x: 36, y: 64, width: 528, height: 500, tint: '#2A1F14', borderWidth: 2, borderColor: '#C4A47C' },
    inputs: [
      {
        id: 'input1',
        label: 'Specimen Designation',
        bounds: { x: 40, y: 580, width: 520, height: 46 },
        preferredFontSize: 30,
        minFontSize: 20,
        maxLines: 1,
        required: true,
        fill: '#FBF8F3',
        fontRole: 'serif',
        allCaps: false,
      },
      {
        id: 'input2',
        label: 'Classification / Taxon',
        bounds: { x: 40, y: 630, width: 520, height: 24 },
        preferredFontSize: 13,
        minFontSize: 10,
        maxLines: 1,
        required: false,
        fill: '#D97706',
        fontRole: 'sans',
        allCaps: true,
      },
      {
        id: 'input3',
        label: 'Curator Notes & Field Observation',
        bounds: { x: 40, y: 660, width: 520, height: 136 },
        preferredFontSize: 13.5,
        minFontSize: 10,
        maxLines: 5,
        required: false,
        fill: '#E5D5C5',
        fontRole: 'serif',
      },
    ],
    decorations: (p) => [
      // Dual-stroke Antique Bronze & Vellum Frame
      { id: 'dec-archive-border-outer', type: 'RECTANGLE', x: 14, y: 14, width: 572, height: 872, fill: p.border, borderRadius: 16 },
      { id: 'dec-archive-border-inner', type: 'RECTANGLE', x: 18, y: 18, width: 564, height: 864, fill: p.background, borderRadius: 14 },

      // Top Archival Plate
      { id: 'dec-archive-plate-bg', type: 'RECTANGLE', x: 36, y: 32, width: 140, height: 22, fill: '#2A1F14', borderColor: p.border, borderWidth: 1, borderRadius: 4 },
      { id: 'dec-archive-plate-txt', type: 'TEXT', x: 36, y: 34, width: 140, height: 18, text: 'ROYAL ARCHIVE #01', fontSize: 10, fill: p.foreground, fontRole: 'mono', bold: true },

      // Top Right Oval Discipline Crest
      { id: 'dec-archive-oval-bg', type: 'RECTANGLE', x: 396, y: 28, width: 168, height: 28, fill: p.accent, borderColor: p.border, borderWidth: 1.5, borderRadius: 14 },
      { id: 'dec-archive-oval-txt', type: 'TEXT', x: 396, y: 33, width: 168, height: 18, text: 'COMPUTING · 1843', fontSize: 10, fill: '#FDE68A', fontRole: 'mono', bold: true },

      // Archival Gold Seal & Base Historical Colophon
      { id: 'dec-archive-seal-bg', type: 'RECTANGLE', x: 130, y: 808, width: 340, height: 28, fill: '#2A1F14', borderColor: p.border, borderWidth: 1.5, borderRadius: 14 },
      { id: 'dec-archive-seal-txt', type: 'TEXT', x: 130, y: 814, width: 340, height: 18, text: '★ ROYAL SOCIETY OF LONDON · FIRST EDITION ★', fontSize: 9.5, fill: '#FDE68A', fontRole: 'serif', bold: true, textAlign: 'center' },
      { id: 'dec-archive-colophon', type: 'TEXT', x: 40, y: 846, width: 520, height: 20, text: 'HISTORICAL FIRST EDITION SPECIMEN · ROYAL ARCHIVES', fontSize: 9.5, fill: p.subtext, fontRole: 'mono', textAlign: 'center' },
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
  } else if (cardType.id === 'stats' && design.id !== 'chrome-future') {
    artX = artwork.x
    artY = Math.min(artwork.y, 80)
    artW = artwork.width
    artH = Math.min(artwork.height, 420)
  } else if (design.id !== 'chrome-future' && appearance?.layoutVariant === 'portrait') {
    artH = Math.min(artwork.height + 40, 580)
  } else if (design.id !== 'chrome-future' && appearance?.layoutVariant === 'editorial') {
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
  if (cardType.id === 'stats' && design.id !== 'chrome-future') {
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
    } else if (cardType.id === 'stats' && design.id !== 'chrome-future') {
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
      textAlign: inputDef.textAlign,
    })
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
  const subjectName = inputs.input1 || person?.displayName || 'COLLECTIBLE SUBJECT'
  const subjectRole = inputs.input2 || person?.bio?.slice(0, 45) || 'AUTHENTIC ISSUE'
  const storyText =
    inputs.input3 ||
    person?.bio ||
    'An authentic chronicle of milestones, historic achievements, and cultural significance permanently cataloged in the RARE collectible index.'
  const milestone1 = inputs.input4 || 'Registered benchmark achievement in official archives'
  const milestone2 = inputs.input5 || 'Distinguished honorary recognition and master accreditation'
  const metricValue = inputs.input6 || '99.4'

  const designId = design.id

  if (designId === 'royal-heritage') {
    // ---------------------------------------------------------------------------
    // 1. ROYAL HERITAGE (Ultra Legacy / Jerry Garcia 1/1 Gilded Relic Back)
    // ---------------------------------------------------------------------------
    backLayers.push({
      id: 'back-base-card-bg',
      type: 'RECTANGLE',
      x: 0,
      y: 0,
      width: 600,
      height: 900,
      fill: '#0E0C0A',
    })
    // 24k Gold dual filigree frame
    backLayers.push({
      id: 'back-dec-outer-frame',
      type: 'RECTANGLE',
      x: 16,
      y: 16,
      width: 568,
      height: 868,
      fill: 'transparent',
      borderColor: '#D4AF37',
      borderWidth: 3,
      borderRadius: 16,
    })
    backLayers.push({
      id: 'back-dec-inner-mat',
      type: 'RECTANGLE',
      x: 24,
      y: 24,
      width: 552,
      height: 852,
      fill: 'transparent',
      borderColor: '#92400E',
      borderWidth: 1.5,
      borderRadius: 12,
    })
    // Gilded Ivory Header Plaque
    backLayers.push({
      id: 'back-header-plate',
      type: 'RECTANGLE',
      x: 44,
      y: 42,
      width: 512,
      height: 38,
      fill: '#1A1612',
      borderColor: '#D4AF37',
      borderWidth: 1.5,
      borderRadius: 6,
    })
    backLayers.push({
      id: 'back-header-text',
      type: 'TEXT',
      x: 54,
      y: 52,
      width: 492,
      height: 18,
      text: 'TOPPS ULTRA LEGACY · 1 OF 1 PROVENANCE CERTIFICATE · #GD-01',
      fontSize: 10.5,
      fontRole: 'mono',
      fill: '#FDE047',
      allCaps: true,
      letterSpacing: 1.2,
      textAlign: 'center',
    })
    // Subject Name in Roman Gold
    backLayers.push({
      id: 'back-subject-name',
      type: 'TEXT',
      x: 44,
      y: 96,
      width: 512,
      height: 42,
      text: subjectName,
      fontSize: 27,
      fontRole: 'serif',
      fill: '#FEF08A',
      allCaps: true,
      textAlign: 'center',
      letterSpacing: 2.5,
    })
    backLayers.push({
      id: 'back-subject-role',
      type: 'TEXT',
      x: 44,
      y: 142,
      width: 512,
      height: 22,
      text: subjectRole,
      fontSize: 12,
      fontRole: 'serif',
      fill: '#D4AF37',
      allCaps: true,
      textAlign: 'center',
      letterSpacing: 3,
    })
    // Golden divider ribbon
    backLayers.push({
      id: 'back-divider-1',
      type: 'RECTANGLE',
      x: 180,
      y: 172,
      width: 240,
      height: 2,
      fill: '#D4AF37',
    })
    // Historical Parchment Story Chamber
    backLayers.push({
      id: 'back-story-box',
      type: 'RECTANGLE',
      x: 44,
      y: 194,
      width: 512,
      height: 236,
      fill: '#16130E',
      borderColor: '#B45309',
      borderWidth: 1,
      borderRadius: 8,
    })
    backLayers.push({
      id: 'back-story-label',
      type: 'TEXT',
      x: 60,
      y: 208,
      width: 480,
      height: 18,
      text: 'AUTHENTIC HISTORICAL CHRONICLE & PROVENANCE',
      fontSize: 10,
      fontRole: 'serif',
      fill: '#D4AF37',
      allCaps: true,
      letterSpacing: 1.5,
    })
    backLayers.push({
      id: 'back-story-text',
      type: 'TEXT',
      x: 60,
      y: 234,
      width: 480,
      height: 180,
      text: storyText,
      fontSize: 13.5,
      fontRole: 'serif',
      fill: '#F5F5F4',
    })
    // Milestone Ribbons with Gold Seals
    backLayers.push({
      id: 'back-milestones-label',
      type: 'TEXT',
      x: 44,
      y: 450,
      width: 512,
      height: 18,
      text: 'VERIFIED ARCHIVAL HONORS & BENCHMARKS',
      fontSize: 10,
      fontRole: 'serif',
      fill: '#D4AF37',
      allCaps: true,
      letterSpacing: 1.5,
    })
    backLayers.push({
      id: 'back-milestone-bullet-1',
      type: 'RECTANGLE',
      x: 46,
      y: 476,
      width: 10,
      height: 10,
      fill: '#F59E0B',
      borderRadius: 5,
    })
    backLayers.push({
      id: 'back-milestone-text-1',
      type: 'TEXT',
      x: 66,
      y: 472,
      width: 490,
      height: 24,
      text: milestone1,
      fontSize: 13,
      fontRole: 'serif',
      fill: '#FEF9C3',
    })
    backLayers.push({
      id: 'back-milestone-bullet-2',
      type: 'RECTANGLE',
      x: 46,
      y: 508,
      width: 10,
      height: 10,
      fill: '#F59E0B',
      borderRadius: 5,
    })
    backLayers.push({
      id: 'back-milestone-text-2',
      type: 'TEXT',
      x: 66,
      y: 504,
      width: 490,
      height: 24,
      text: milestone2,
      fontSize: 13,
      fontRole: 'serif',
      fill: '#FEF9C3',
    })
    // Dual Certificate Grading Plaques
    backLayers.push({
      id: 'back-stats-label',
      type: 'TEXT',
      x: 44,
      y: 546,
      width: 512,
      height: 18,
      text: 'AUTHENTICATION STATUS & GRADE',
      fontSize: 10,
      fontRole: 'serif',
      fill: '#D4AF37',
      allCaps: true,
      letterSpacing: 1.5,
    })
    backLayers.push({
      id: 'back-stat-card-1',
      type: 'RECTANGLE',
      x: 44,
      y: 570,
      width: 160,
      height: 80,
      fill: '#1A1612',
      borderColor: '#D4AF37',
      borderWidth: 1.5,
      borderRadius: 8,
    })
    backLayers.push({
      id: 'back-stat-card-1-label',
      type: 'TEXT',
      x: 54,
      y: 580,
      width: 140,
      height: 16,
      text: 'ARCHIVE GRADE',
      fontSize: 9.5,
      fontRole: 'mono',
      fill: '#FEF08A',
      allCaps: true,
      textAlign: 'center',
    })
    backLayers.push({
      id: 'back-stat-card-1-val',
      type: 'TEXT',
      x: 54,
      y: 602,
      width: 140,
      height: 36,
      text: metricValue,
      fontSize: 22,
      fontRole: 'mono',
      fill: '#FDE047',
      textAlign: 'center',
    })
    backLayers.push({
      id: 'back-stat-card-2',
      type: 'RECTANGLE',
      x: 220,
      y: 570,
      width: 160,
      height: 80,
      fill: '#1A1612',
      borderColor: '#D4AF37',
      borderWidth: 1.5,
      borderRadius: 8,
    })
    backLayers.push({
      id: 'back-stat-card-2-label',
      type: 'TEXT',
      x: 230,
      y: 580,
      width: 140,
      height: 16,
      text: 'ISSUE STATUS',
      fontSize: 9.5,
      fontRole: 'mono',
      fill: '#FEF08A',
      allCaps: true,
      textAlign: 'center',
    })
    backLayers.push({
      id: 'back-stat-card-2-val',
      type: 'TEXT',
      x: 230,
      y: 604,
      width: 140,
      height: 36,
      text: 'ONE OF ONE',
      fontSize: 16,
      fontRole: 'serif',
      fill: '#FEF9C3',
      textAlign: 'center',
      allCaps: true,
    })
    backLayers.push({
      id: 'back-stat-card-3',
      type: 'RECTANGLE',
      x: 396,
      y: 570,
      width: 160,
      height: 80,
      fill: '#1A1612',
      borderColor: '#D4AF37',
      borderWidth: 1.5,
      borderRadius: 8,
    })
    backLayers.push({
      id: 'back-stat-card-3-label',
      type: 'TEXT',
      x: 406,
      y: 580,
      width: 140,
      height: 16,
      text: 'LEGACY TIER',
      fontSize: 9.5,
      fontRole: 'mono',
      fill: '#FEF08A',
      allCaps: true,
      textAlign: 'center',
    })
    backLayers.push({
      id: 'back-stat-card-3-val',
      type: 'TEXT',
      x: 406,
      y: 604,
      width: 140,
      height: 36,
      text: 'MASTER RELIC',
      fontSize: 14,
      fontRole: 'serif',
      fill: '#FDE047',
      textAlign: 'center',
      allCaps: true,
    })
    // Footer Colophon with Gold Wax Seal
    backLayers.push({
      id: 'back-divider-2',
      type: 'RECTANGLE',
      x: 44,
      y: 672,
      width: 512,
      height: 1.5,
      fill: '#B45309',
    })
    backLayers.push({
      id: 'back-footer-edition',
      type: 'TEXT',
      x: 44,
      y: 686,
      width: 512,
      height: 18,
      text: 'TOPPS ULTRA LEGACY · 60TH ANNIVERSARY SPECIAL 1/1 MASTER EDITION',
      fontSize: 10,
      fontRole: 'serif',
      fill: '#D4AF37',
      allCaps: true,
      letterSpacing: 1.5,
      textAlign: 'center',
    })
    backLayers.push({
      id: 'back-footer-barcode',
      type: 'RECTANGLE',
      x: 44,
      y: 714,
      width: 220,
      height: 28,
      fill: '#1A1612',
      borderColor: '#B45309',
      borderWidth: 1,
      borderRadius: 4,
    })
    backLayers.push({
      id: 'back-footer-security-code',
      type: 'TEXT',
      x: 52,
      y: 721,
      width: 204,
      height: 14,
      text: 'AUTHENTIC-TOPPS-GD01-MASTER',
      fontSize: 9,
      fontRole: 'mono',
      fill: '#FEF08A',
      allCaps: true,
    })
    backLayers.push({
      id: 'back-footer-seal',
      type: 'RECTANGLE',
      x: 466,
      y: 708,
      width: 90,
      height: 40,
      fill: '#F59E0B',
      borderColor: '#FEF08A',
      borderWidth: 1.5,
      borderRadius: 8,
    })
    backLayers.push({
      id: 'back-footer-seal-text',
      type: 'TEXT',
      x: 470,
      y: 719,
      width: 82,
      height: 20,
      text: '1 OF 1',
      fontSize: 14,
      fontRole: 'display',
      fill: '#000000',
      allCaps: true,
      textAlign: 'center',
    })
  } else if (designId === 'chrome-future') {
    // ---------------------------------------------------------------------------
    // 2. CHROME FUTURE (Pokémon SAR Cyber Shogun Tactical Dossier Back)
    // ---------------------------------------------------------------------------
    backLayers.push({
      id: 'back-base-card-bg',
      type: 'RECTANGLE',
      x: 0,
      y: 0,
      width: 600,
      height: 900,
      fill: '#080C16',
    })
    // Neon Cyan & Electric Violet HUD Framing
    backLayers.push({
      id: 'back-dec-outer-frame',
      type: 'RECTANGLE',
      x: 14,
      y: 14,
      width: 572,
      height: 872,
      fill: 'transparent',
      borderColor: '#06B6D4',
      borderWidth: 2,
      borderRadius: 6,
    })
    backLayers.push({
      id: 'back-dec-inner-mat',
      type: 'RECTANGLE',
      x: 20,
      y: 20,
      width: 560,
      height: 860,
      fill: 'transparent',
      borderColor: '#8B5CF6',
      borderWidth: 1,
      borderRadius: 4,
    })
    // Orbital Tactical Header Plate
    backLayers.push({
      id: 'back-header-plate',
      type: 'RECTANGLE',
      x: 40,
      y: 36,
      width: 520,
      height: 34,
      fill: '#0E172A',
      borderColor: '#06B6D4',
      borderWidth: 1,
      borderRadius: 4,
    })
    backLayers.push({
      id: 'back-header-text',
      type: 'TEXT',
      x: 50,
      y: 44,
      width: 500,
      height: 18,
      text: 'ORBITAL TACTICAL DOSSIER // SECRET RARE S-RANK #094',
      fontSize: 10,
      fontRole: 'mono',
      fill: '#22D3EE',
      allCaps: true,
      letterSpacing: 2,
      textAlign: 'center',
    })
    // Subject Name in Cyber Display Monospace
    backLayers.push({
      id: 'back-subject-name',
      type: 'TEXT',
      x: 40,
      y: 84,
      width: 520,
      height: 42,
      text: subjectName,
      fontSize: 28,
      fontRole: 'display',
      fill: '#38BDF8',
      allCaps: true,
      letterSpacing: 2,
    })
    backLayers.push({
      id: 'back-subject-role',
      type: 'TEXT',
      x: 40,
      y: 130,
      width: 520,
      height: 22,
      text: `DESIGNATION: ${subjectRole}`,
      fontSize: 12,
      fontRole: 'mono',
      fill: '#F472B6',
      allCaps: true,
      letterSpacing: 1.5,
    })
    backLayers.push({
      id: 'back-divider-1',
      type: 'RECTANGLE',
      x: 40,
      y: 160,
      width: 520,
      height: 2,
      fill: '#06B6D4',
    })
    // Frosted Holographic Tactical Intelligence Log
    backLayers.push({
      id: 'back-story-box',
      type: 'RECTANGLE',
      x: 40,
      y: 182,
      width: 520,
      height: 230,
      fill: '#0B132B',
      borderColor: '#06B6D4',
      borderWidth: 1,
      borderRadius: 6,
    })
    backLayers.push({
      id: 'back-story-label',
      type: 'TEXT',
      x: 56,
      y: 196,
      width: 488,
      height: 18,
      text: 'OPERATIONAL PROFILE & TACTICAL LOG',
      fontSize: 10,
      fontRole: 'mono',
      fill: '#22D3EE',
      allCaps: true,
      letterSpacing: 1.5,
    })
    backLayers.push({
      id: 'back-story-text',
      type: 'TEXT',
      x: 56,
      y: 222,
      width: 488,
      height: 176,
      text: storyText,
      fontSize: 13.5,
      fontRole: 'sans',
      fill: '#E0F2FE',
    })
    // Milestones with Neon Diamond Tokens
    backLayers.push({
      id: 'back-milestones-label',
      type: 'TEXT',
      x: 40,
      y: 434,
      width: 520,
      height: 18,
      text: 'TACTICAL DEPLOYMENTS & CLEARANCES',
      fontSize: 10,
      fontRole: 'mono',
      fill: '#22D3EE',
      allCaps: true,
      letterSpacing: 1.5,
    })
    backLayers.push({
      id: 'back-milestone-bullet-1',
      type: 'RECTANGLE',
      x: 44,
      y: 462,
      width: 8,
      height: 8,
      fill: '#22D3EE',
    })
    backLayers.push({
      id: 'back-milestone-text-1',
      type: 'TEXT',
      x: 62,
      y: 456,
      width: 498,
      height: 24,
      text: milestone1,
      fontSize: 12.5,
      fontRole: 'mono',
      fill: '#F1F5F9',
    })
    backLayers.push({
      id: 'back-milestone-bullet-2',
      type: 'RECTANGLE',
      x: 44,
      y: 494,
      width: 8,
      height: 8,
      fill: '#F472B6',
    })
    backLayers.push({
      id: 'back-milestone-text-2',
      type: 'TEXT',
      x: 62,
      y: 488,
      width: 498,
      height: 24,
      text: milestone2,
      fontSize: 12.5,
      fontRole: 'mono',
      fill: '#F1F5F9',
    })
    // Combat Matrix Triad
    backLayers.push({
      id: 'back-stats-label',
      type: 'TEXT',
      x: 40,
      y: 532,
      width: 520,
      height: 18,
      text: 'TACTICAL COMBAT MATRIX',
      fontSize: 10,
      fontRole: 'mono',
      fill: '#22D3EE',
      allCaps: true,
      letterSpacing: 1.5,
    })
    backLayers.push({
      id: 'back-stat-card-1',
      type: 'RECTANGLE',
      x: 40,
      y: 556,
      width: 160,
      height: 84,
      fill: '#0E172A',
      borderColor: '#06B6D4',
      borderWidth: 1.5,
      borderRadius: 6,
    })
    backLayers.push({
      id: 'back-stat-card-1-label',
      type: 'TEXT',
      x: 50,
      y: 566,
      width: 140,
      height: 16,
      text: 'SYS // OVERCHARGE',
      fontSize: 9,
      fontRole: 'mono',
      fill: '#38BDF8',
      allCaps: true,
      textAlign: 'center',
    })
    backLayers.push({
      id: 'back-stat-card-1-val',
      type: 'TEXT',
      x: 50,
      y: 590,
      width: 140,
      height: 36,
      text: metricValue,
      fontSize: 23,
      fontRole: 'mono',
      fill: '#22D3EE',
      textAlign: 'center',
    })
    backLayers.push({
      id: 'back-stat-card-2',
      type: 'RECTANGLE',
      x: 220,
      y: 556,
      width: 160,
      height: 84,
      fill: '#0E172A',
      borderColor: '#8B5CF6',
      borderWidth: 1.5,
      borderRadius: 6,
    })
    backLayers.push({
      id: 'back-stat-card-2-label',
      type: 'TEXT',
      x: 230,
      y: 566,
      width: 140,
      height: 16,
      text: 'DEF // SHIELD',
      fontSize: 9,
      fontRole: 'mono',
      fill: '#A78BFA',
      allCaps: true,
      textAlign: 'center',
    })
    backLayers.push({
      id: 'back-stat-card-2-val',
      type: 'TEXT',
      x: 230,
      y: 590,
      width: 140,
      height: 36,
      text: '98.2',
      fontSize: 23,
      fontRole: 'mono',
      fill: '#C084FC',
      textAlign: 'center',
    })
    backLayers.push({
      id: 'back-stat-card-3',
      type: 'RECTANGLE',
      x: 400,
      y: 556,
      width: 160,
      height: 84,
      fill: '#0E172A',
      borderColor: '#F472B6',
      borderWidth: 1.5,
      borderRadius: 6,
    })
    backLayers.push({
      id: 'back-stat-card-3-label',
      type: 'TEXT',
      x: 410,
      y: 566,
      width: 140,
      height: 16,
      text: 'SPD // AGILITY',
      fontSize: 9,
      fontRole: 'mono',
      fill: '#F472B6',
      allCaps: true,
      textAlign: 'center',
    })
    backLayers.push({
      id: 'back-stat-card-3-val',
      type: 'TEXT',
      x: 410,
      y: 590,
      width: 140,
      height: 36,
      text: '97.8',
      fontSize: 23,
      fontRole: 'mono',
      fill: '#F472B6',
      textAlign: 'center',
    })
    // Footer Colophon with Encrypted Hash
    backLayers.push({
      id: 'back-divider-2',
      type: 'RECTANGLE',
      x: 40,
      y: 664,
      width: 520,
      height: 1.5,
      fill: '#06B6D4',
    })
    backLayers.push({
      id: 'back-footer-edition',
      type: 'TEXT',
      x: 40,
      y: 678,
      width: 520,
      height: 18,
      text: 'SECRET ART RARE · TCG EXPANSION EDITION 094/167 · VERIFIED HOLO',
      fontSize: 10,
      fontRole: 'mono',
      fill: '#38BDF8',
      allCaps: true,
      letterSpacing: 1.2,
      textAlign: 'center',
    })
    backLayers.push({
      id: 'back-footer-barcode',
      type: 'RECTANGLE',
      x: 40,
      y: 708,
      width: 240,
      height: 28,
      fill: '#0E172A',
      borderColor: '#06B6D4',
      borderWidth: 1,
      borderRadius: 4,
    })
    backLayers.push({
      id: 'back-footer-security-code',
      type: 'TEXT',
      x: 48,
      y: 715,
      width: 224,
      height: 14,
      text: 'HASH: 0x77F2A...SAR094',
      fontSize: 9.5,
      fontRole: 'mono',
      fill: '#22D3EE',
      allCaps: true,
    })
    backLayers.push({
      id: 'back-footer-seal',
      type: 'RECTANGLE',
      x: 460,
      y: 702,
      width: 100,
      height: 40,
      fill: '#F59E0B',
      borderRadius: 6,
    })
    backLayers.push({
      id: 'back-footer-seal-text',
      type: 'TEXT',
      x: 464,
      y: 714,
      width: 92,
      height: 20,
      text: '★★★ SAR',
      fontSize: 13,
      fontRole: 'display',
      fill: '#000000',
      allCaps: true,
      textAlign: 'center',
    })
  } else if (designId === 'museum-archive') {
    // ---------------------------------------------------------------------------
    // 3. MUSEUM ARCHIVE (Victorian Royal Society / Ada Lovelace Archival Folio Back)
    // ---------------------------------------------------------------------------
    backLayers.push({
      id: 'back-base-card-bg',
      type: 'RECTANGLE',
      x: 0,
      y: 0,
      width: 600,
      height: 900,
      fill: '#12100E',
    })
    // Victorian Engraved Dual Bronze Rim
    backLayers.push({
      id: 'back-dec-outer-frame',
      type: 'RECTANGLE',
      x: 18,
      y: 18,
      width: 564,
      height: 864,
      fill: 'transparent',
      borderColor: '#CA8A04',
      borderWidth: 2.5,
      borderRadius: 14,
    })
    backLayers.push({
      id: 'back-dec-inner-mat',
      type: 'RECTANGLE',
      x: 24,
      y: 24,
      width: 552,
      height: 852,
      fill: 'transparent',
      borderColor: '#78350F',
      borderWidth: 1,
      borderRadius: 10,
    })
    // Archival Registry Header
    backLayers.push({
      id: 'back-header-plate',
      type: 'RECTANGLE',
      x: 44,
      y: 42,
      width: 512,
      height: 36,
      fill: '#1C1814',
      borderColor: '#CA8A04',
      borderWidth: 1,
      borderRadius: 4,
    })
    backLayers.push({
      id: 'back-header-text',
      type: 'TEXT',
      x: 54,
      y: 52,
      width: 492,
      height: 18,
      text: 'THE ROYAL SOCIETY OF LONDON · ARCHIVAL MANUSCRIPT REGISTER · MS. LXXIV',
      fontSize: 8.5,
      fontRole: 'serif',
      fill: '#FDE68A',
      allCaps: true,
      letterSpacing: 0.8,
      textAlign: 'center',
    })
    // Calligraphic Name in Antique Bronze
    backLayers.push({
      id: 'back-subject-name',
      type: 'TEXT',
      x: 44,
      y: 96,
      width: 512,
      height: 42,
      text: subjectName,
      fontSize: 27,
      fontRole: 'serif',
      fill: '#F5F5F4',
      allCaps: true,
      textAlign: 'center',
      letterSpacing: 2.5,
    })
    backLayers.push({
      id: 'back-subject-role',
      type: 'TEXT',
      x: 44,
      y: 142,
      width: 512,
      height: 22,
      text: subjectRole,
      fontSize: 12,
      fontRole: 'serif',
      fill: '#CA8A04',
      allCaps: true,
      textAlign: 'center',
      letterSpacing: 2,
    })
    backLayers.push({
      id: 'back-divider-1',
      type: 'RECTANGLE',
      x: 170,
      y: 172,
      width: 260,
      height: 2,
      fill: '#CA8A04',
    })
    // Archival Manuscript Chamber
    backLayers.push({
      id: 'back-story-box',
      type: 'RECTANGLE',
      x: 44,
      y: 194,
      width: 512,
      height: 236,
      fill: '#1A1612',
      borderColor: '#CA8A04',
      borderWidth: 1,
      borderRadius: 6,
    })
    backLayers.push({
      id: 'back-story-label',
      type: 'TEXT',
      x: 60,
      y: 208,
      width: 480,
      height: 18,
      text: 'SCIENTIFIC TREATISE & BIOGRAPHICAL MEMOIR',
      fontSize: 9.5,
      fontRole: 'serif',
      fill: '#CA8A04',
      allCaps: true,
      letterSpacing: 1.5,
    })
    backLayers.push({
      id: 'back-story-text',
      type: 'TEXT',
      x: 60,
      y: 234,
      width: 480,
      height: 180,
      text: storyText,
      fontSize: 13.5,
      fontRole: 'serif',
      fill: '#E7E5E4',
    })
    // Archival Honors
    backLayers.push({
      id: 'back-milestones-label',
      type: 'TEXT',
      x: 44,
      y: 450,
      width: 512,
      height: 18,
      text: 'FOUNDATIONAL SCIENTIFIC MILESTONES',
      fontSize: 9.5,
      fontRole: 'serif',
      fill: '#CA8A04',
      allCaps: true,
      letterSpacing: 1.5,
    })
    backLayers.push({
      id: 'back-milestone-bullet-1',
      type: 'RECTANGLE',
      x: 46,
      y: 476,
      width: 8,
      height: 8,
      fill: '#CA8A04',
      borderRadius: 4,
    })
    backLayers.push({
      id: 'back-milestone-text-1',
      type: 'TEXT',
      x: 64,
      y: 472,
      width: 492,
      height: 24,
      text: milestone1,
      fontSize: 13,
      fontRole: 'serif',
      fill: '#FDE68A',
    })
    backLayers.push({
      id: 'back-milestone-bullet-2',
      type: 'RECTANGLE',
      x: 46,
      y: 508,
      width: 8,
      height: 8,
      fill: '#CA8A04',
      borderRadius: 4,
    })
    backLayers.push({
      id: 'back-milestone-text-2',
      type: 'TEXT',
      x: 64,
      y: 504,
      width: 492,
      height: 24,
      text: milestone2,
      fontSize: 13,
      fontRole: 'serif',
      fill: '#FDE68A',
    })
    // Dual Archival Metrics
    backLayers.push({
      id: 'back-stats-label',
      type: 'TEXT',
      x: 44,
      y: 546,
      width: 512,
      height: 18,
      text: 'ARCHIVAL CLASSIFICATION',
      fontSize: 9.5,
      fontRole: 'serif',
      fill: '#CA8A04',
      allCaps: true,
      letterSpacing: 1.5,
    })
    backLayers.push({
      id: 'back-stat-card-1',
      type: 'RECTANGLE',
      x: 44,
      y: 570,
      width: 160,
      height: 80,
      fill: '#1C1814',
      borderColor: '#CA8A04',
      borderWidth: 1,
      borderRadius: 6,
    })
    backLayers.push({
      id: 'back-stat-card-1-label',
      type: 'TEXT',
      x: 54,
      y: 580,
      width: 140,
      height: 16,
      text: 'IMPACT SCORE',
      fontSize: 9,
      fontRole: 'mono',
      fill: '#FDE68A',
      allCaps: true,
      textAlign: 'center',
    })
    backLayers.push({
      id: 'back-stat-card-1-val',
      type: 'TEXT',
      x: 54,
      y: 602,
      width: 140,
      height: 36,
      text: metricValue,
      fontSize: 22,
      fontRole: 'serif',
      fill: '#CA8A04',
      textAlign: 'center',
    })
    backLayers.push({
      id: 'back-stat-card-2',
      type: 'RECTANGLE',
      x: 220,
      y: 570,
      width: 160,
      height: 80,
      fill: '#1C1814',
      borderColor: '#CA8A04',
      borderWidth: 1,
      borderRadius: 6,
    })
    backLayers.push({
      id: 'back-stat-card-2-label',
      type: 'TEXT',
      x: 230,
      y: 580,
      width: 140,
      height: 16,
      text: 'MANUSCRIPT FOLIO',
      fontSize: 9,
      fontRole: 'mono',
      fill: '#FDE68A',
      allCaps: true,
      textAlign: 'center',
    })
    backLayers.push({
      id: 'back-stat-card-2-val',
      type: 'TEXT',
      x: 230,
      y: 604,
      width: 140,
      height: 36,
      text: 'VOL. LXXIV',
      fontSize: 16,
      fontRole: 'serif',
      fill: '#F5F5F4',
      textAlign: 'center',
      allCaps: true,
    })
    backLayers.push({
      id: 'back-stat-card-3',
      type: 'RECTANGLE',
      x: 396,
      y: 570,
      width: 160,
      height: 80,
      fill: '#1C1814',
      borderColor: '#CA8A04',
      borderWidth: 1,
      borderRadius: 6,
    })
    backLayers.push({
      id: 'back-stat-card-3-label',
      type: 'TEXT',
      x: 406,
      y: 580,
      width: 140,
      height: 16,
      text: 'ARCHIVE CLASS',
      fontSize: 9,
      fontRole: 'mono',
      fill: '#FDE68A',
      allCaps: true,
      textAlign: 'center',
    })
    backLayers.push({
      id: 'back-stat-card-3-val',
      type: 'TEXT',
      x: 406,
      y: 604,
      width: 140,
      height: 36,
      text: 'HISTORIC HERITAGE',
      fontSize: 12,
      fontRole: 'serif',
      fill: '#CA8A04',
      textAlign: 'center',
      allCaps: true,
    })
    // Footer Archival Seal
    backLayers.push({
      id: 'back-divider-2',
      type: 'RECTANGLE',
      x: 44,
      y: 672,
      width: 512,
      height: 1.5,
      fill: '#78350F',
    })
    backLayers.push({
      id: 'back-footer-edition',
      type: 'TEXT',
      x: 44,
      y: 686,
      width: 512,
      height: 18,
      text: 'HISTORIC ARCHIVE ISSUE · EDITION 1843 · PRESERVED IN ROYAL SOCIETY ARCHIVES',
      fontSize: 9.5,
      fontRole: 'serif',
      fill: '#CA8A04',
      allCaps: true,
      letterSpacing: 1.5,
      textAlign: 'center',
    })
    backLayers.push({
      id: 'back-footer-barcode',
      type: 'RECTANGLE',
      x: 44,
      y: 714,
      width: 220,
      height: 28,
      fill: '#1C1814',
      borderColor: '#78350F',
      borderWidth: 1,
      borderRadius: 4,
    })
    backLayers.push({
      id: 'back-footer-security-code',
      type: 'TEXT',
      x: 52,
      y: 721,
      width: 204,
      height: 14,
      text: 'REGISTRY: RS-1843-NOTE-G',
      fontSize: 9,
      fontRole: 'mono',
      fill: '#FDE68A',
      allCaps: true,
    })
    backLayers.push({
      id: 'back-footer-seal',
      type: 'RECTANGLE',
      x: 466,
      y: 708,
      width: 90,
      height: 40,
      fill: '#CA8A04',
      borderRadius: 6,
    })
    backLayers.push({
      id: 'back-footer-seal-text',
      type: 'TEXT',
      x: 470,
      y: 719,
      width: 82,
      height: 20,
      text: 'ARCHIVE',
      fontSize: 12,
      fontRole: 'serif',
      fill: '#000000',
      allCaps: true,
      textAlign: 'center',
    })
  } else if (designId === 'arcade-legends') {
    // ---------------------------------------------------------------------------
    // 4. ARCADE LEGENDS (1980s CRT Cabinet Leaderboard & High Score Record Back)
    // ---------------------------------------------------------------------------
    backLayers.push({
      id: 'back-base-card-bg',
      type: 'RECTANGLE',
      x: 0,
      y: 0,
      width: 600,
      height: 900,
      fill: '#06070B',
    })
    // Glowing 8-bit Neon CRT Bezel
    backLayers.push({
      id: 'back-dec-outer-frame',
      type: 'RECTANGLE',
      x: 16,
      y: 16,
      width: 568,
      height: 868,
      fill: 'transparent',
      borderColor: '#10B981',
      borderWidth: 3,
      borderRadius: 8,
    })
    backLayers.push({
      id: 'back-dec-inner-mat',
      type: 'RECTANGLE',
      x: 22,
      y: 22,
      width: 556,
      height: 856,
      fill: 'transparent',
      borderColor: '#F59E0B',
      borderWidth: 1.5,
      borderRadius: 4,
    })
    // 8-bit Marquee Header
    backLayers.push({
      id: 'back-header-plate',
      type: 'RECTANGLE',
      x: 40,
      y: 38,
      width: 520,
      height: 36,
      fill: '#022C22',
      borderColor: '#10B981',
      borderWidth: 1.5,
      borderRadius: 4,
    })
    backLayers.push({
      id: 'back-header-text',
      type: 'TEXT',
      x: 50,
      y: 48,
      width: 500,
      height: 18,
      text: '== TWIN GALAXIES OFFICIAL ARCADE LEADERBOARD ==',
      fontSize: 10.5,
      fontRole: 'mono',
      fill: '#34D399',
      allCaps: true,
      letterSpacing: 2,
      textAlign: 'center',
    })
    // Subject in Bright Amber Pixel Font
    backLayers.push({
      id: 'back-subject-name',
      type: 'TEXT',
      x: 40,
      y: 92,
      width: 520,
      height: 42,
      text: subjectName,
      fontSize: 28,
      fontRole: 'mono',
      fill: '#F59E0B',
      allCaps: true,
      textAlign: 'center',
      letterSpacing: 3,
    })
    backLayers.push({
      id: 'back-subject-role',
      type: 'TEXT',
      x: 40,
      y: 138,
      width: 520,
      height: 22,
      text: `TITLE: ${subjectRole}`,
      fontSize: 12,
      fontRole: 'mono',
      fill: '#10B981',
      allCaps: true,
      textAlign: 'center',
      letterSpacing: 2,
    })
    backLayers.push({
      id: 'back-divider-1',
      type: 'RECTANGLE',
      x: 40,
      y: 168,
      width: 520,
      height: 2,
      fill: '#10B981',
    })
    // Phosphor Green CRT Monitor Box
    backLayers.push({
      id: 'back-story-box',
      type: 'RECTANGLE',
      x: 40,
      y: 190,
      width: 520,
      height: 232,
      fill: '#041F16',
      borderColor: '#10B981',
      borderWidth: 1.5,
      borderRadius: 6,
    })
    backLayers.push({
      id: 'back-story-label',
      type: 'TEXT',
      x: 56,
      y: 204,
      width: 488,
      height: 18,
      text: '1UP HIGH SCORE RECORD & GAMEPLAY LOG',
      fontSize: 10,
      fontRole: 'mono',
      fill: '#34D399',
      allCaps: true,
      letterSpacing: 1.5,
    })
    backLayers.push({
      id: 'back-story-text',
      type: 'TEXT',
      x: 56,
      y: 230,
      width: 488,
      height: 176,
      text: storyText,
      fontSize: 13.5,
      fontRole: 'mono',
      fill: '#A7F3D0',
    })
    // Milestones with Coin Tokens
    backLayers.push({
      id: 'back-milestones-label',
      type: 'TEXT',
      x: 40,
      y: 442,
      width: 520,
      height: 18,
      text: 'OFFICIAL WORLD RECORDS & STAGES CLEARED',
      fontSize: 10,
      fontRole: 'mono',
      fill: '#F59E0B',
      allCaps: true,
      letterSpacing: 1.5,
    })
    backLayers.push({
      id: 'back-milestone-bullet-1',
      type: 'RECTANGLE',
      x: 44,
      y: 470,
      width: 8,
      height: 8,
      fill: '#F59E0B',
    })
    backLayers.push({
      id: 'back-milestone-text-1',
      type: 'TEXT',
      x: 62,
      y: 464,
      width: 498,
      height: 24,
      text: milestone1,
      fontSize: 12.5,
      fontRole: 'mono',
      fill: '#FDE68A',
    })
    backLayers.push({
      id: 'back-milestone-bullet-2',
      type: 'RECTANGLE',
      x: 44,
      y: 502,
      width: 8,
      height: 8,
      fill: '#10B981',
    })
    backLayers.push({
      id: 'back-milestone-text-2',
      type: 'TEXT',
      x: 62,
      y: 496,
      width: 498,
      height: 24,
      text: milestone2,
      fontSize: 12.5,
      fontRole: 'mono',
      fill: '#A7F3D0',
    })
    // 8-bit Top 3 High Score Boxes
    backLayers.push({
      id: 'back-stats-label',
      type: 'TEXT',
      x: 40,
      y: 540,
      width: 520,
      height: 18,
      text: 'LEADERBOARD HALL OF FAME',
      fontSize: 10,
      fontRole: 'mono',
      fill: '#10B981',
      allCaps: true,
      letterSpacing: 1.5,
    })
    backLayers.push({
      id: 'back-stat-card-1',
      type: 'RECTANGLE',
      x: 40,
      y: 564,
      width: 160,
      height: 82,
      fill: '#022C22',
      borderColor: '#10B981',
      borderWidth: 1.5,
      borderRadius: 6,
    })
    backLayers.push({
      id: 'back-stat-card-1-label',
      type: 'TEXT',
      x: 50,
      y: 574,
      width: 140,
      height: 16,
      text: 'HIGH SCORE',
      fontSize: 9.5,
      fontRole: 'mono',
      fill: '#34D399',
      allCaps: true,
      textAlign: 'center',
    })
    backLayers.push({
      id: 'back-stat-card-1-val',
      type: 'TEXT',
      x: 50,
      y: 596,
      width: 140,
      height: 36,
      text: metricValue,
      fontSize: 22,
      fontRole: 'mono',
      fill: '#F59E0B',
      textAlign: 'center',
    })
    backLayers.push({
      id: 'back-stat-card-2',
      type: 'RECTANGLE',
      x: 220,
      y: 564,
      width: 160,
      height: 82,
      fill: '#022C22',
      borderColor: '#10B981',
      borderWidth: 1.5,
      borderRadius: 6,
    })
    backLayers.push({
      id: 'back-stat-card-2-label',
      type: 'TEXT',
      x: 230,
      y: 574,
      width: 140,
      height: 16,
      text: 'GLOBAL RANK',
      fontSize: 9.5,
      fontRole: 'mono',
      fill: '#34D399',
      allCaps: true,
      textAlign: 'center',
    })
    backLayers.push({
      id: 'back-stat-card-2-val',
      type: 'TEXT',
      x: 230,
      y: 596,
      width: 140,
      height: 36,
      text: 'RANK #1',
      fontSize: 18,
      fontRole: 'mono',
      fill: '#10B981',
      textAlign: 'center',
      allCaps: true,
    })
    backLayers.push({
      id: 'back-stat-card-3',
      type: 'RECTANGLE',
      x: 400,
      y: 564,
      width: 160,
      height: 82,
      fill: '#022C22',
      borderColor: '#10B981',
      borderWidth: 1.5,
      borderRadius: 6,
    })
    backLayers.push({
      id: 'back-stat-card-3-label',
      type: 'TEXT',
      x: 410,
      y: 574,
      width: 140,
      height: 16,
      text: 'PAC-MAN RUN',
      fontSize: 9.5,
      fontRole: 'mono',
      fill: '#34D399',
      allCaps: true,
      textAlign: 'center',
    })
    backLayers.push({
      id: 'back-stat-card-3-val',
      type: 'TEXT',
      x: 410,
      y: 596,
      width: 140,
      height: 36,
      text: 'PERFECT',
      fontSize: 16,
      fontRole: 'mono',
      fill: '#F59E0B',
      textAlign: 'center',
      allCaps: true,
    })
    // Footer Colophon with Coin Imprint
    backLayers.push({
      id: 'back-divider-2',
      type: 'RECTANGLE',
      x: 40,
      y: 668,
      width: 520,
      height: 1.5,
      fill: '#10B981',
    })
    backLayers.push({
      id: 'back-footer-edition',
      type: 'TEXT',
      x: 40,
      y: 682,
      width: 520,
      height: 18,
      text: 'INSERT COIN TO PLAY · TWIN GALAXIES VERIFIED ARCHIVE · DIP SWITCH 01-B ON',
      fontSize: 9.5,
      fontRole: 'mono',
      fill: '#34D399',
      allCaps: true,
      letterSpacing: 1.5,
      textAlign: 'center',
    })
    backLayers.push({
      id: 'back-footer-barcode',
      type: 'RECTANGLE',
      x: 40,
      y: 712,
      width: 220,
      height: 28,
      fill: '#022C22',
      borderColor: '#10B981',
      borderWidth: 1,
      borderRadius: 4,
    })
    backLayers.push({
      id: 'back-footer-security-code',
      type: 'TEXT',
      x: 48,
      y: 719,
      width: 204,
      height: 14,
      text: 'ARCADE-TG-1982-PAC',
      fontSize: 9,
      fontRole: 'mono',
      fill: '#F59E0B',
      allCaps: true,
    })
    backLayers.push({
      id: 'back-footer-seal',
      type: 'RECTANGLE',
      x: 460,
      y: 706,
      width: 100,
      height: 40,
      fill: '#10B981',
      borderRadius: 6,
    })
    backLayers.push({
      id: 'back-footer-seal-text',
      type: 'TEXT',
      x: 464,
      y: 718,
      width: 92,
      height: 20,
      text: '1UP RECORD',
      fontSize: 12,
      fontRole: 'mono',
      fill: '#000000',
      allCaps: true,
      textAlign: 'center',
    })
  } else if (designId === 'modern-editorial') {
    // ---------------------------------------------------------------------------
    // 5. MODERN EDITORIAL (Swiss Broadsheet Monograph / Zaha Hadid Back)
    // ---------------------------------------------------------------------------
    backLayers.push({
      id: 'back-base-card-bg',
      type: 'RECTANGLE',
      x: 0,
      y: 0,
      width: 600,
      height: 900,
      fill: '#080808',
    })
    // Minimalist Swiss Grid Frame with Crimson Accent
    backLayers.push({
      id: 'back-dec-outer-frame',
      type: 'RECTANGLE',
      x: 16,
      y: 16,
      width: 568,
      height: 868,
      fill: 'transparent',
      borderColor: '#262626',
      borderWidth: 1.5,
    })
    backLayers.push({
      id: 'back-dec-inner-mat',
      type: 'RECTANGLE',
      x: 24,
      y: 24,
      width: 552,
      height: 852,
      fill: 'transparent',
      borderColor: '#EF4444',
      borderWidth: 0.8,
    })
    // Top Monograph Colophon
    backLayers.push({
      id: 'back-header-plate',
      type: 'RECTANGLE',
      x: 40,
      y: 38,
      width: 520,
      height: 32,
      fill: '#141414',
    })
    backLayers.push({
      id: 'back-header-text',
      type: 'TEXT',
      x: 50,
      y: 47,
      width: 500,
      height: 18,
      text: 'ARCHITECTURAL MONOGRAPH NO. 14 · SWISS EDITION · INDEX 2004',
      fontSize: 10,
      fontRole: 'sans',
      fill: '#EF4444',
      allCaps: true,
      letterSpacing: 2,
    })
    // Monumental Grotesk Subject Name
    backLayers.push({
      id: 'back-subject-name',
      type: 'TEXT',
      x: 40,
      y: 88,
      width: 520,
      height: 44,
      text: subjectName,
      fontSize: 29,
      fontRole: 'sans',
      fill: '#FFFFFF',
      allCaps: true,
      letterSpacing: -0.5,
    })
    backLayers.push({
      id: 'back-subject-role',
      type: 'TEXT',
      x: 40,
      y: 136,
      width: 520,
      height: 22,
      text: subjectRole,
      fontSize: 13,
      fontRole: 'sans',
      fill: '#A3A3A3',
      allCaps: true,
      letterSpacing: 1,
    })
    backLayers.push({
      id: 'back-divider-1',
      type: 'RECTANGLE',
      x: 40,
      y: 166,
      width: 520,
      height: 2,
      fill: '#EF4444',
    })
    // Monograph Architectural Essay
    backLayers.push({
      id: 'back-story-box',
      type: 'RECTANGLE',
      x: 40,
      y: 188,
      width: 520,
      height: 236,
      fill: '#121212',
    })
    backLayers.push({
      id: 'back-story-label',
      type: 'TEXT',
      x: 56,
      y: 202,
      width: 488,
      height: 18,
      text: 'CRITICAL MONOGRAPH & ARCHITECTURAL DISCOURSE',
      fontSize: 9.5,
      fontRole: 'sans',
      fill: '#EF4444',
      allCaps: true,
      letterSpacing: 1.5,
    })
    backLayers.push({
      id: 'back-story-text',
      type: 'TEXT',
      x: 56,
      y: 228,
      width: 488,
      height: 180,
      text: storyText,
      fontSize: 14,
      fontRole: 'sans',
      fill: '#E5E5E5',
    })
    // Section Milestones with Asymmetric Numerals
    backLayers.push({
      id: 'back-milestones-label',
      type: 'TEXT',
      x: 40,
      y: 444,
      width: 520,
      height: 18,
      text: 'MASTERWORK COMMISSIONS & HONORS',
      fontSize: 9.5,
      fontRole: 'sans',
      fill: '#EF4444',
      allCaps: true,
      letterSpacing: 1.5,
    })
    backLayers.push({
      id: 'back-milestone-bullet-1',
      type: 'RECTANGLE',
      x: 44,
      y: 472,
      width: 8,
      height: 8,
      fill: '#EF4444',
    })
    backLayers.push({
      id: 'back-milestone-text-1',
      type: 'TEXT',
      x: 62,
      y: 466,
      width: 498,
      height: 24,
      text: milestone1,
      fontSize: 13,
      fontRole: 'sans',
      fill: '#FFFFFF',
    })
    backLayers.push({
      id: 'back-milestone-bullet-2',
      type: 'RECTANGLE',
      x: 44,
      y: 504,
      width: 8,
      height: 8,
      fill: '#EF4444',
    })
    backLayers.push({
      id: 'back-milestone-text-2',
      type: 'TEXT',
      x: 62,
      y: 498,
      width: 498,
      height: 24,
      text: milestone2,
      fontSize: 13,
      fontRole: 'sans',
      fill: '#FFFFFF',
    })
    // Architectural Index Numbers
    backLayers.push({
      id: 'back-stats-label',
      type: 'TEXT',
      x: 40,
      y: 542,
      width: 520,
      height: 18,
      text: 'ARCHITECTURAL INDEX DATA',
      fontSize: 9.5,
      fontRole: 'sans',
      fill: '#EF4444',
      allCaps: true,
      letterSpacing: 1.5,
    })
    backLayers.push({
      id: 'back-stat-card-1',
      type: 'RECTANGLE',
      x: 40,
      y: 566,
      width: 160,
      height: 80,
      fill: '#141414',
      borderColor: '#262626',
      borderWidth: 1,
    })
    backLayers.push({
      id: 'back-stat-card-1-label',
      type: 'TEXT',
      x: 50,
      y: 576,
      width: 140,
      height: 16,
      text: 'MONOGRAPH INDEX',
      fontSize: 9,
      fontRole: 'mono',
      fill: '#A3A3A3',
      allCaps: true,
    })
    backLayers.push({
      id: 'back-stat-card-1-val',
      type: 'TEXT',
      x: 50,
      y: 598,
      width: 140,
      height: 36,
      text: metricValue,
      fontSize: 22,
      fontRole: 'sans',
      fill: '#EF4444',
    })
    backLayers.push({
      id: 'back-stat-card-2',
      type: 'RECTANGLE',
      x: 220,
      y: 566,
      width: 160,
      height: 80,
      fill: '#141414',
      borderColor: '#262626',
      borderWidth: 1,
    })
    backLayers.push({
      id: 'back-stat-card-2-label',
      type: 'TEXT',
      x: 230,
      y: 576,
      width: 140,
      height: 16,
      text: 'ACCREDITATION',
      fontSize: 9,
      fontRole: 'mono',
      fill: '#A3A3A3',
      allCaps: true,
    })
    backLayers.push({
      id: 'back-stat-card-2-val',
      type: 'TEXT',
      x: 230,
      y: 598,
      width: 140,
      height: 36,
      text: 'PRITZKER 04',
      fontSize: 16,
      fontRole: 'sans',
      fill: '#FFFFFF',
      allCaps: true,
    })
    backLayers.push({
      id: 'back-stat-card-3',
      type: 'RECTANGLE',
      x: 400,
      y: 566,
      width: 160,
      height: 80,
      fill: '#141414',
      borderColor: '#262626',
      borderWidth: 1,
    })
    backLayers.push({
      id: 'back-stat-card-3-label',
      type: 'TEXT',
      x: 410,
      y: 576,
      width: 140,
      height: 16,
      text: 'PROJECTS TOTAL',
      fontSize: 9,
      fontRole: 'mono',
      fill: '#A3A3A3',
      allCaps: true,
    })
    backLayers.push({
      id: 'back-stat-card-3-val',
      type: 'TEXT',
      x: 410,
      y: 598,
      width: 140,
      height: 36,
      text: '950+',
      fontSize: 20,
      fontRole: 'sans',
      fill: '#FFFFFF',
    })
    // Footer Helvetica Monograph Colophon
    backLayers.push({
      id: 'back-divider-2',
      type: 'RECTANGLE',
      x: 40,
      y: 670,
      width: 520,
      height: 1,
      fill: '#262626',
    })
    backLayers.push({
      id: 'back-footer-edition',
      type: 'TEXT',
      x: 40,
      y: 684,
      width: 520,
      height: 18,
      text: 'SWISS MONOGRAPH SERIES · BASEL ARCHIVE · INTERNATIONAL TYPOGRAPHIC ISSUE',
      fontSize: 9.5,
      fontRole: 'sans',
      fill: '#A3A3A3',
      allCaps: true,
      letterSpacing: 1.2,
    })
    backLayers.push({
      id: 'back-footer-barcode',
      type: 'RECTANGLE',
      x: 40,
      y: 712,
      width: 220,
      height: 28,
      fill: '#141414',
    })
    backLayers.push({
      id: 'back-footer-security-code',
      type: 'TEXT',
      x: 48,
      y: 719,
      width: 204,
      height: 14,
      text: 'ISBN: 978-3-16-148410-0',
      fontSize: 9.5,
      fontRole: 'mono',
      fill: '#EF4444',
      allCaps: true,
    })
    backLayers.push({
      id: 'back-footer-seal',
      type: 'RECTANGLE',
      x: 460,
      y: 706,
      width: 100,
      height: 40,
      fill: '#EF4444',
    })
    backLayers.push({
      id: 'back-footer-seal-text',
      type: 'TEXT',
      x: 464,
      y: 718,
      width: 92,
      height: 20,
      text: 'SWISS',
      fontSize: 13,
      fontRole: 'sans',
      fill: '#FFFFFF',
      allCaps: true,
      textAlign: 'center',
    })
  } else if (designId === 'psychedelic-archive') {
    // ---------------------------------------------------------------------------
    // 6. PSYCHEDELIC ARCHIVE (1968 Fillmore Concert Poster / Jimi Hendrix Back)
    // ---------------------------------------------------------------------------
    backLayers.push({
      id: 'back-base-card-bg',
      type: 'RECTANGLE',
      x: 0,
      y: 0,
      width: 600,
      height: 900,
      fill: '#15061F',
    })
    // Sinuous Liquid Amber & Magenta Organic Border
    backLayers.push({
      id: 'back-dec-outer-frame',
      type: 'RECTANGLE',
      x: 16,
      y: 16,
      width: 568,
      height: 868,
      fill: 'transparent',
      borderColor: '#F59E0B',
      borderWidth: 3,
      borderRadius: 22,
    })
    backLayers.push({
      id: 'back-dec-inner-mat',
      type: 'RECTANGLE',
      x: 24,
      y: 24,
      width: 552,
      height: 852,
      fill: 'transparent',
      borderColor: '#EC4899',
      borderWidth: 1.5,
      borderRadius: 16,
    })
    // Bill Graham Presents Fillmore Header
    backLayers.push({
      id: 'back-header-plate',
      type: 'RECTANGLE',
      x: 40,
      y: 40,
      width: 520,
      height: 36,
      fill: '#240B36',
      borderColor: '#F59E0B',
      borderWidth: 1.5,
      borderRadius: 10,
    })
    backLayers.push({
      id: 'back-header-text',
      type: 'TEXT',
      x: 50,
      y: 50,
      width: 500,
      height: 18,
      text: 'BILL GRAHAM PRESENTS · FILLMORE WEST CONCERT ARCHIVE · SAN FRANCISCO',
      fontSize: 9.5,
      fontRole: 'display',
      fill: '#FDE047',
      allCaps: true,
      letterSpacing: 2,
      textAlign: 'center',
    })
    // Flowing Psychedelic Headline
    backLayers.push({
      id: 'back-subject-name',
      type: 'TEXT',
      x: 40,
      y: 92,
      width: 520,
      height: 44,
      text: subjectName,
      fontSize: 28,
      fontRole: 'display',
      fill: '#F59E0B',
      allCaps: true,
      textAlign: 'center',
      letterSpacing: 3,
    })
    backLayers.push({
      id: 'back-subject-role',
      type: 'TEXT',
      x: 40,
      y: 138,
      width: 520,
      height: 22,
      text: subjectRole,
      fontSize: 12.5,
      fontRole: 'display',
      fill: '#EC4899',
      allCaps: true,
      textAlign: 'center',
      letterSpacing: 2.5,
    })
    backLayers.push({
      id: 'back-divider-1',
      type: 'RECTANGLE',
      x: 160,
      y: 168,
      width: 280,
      height: 2,
      fill: '#F59E0B',
    })
    // Liquid Organic Story Chamber
    backLayers.push({
      id: 'back-story-box',
      type: 'RECTANGLE',
      x: 40,
      y: 190,
      width: 520,
      height: 236,
      fill: '#240B36',
      borderColor: '#EC4899',
      borderWidth: 1.5,
      borderRadius: 12,
    })
    backLayers.push({
      id: 'back-story-label',
      type: 'TEXT',
      x: 56,
      y: 204,
      width: 488,
      height: 18,
      text: 'CONCERT CHRONICLE & PSYCHEDELIC ODYSSEY',
      fontSize: 10,
      fontRole: 'display',
      fill: '#FDE047',
      allCaps: true,
      letterSpacing: 1.5,
    })
    backLayers.push({
      id: 'back-story-text',
      type: 'TEXT',
      x: 56,
      y: 230,
      width: 488,
      height: 180,
      text: storyText,
      fontSize: 13.5,
      fontRole: 'sans',
      fill: '#FCE7F3',
    })
    // Fillmore Milestones
    backLayers.push({
      id: 'back-milestones-label',
      type: 'TEXT',
      x: 40,
      y: 444,
      width: 520,
      height: 18,
      text: 'LEGENDARY SHOWS & RECORDINGS',
      fontSize: 10,
      fontRole: 'display',
      fill: '#F59E0B',
      allCaps: true,
      letterSpacing: 1.5,
    })
    backLayers.push({
      id: 'back-milestone-bullet-1',
      type: 'RECTANGLE',
      x: 44,
      y: 472,
      width: 8,
      height: 8,
      fill: '#F59E0B',
      borderRadius: 4,
    })
    backLayers.push({
      id: 'back-milestone-text-1',
      type: 'TEXT',
      x: 62,
      y: 466,
      width: 498,
      height: 24,
      text: milestone1,
      fontSize: 13,
      fontRole: 'sans',
      fill: '#FEF08A',
    })
    backLayers.push({
      id: 'back-milestone-bullet-2',
      type: 'RECTANGLE',
      x: 44,
      y: 504,
      width: 8,
      height: 8,
      fill: '#EC4899',
      borderRadius: 4,
    })
    backLayers.push({
      id: 'back-milestone-text-2',
      type: 'TEXT',
      x: 62,
      y: 498,
      width: 498,
      height: 24,
      text: milestone2,
      fontSize: 13,
      fontRole: 'sans',
      fill: '#FBCFE8',
    })
    // Psychedelic Show Stats
    backLayers.push({
      id: 'back-stats-label',
      type: 'TEXT',
      x: 40,
      y: 542,
      width: 520,
      height: 18,
      text: 'FILLMORE SOUND SPECS',
      fontSize: 10,
      fontRole: 'display',
      fill: '#FDE047',
      allCaps: true,
      letterSpacing: 1.5,
    })
    backLayers.push({
      id: 'back-stat-card-1',
      type: 'RECTANGLE',
      x: 40,
      y: 566,
      width: 160,
      height: 82,
      fill: '#240B36',
      borderColor: '#F59E0B',
      borderWidth: 1.5,
      borderRadius: 10,
    })
    backLayers.push({
      id: 'back-stat-card-1-label',
      type: 'TEXT',
      x: 50,
      y: 576,
      width: 140,
      height: 16,
      text: 'DECIBEL LEVEL',
      fontSize: 9.5,
      fontRole: 'mono',
      fill: '#FDE047',
      allCaps: true,
      textAlign: 'center',
    })
    backLayers.push({
      id: 'back-stat-card-1-val',
      type: 'TEXT',
      x: 50,
      y: 598,
      width: 140,
      height: 36,
      text: metricValue,
      fontSize: 22,
      fontRole: 'display',
      fill: '#F59E0B',
      textAlign: 'center',
    })
    backLayers.push({
      id: 'back-stat-card-2',
      type: 'RECTANGLE',
      x: 220,
      y: 566,
      width: 160,
      height: 82,
      fill: '#240B36',
      borderColor: '#EC4899',
      borderWidth: 1.5,
      borderRadius: 10,
    })
    backLayers.push({
      id: 'back-stat-card-2-label',
      type: 'TEXT',
      x: 230,
      y: 576,
      width: 140,
      height: 16,
      text: 'HALL OF FAME',
      fontSize: 9.5,
      fontRole: 'mono',
      fill: '#F472B6',
      allCaps: true,
      textAlign: 'center',
    })
    backLayers.push({
      id: 'back-stat-card-2-val',
      type: 'TEXT',
      x: 230,
      y: 598,
      width: 140,
      height: 36,
      text: 'INDUCTED',
      fontSize: 16,
      fontRole: 'display',
      fill: '#EC4899',
      textAlign: 'center',
      allCaps: true,
    })
    backLayers.push({
      id: 'back-stat-card-3',
      type: 'RECTANGLE',
      x: 400,
      y: 566,
      width: 160,
      height: 82,
      fill: '#240B36',
      borderColor: '#F59E0B',
      borderWidth: 1.5,
      borderRadius: 10,
    })
    backLayers.push({
      id: 'back-stat-card-3-label',
      type: 'TEXT',
      x: 410,
      y: 576,
      width: 140,
      height: 16,
      text: 'TRACK RECORD',
      fontSize: 9.5,
      fontRole: 'mono',
      fill: '#FDE047',
      allCaps: true,
      textAlign: 'center',
    })
    backLayers.push({
      id: 'back-stat-card-3-val',
      type: 'TEXT',
      x: 410,
      y: 598,
      width: 140,
      height: 36,
      text: 'ELECTRIC',
      fontSize: 16,
      fontRole: 'display',
      fill: '#F59E0B',
      textAlign: 'center',
      allCaps: true,
    })
    // Footer Colophon with Promoter Seal
    backLayers.push({
      id: 'back-divider-2',
      type: 'RECTANGLE',
      x: 40,
      y: 670,
      width: 520,
      height: 1.5,
      fill: '#F59E0B',
    })
    backLayers.push({
      id: 'back-footer-edition',
      type: 'TEXT',
      x: 40,
      y: 684,
      width: 520,
      height: 18,
      text: 'FILLMORE WEST POSTER SERIES · SAN FRANCISCO 1968 · LICENSED BILL GRAHAM ARCHIVE',
      fontSize: 9.5,
      fontRole: 'display',
      fill: '#FDE047',
      allCaps: true,
      letterSpacing: 1.5,
      textAlign: 'center',
    })
    backLayers.push({
      id: 'back-footer-barcode',
      type: 'RECTANGLE',
      x: 40,
      y: 712,
      width: 220,
      height: 28,
      fill: '#240B36',
      borderColor: '#EC4899',
      borderWidth: 1,
      borderRadius: 4,
    })
    backLayers.push({
      id: 'back-footer-security-code',
      type: 'TEXT',
      x: 48,
      y: 719,
      width: 204,
      height: 14,
      text: 'POSTER: BGP-1968-JH01',
      fontSize: 9,
      fontRole: 'mono',
      fill: '#F59E0B',
      allCaps: true,
    })
    backLayers.push({
      id: 'back-footer-seal',
      type: 'RECTANGLE',
      x: 460,
      y: 706,
      width: 100,
      height: 40,
      fill: '#F59E0B',
      borderRadius: 10,
    })
    backLayers.push({
      id: 'back-footer-seal-text',
      type: 'TEXT',
      x: 464,
      y: 718,
      width: 92,
      height: 20,
      text: 'FILLMORE',
      fontSize: 12,
      fontRole: 'display',
      fill: '#000000',
      allCaps: true,
      textAlign: 'center',
    })
  } else {
    // ---------------------------------------------------------------------------
    // Default / Heritage Fallback Back
    // ---------------------------------------------------------------------------
    backLayers.push({
      id: 'back-base-card-bg',
      type: 'RECTANGLE',
      x: 0,
      y: 0,
      width: 600,
      height: 900,
      fill: palette.background,
    })
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
  }

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
