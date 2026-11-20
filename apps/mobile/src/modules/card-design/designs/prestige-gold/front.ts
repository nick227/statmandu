import type { CardCompositionLayer } from '../../types/layerSpec'
import type { RenderContext } from '../../types/designContract'
import {
  GRADIENT_24K_GOLD,
  GRADIENT_OBSIDIAN_DEPTH,
  GRADIENT_IVORY_PLAQUE,
  GRADIENT_VIGNETTE_BOTTOM,
} from '../../primitives/gradients'
import {
  SHADOW_RAISED_PLAQUE,
  SHADOW_FRAME_DEPTH,
  SHADOW_EMBOSSED_DETAIL,
} from '../../primitives/shadows'
import { PRESTIGE_GOLD_ASSETS } from './assets/ornaments'

export function composePrestigeGoldFront(ctx: RenderContext): CardCompositionLayer[] {
  const name = ctx.content.input1 || ctx.person?.displayName || 'Untitled Subject'
  const subtitle = ctx.content.input2 || 'Ultra Legacy Commemorative'
  const quote = ctx.content.input3 || 'Live Forever · In Commemoration of Excellence'
  const serialNumber = ctx.issue?.issueNumber
    ? `#${String(ctx.issue.issueNumber).padStart(3, '0')}`
    : '#GD-01'

  const layers: CardCompositionLayer[] = [
    // 1. Base Obsidian Velvet Substrate (Full Canvas)
    {
      id: 'pg-substrate',
      type: 'RECTANGLE',
      x: 0,
      y: 0,
      width: 600,
      height: 900,
      gradient: GRADIENT_OBSIDIAN_DEPTH,
    },

    // 2. Outer 24k Gold Beveled Border (Heavy Raised Frame)
    {
      id: 'pg-outer-gold-frame',
      type: 'RECTANGLE',
      x: 14,
      y: 14,
      width: 572,
      height: 872,
      borderRadius: 22,
      gradient: GRADIENT_24K_GOLD,
      shadow: SHADOW_FRAME_DEPTH,
    },

    // 3. Inner Obsidian Matte Inset
    {
      id: 'pg-inner-mat',
      type: 'RECTANGLE',
      x: 20,
      y: 20,
      width: 560,
      height: 860,
      borderRadius: 18,
      fill: '#080A10',
    },

    // 4. Hairline Gilded Inset Channel
    {
      id: 'pg-hairline-channel',
      type: 'RECTANGLE',
      x: 26,
      y: 26,
      width: 548,
      height: 848,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: '#D4AF37',
    },

    // 5. Authored Baroque Corner Filigree (Top Left)
    {
      id: 'pg-corner-tl',
      type: 'SVG',
      x: 22,
      y: 22,
      width: 68,
      height: 68,
      viewBox: '0 0 60 60',
      pathData: PRESTIGE_GOLD_ASSETS.cornerTopLeft,
      fill: '#F59E0B',
    },

    // 6. Authored Baroque Corner Filigree (Top Right)
    {
      id: 'pg-corner-tr',
      type: 'SVG',
      x: 510,
      y: 22,
      width: 68,
      height: 68,
      viewBox: '0 0 60 60',
      pathData: PRESTIGE_GOLD_ASSETS.cornerTopRight,
      fill: '#F59E0B',
    },

    // 7. Top Chrome Header Bar & Badges
    // Left: RARE 1/1 Seal Plaque
    {
      id: 'pg-badge-rare-bg',
      type: 'RECTANGLE',
      x: 42,
      y: 38,
      width: 104,
      height: 26,
      borderRadius: 6,
      gradient: GRADIENT_24K_GOLD,
      shadow: SHADOW_EMBOSSED_DETAIL,
    },
    {
      id: 'pg-badge-rare-inner',
      type: 'RECTANGLE',
      x: 44,
      y: 40,
      width: 100,
      height: 22,
      borderRadius: 4,
      fill: '#0B0D14',
    },
    {
      id: 'pg-badge-rare-txt',
      type: 'TEXT',
      x: 44,
      y: 43,
      width: 100,
      height: 18,
      text: 'RARE 1 OF 1',
      fontSize: 10.5,
      fill: '#FEF08A',
      fontRole: 'mono',
      allCaps: true,
      bold: true,
      textAlign: 'center',
    },

    // Center: Imperial Crown Motif
    {
      id: 'pg-top-crown-icon',
      type: 'SVG',
      x: 276,
      y: 34,
      width: 48,
      height: 32,
      viewBox: '0 0 64 40',
      pathData: PRESTIGE_GOLD_ASSETS.crownCrest,
      fill: '#F59E0B',
    },

    // Right: Serial Edition Badge
    {
      id: 'pg-badge-serial-bg',
      type: 'RECTANGLE',
      x: 454,
      y: 38,
      width: 104,
      height: 26,
      borderRadius: 6,
      gradient: GRADIENT_24K_GOLD,
      shadow: SHADOW_EMBOSSED_DETAIL,
    },
    {
      id: 'pg-badge-serial-inner',
      type: 'RECTANGLE',
      x: 456,
      y: 40,
      width: 100,
      height: 22,
      borderRadius: 4,
      fill: '#0B0D14',
    },
    {
      id: 'pg-badge-serial-txt',
      type: 'TEXT',
      x: 456,
      y: 43,
      width: 100,
      height: 18,
      text: serialNumber,
      fontSize: 11,
      fill: '#FEF08A',
      fontRole: 'mono',
      allCaps: true,
      bold: true,
      textAlign: 'center',
    },

    // Series Headline
    {
      id: 'pg-header-series-title',
      type: 'TEXT',
      x: 42,
      y: 70,
      width: 516,
      height: 24,
      text: 'ULTRA LEGACY SERIES · SPECIAL EDITION',
      fontSize: 11.5,
      fill: '#F59E0B',
      fontRole: 'sans',
      allCaps: true,
      tracking: 1.5,
      textAlign: 'center',
      bold: true,
    },

    // 8. Hero Portrait Window (Arched Framing with Gold Bevel)
    {
      id: 'pg-portrait-frame-outer',
      type: 'RECTANGLE',
      x: 40,
      y: 98,
      width: 520,
      height: 524,
      borderRadius: 16,
      gradient: GRADIENT_24K_GOLD,
      shadow: SHADOW_FRAME_DEPTH,
    },
    {
      id: 'pg-portrait-image',
      type: 'IMAGE',
      x: 43,
      y: 101,
      width: 514,
      height: 518,
      borderRadius: 13,
      imageAssetId: ctx.imageAssetId || 'art-miles',
    },

    // 9. Bottom Scrim Vignette over Artwork for Crisp Typography
    {
      id: 'pg-portrait-vignette',
      type: 'RECTANGLE',
      x: 43,
      y: 430,
      width: 514,
      height: 189,
      borderRadius: 13,
      gradient: GRADIENT_VIGNETTE_BOTTOM,
      opacity: 0.88,
    },

    // 10. Center Medallion Ribbon Pill: "★ ONE OF ONE · 1965-2025 ★"
    {
      id: 'pg-medallion-pill-outer',
      type: 'RECTANGLE',
      x: 160,
      y: 590,
      width: 280,
      height: 32,
      borderRadius: 16,
      gradient: GRADIENT_24K_GOLD,
      shadow: SHADOW_RAISED_PLAQUE,
    },
    {
      id: 'pg-medallion-pill-inner',
      type: 'RECTANGLE',
      x: 162,
      y: 592,
      width: 276,
      height: 28,
      borderRadius: 14,
      fill: '#120F08',
    },
    {
      id: 'pg-medallion-pill-text',
      type: 'TEXT',
      x: 162,
      y: 596,
      width: 276,
      height: 20,
      text: '★ ONE OF ONE · 1965-2025 ★',
      fontSize: 11.5,
      fill: '#FEF08A',
      fontRole: 'mono',
      allCaps: true,
      bold: true,
      textAlign: 'center',
    },

    // 11. Hero Subject Nameplate Plaque (Ivory Ceramic with Gold Rivets)
    {
      id: 'pg-nameplate-outer-bevel',
      type: 'RECTANGLE',
      x: 40,
      y: 636,
      width: 520,
      height: 72,
      borderRadius: 12,
      gradient: GRADIENT_24K_GOLD,
      shadow: SHADOW_RAISED_PLAQUE,
    },
    {
      id: 'pg-nameplate-ivory-surface',
      type: 'RECTANGLE',
      x: 43,
      y: 639,
      width: 514,
      height: 66,
      borderRadius: 9,
      gradient: GRADIENT_IVORY_PLAQUE,
    },

    // 4 Corner Rivets on the Ivory Plaque
    { id: 'pg-rivet-tl', type: 'RECTANGLE', x: 52, y: 648, width: 8, height: 8, borderRadius: 4, gradient: GRADIENT_24K_GOLD },
    { id: 'pg-rivet-tr', type: 'RECTANGLE', x: 540, y: 648, width: 8, height: 8, borderRadius: 4, gradient: GRADIENT_24K_GOLD },
    { id: 'pg-rivet-bl', type: 'RECTANGLE', x: 52, y: 688, width: 8, height: 8, borderRadius: 4, gradient: GRADIENT_24K_GOLD },
    { id: 'pg-rivet-br', type: 'RECTANGLE', x: 540, y: 688, width: 8, height: 8, borderRadius: 4, gradient: GRADIENT_24K_GOLD },

    // Primary Subject Name (Bold Serif Display)
    {
      id: 'slot-input1',
      type: 'TEXT',
      x: 64,
      y: 645,
      width: 472,
      height: 52,
      text: name,
      fontSize: name.length > 28 ? 20 : name.length > 18 ? 24 : 30,
      fill: '#0F172A',
      fontRole: 'serif',
      allCaps: true,
      bold: true,
      textAlign: 'center',
    },

    // 12. Moniker & Role Banner
    {
      id: 'slot-input2',
      type: 'TEXT',
      x: 40,
      y: 718,
      width: 520,
      height: 24,
      text: subtitle,
      fontSize: 13,
      fill: '#F59E0B',
      fontRole: 'sans',
      allCaps: true,
      bold: true,
      tracking: 1.2,
      textAlign: 'center',
    },

    // 13. Guilloche Filigree Divider
    {
      id: 'pg-divider-bar',
      type: 'SVG',
      x: 140,
      y: 746,
      width: 320,
      height: 16,
      viewBox: '0 0 320 16',
      pathData: PRESTIGE_GOLD_ASSETS.dividerBar,
      stroke: '#D4AF37',
      strokeWidth: 1.5,
    },

    // 14. Golden Inscribed Narrative Quote Box
    {
      id: 'slot-input3',
      type: 'TEXT',
      x: 48,
      y: 772,
      width: 504,
      height: 48,
      text: `"${quote}"`,
      fontSize: quote.length > 90 ? 12.5 : 14.5,
      fill: '#FEF08A',
      fontRole: 'serif',
      italic: true,
      textAlign: 'center',
    },

    // 15. Colophon Microprint / Provenance Line
    {
      id: 'pg-bottom-colophon',
      type: 'TEXT',
      x: 40,
      y: 846,
      width: 520,
      height: 18,
      text: 'RARE OFFICIAL COMMEMORATIVE ARCHIVE · ISSUED ONE OF ONE',
      fontSize: 9.5,
      fill: '#94A3B8',
      fontRole: 'mono',
      allCaps: true,
      tracking: 1,
      textAlign: 'center',
    },
  ]

  return layers
}
