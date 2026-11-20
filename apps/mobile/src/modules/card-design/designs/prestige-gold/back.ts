import type { CardCompositionLayer } from '../../types/layerSpec'
import type { RenderContext } from '../../types/designContract'
import {
  GRADIENT_24K_GOLD,
  GRADIENT_OBSIDIAN_DEPTH,
  GRADIENT_IVORY_PLAQUE,
} from '../../primitives/gradients'
import {
  SHADOW_RAISED_PLAQUE,
  SHADOW_FRAME_DEPTH,
} from '../../primitives/shadows'
import { PRESTIGE_GOLD_ASSETS } from './assets/ornaments'

export function composePrestigeGoldBack(ctx: RenderContext): CardCompositionLayer[] {
  const name = ctx.content.input1 || ctx.person?.displayName || 'Untitled Subject'
  const bio =
    ctx.content.input3 ||
    ctx.person?.bio ||
    'Renowned for generational mastery and cultural impact, defining an era of artistic excellence.'
  const milestone1 = ctx.content.input4 || 'Hall of Fame Induction · Landmark Achievement'
  const milestone2 = ctx.content.input5 || 'Special Edition Ultra Legacy Archive'
  const ratingOrStat = ctx.content.input6 || 'ARCHIVE 1-OF-1 · MINT 10'

  const layers: CardCompositionLayer[] = [
    // 1. Base Substrate (Obsidian Velvet)
    {
      id: 'back-base-card-bg',
      type: 'RECTANGLE',
      x: 0,
      y: 0,
      width: 600,
      height: 900,
      gradient: GRADIENT_OBSIDIAN_DEPTH,
    },

    // 2. Outer 24k Gold Beveled Border
    {
      id: 'pg-back-outer-frame',
      type: 'RECTANGLE',
      x: 14,
      y: 14,
      width: 572,
      height: 872,
      borderRadius: 22,
      gradient: GRADIENT_24K_GOLD,
      shadow: SHADOW_FRAME_DEPTH,
    },

    // 3. Inner Midnight Mat
    {
      id: 'pg-back-inner-mat',
      type: 'RECTANGLE',
      x: 20,
      y: 20,
      width: 560,
      height: 860,
      borderRadius: 18,
      fill: '#080A10',
    },

    // 4. Gold Hairline Border
    {
      id: 'pg-back-hairline',
      type: 'RECTANGLE',
      x: 26,
      y: 26,
      width: 548,
      height: 848,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: '#D4AF37',
    },

    // 5. Authenticity Seal & Heraldic Crown
    {
      id: 'pg-back-seal-sunburst',
      type: 'SVG',
      x: 276,
      y: 42,
      width: 48,
      height: 48,
      viewBox: '0 0 48 48',
      pathData: PRESTIGE_GOLD_ASSETS.authenticitySeal,
      fill: '#D4AF37',
    },

    // 6. Header Badge
    {
      id: 'back-header-text',
      type: 'TEXT',
      x: 40,
      y: 98,
      width: 520,
      height: 24,
      text: 'CERTIFICATE OF COMMEMORATION · ARCHIVAL RECORD',
      fontSize: 11,
      fill: '#F59E0B',
      fontRole: 'mono',
      allCaps: true,
      bold: true,
      tracking: 1.5,
      textAlign: 'center',
    },

    // 7. Guilloche Divider
    {
      id: 'pg-back-divider-1',
      type: 'SVG',
      x: 140,
      y: 126,
      width: 320,
      height: 16,
      viewBox: '0 0 320 16',
      pathData: PRESTIGE_GOLD_ASSETS.dividerBar,
      stroke: '#D4AF37',
      strokeWidth: 1.5,
    },

    // 8. Subject Name Ribbon Header
    {
      id: 'back-subject-name',
      type: 'TEXT',
      x: 40,
      y: 148,
      width: 520,
      height: 40,
      text: name,
      fontSize: 26,
      fill: '#FEF08A',
      fontRole: 'serif',
      allCaps: true,
      bold: true,
      textAlign: 'center',
    },

    // 9. Narrative Story Plaque (Ivory Ceramic Surface with Bevel)
    {
      id: 'pg-back-story-bevel',
      type: 'RECTANGLE',
      x: 40,
      y: 200,
      width: 520,
      height: 250,
      borderRadius: 14,
      gradient: GRADIENT_24K_GOLD,
      shadow: SHADOW_RAISED_PLAQUE,
    },
    {
      id: 'pg-back-story-ivory',
      type: 'RECTANGLE',
      x: 43,
      y: 203,
      width: 514,
      height: 244,
      borderRadius: 11,
      gradient: GRADIENT_IVORY_PLAQUE,
    },
    {
      id: 'pg-back-story-eyebrow',
      type: 'TEXT',
      x: 60,
      y: 218,
      width: 480,
      height: 20,
      text: 'THE ARCHIVAL CHRONICLE',
      fontSize: 11,
      fill: '#854D0E',
      fontRole: 'mono',
      allCaps: true,
      bold: true,
      tracking: 1.2,
    },
    {
      id: 'back-story-text',
      type: 'TEXT',
      x: 60,
      y: 244,
      width: 480,
      height: 185,
      text: bio,
      fontSize: bio.length > 200 ? 13 : 15,
      fill: '#1E293B',
      fontRole: 'serif',
      lineHeight: 22,
    },

    // 10. Milestone Honors Block
    {
      id: 'pg-back-milestone-panel',
      type: 'RECTANGLE',
      x: 40,
      y: 470,
      width: 520,
      height: 160,
      borderRadius: 12,
      fill: '#12151E',
      borderColor: '#D4AF37',
      borderWidth: 1.5,
    },
    {
      id: 'pg-back-milestone-title',
      type: 'TEXT',
      x: 56,
      y: 486,
      width: 488,
      height: 20,
      text: 'HONORS & HISTORIC CITATIONS',
      fontSize: 11,
      fill: '#D4AF37',
      fontRole: 'mono',
      allCaps: true,
      bold: true,
      tracking: 1.2,
    },
    {
      id: 'back-milestone-text-1',
      type: 'TEXT',
      x: 56,
      y: 516,
      width: 488,
      height: 38,
      text: `★  ${milestone1}`,
      fontSize: 14,
      fill: '#FEF08A',
      fontRole: 'serif',
      bold: true,
    },
    {
      id: 'pg-back-milestone-text-2',
      type: 'TEXT',
      x: 56,
      y: 564,
      width: 488,
      height: 38,
      text: `★  ${milestone2}`,
      fontSize: 14,
      fill: '#E2E8F0',
      fontRole: 'serif',
    },

    // 11. Dual Authentication Badges
    // Left: Mint Rating & Provenance
    {
      id: 'pg-back-badge-left-bg',
      type: 'RECTANGLE',
      x: 40,
      y: 650,
      width: 250,
      height: 90,
      borderRadius: 10,
      gradient: GRADIENT_24K_GOLD,
      shadow: SHADOW_RAISED_PLAQUE,
    },
    {
      id: 'pg-back-badge-left-inner',
      type: 'RECTANGLE',
      x: 42,
      y: 652,
      width: 246,
      height: 86,
      borderRadius: 8,
      fill: '#0D1017',
    },
    {
      id: 'pg-back-badge-left-label',
      type: 'TEXT',
      x: 52,
      y: 662,
      width: 226,
      height: 18,
      text: 'ARCHIVAL GRADE',
      fontSize: 10,
      fill: '#F59E0B',
      fontRole: 'mono',
      allCaps: true,
      bold: true,
    },
    {
      id: 'back-stat-card-1-val',
      type: 'TEXT',
      x: 52,
      y: 686,
      width: 226,
      height: 36,
      text: ratingOrStat,
      fontSize: 13,
      fill: '#FEF08A',
      fontRole: 'mono',
      bold: true,
    },

    // Right: Provenance Timestamp
    {
      id: 'pg-back-badge-right-bg',
      type: 'RECTANGLE',
      x: 310,
      y: 650,
      width: 250,
      height: 90,
      borderRadius: 10,
      gradient: GRADIENT_24K_GOLD,
      shadow: SHADOW_RAISED_PLAQUE,
    },
    {
      id: 'pg-back-badge-right-inner',
      type: 'RECTANGLE',
      x: 312,
      y: 652,
      width: 246,
      height: 86,
      borderRadius: 8,
      fill: '#0D1017',
    },
    {
      id: 'pg-back-badge-right-label',
      type: 'TEXT',
      x: 322,
      y: 662,
      width: 226,
      height: 18,
      text: 'EDITION STATUS',
      fontSize: 10,
      fill: '#F59E0B',
      fontRole: 'mono',
      allCaps: true,
      bold: true,
    },
    {
      id: 'pg-back-badge-right-val',
      type: 'TEXT',
      x: 322,
      y: 686,
      width: 226,
      height: 36,
      text: 'VERIFIED 1-OF-1 · RARE',
      fontSize: 13,
      fill: '#FEF08A',
      fontRole: 'mono',
      bold: true,
    },

    // 12. Bottom Colophon & Provenance
    {
      id: 'back-footer-edition',
      type: 'TEXT',
      x: 40,
      y: 770,
      width: 520,
      height: 30,
      text: 'OFFICIAL COMMEMORATIVE ARCHIVE · ISSUED ONE OF ONE',
      fontSize: 11,
      fill: '#D4AF37',
      fontRole: 'mono',
      allCaps: true,
      bold: true,
      textAlign: 'center',
    },
    {
      id: 'pg-back-colophon-sub',
      type: 'TEXT',
      x: 40,
      y: 810,
      width: 520,
      height: 24,
      text: 'DESIGNED & MANUFACTURED UNDER THE RARE ULTRA LEGACY SPECIFICATION',
      fontSize: 9,
      fill: '#64748B',
      fontRole: 'mono',
      allCaps: true,
      textAlign: 'center',
    },
  ]

  return layers
}
