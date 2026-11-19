/**
 * RARE Design Taxonomy Catalog
 *
 * Curated starter library of 5 dimensions, distinct aesthetic families,
 * and high-visual-quality variations.
 */

import type {
  TaxonomyDimensionKey,
  TaxonomyNode,
  TaxonomySelections,
  StyleProperties,
  LayoutProperties,
  ArtworkProperties,
  ContentProperties,
  EffectsProperties,
} from './types'

// ============================================================================
// Tier 1 — Dimension Defaults
// ============================================================================

export const DEFAULT_STYLE_PROPERTIES: StyleProperties = {
  palette: {
    background: '#121214',
    surface: '#1E1E22',
    foreground: '#FFFFFF',
    accent: '#3B82F6',
    border: '#2E2E34',
    subtext: '#94A3B8',
  },
  typography: {
    nameRole: 'sans',
    labelRole: 'sans',
    allCaps: true,
  },
  ornament: {
    density: 0.5,
    style: 'minimal',
  },
  frame: {
    thickness: 2,
    inset: 16,
    color: '#2E2E34',
  },
}

export const DEFAULT_LAYOUT_PROPERTIES: LayoutProperties = {
  type: 'portrait',
  artArea: {
    x: 36,
    y: 48,
    width: 528,
    height: 520,
  },
  contentArea: {
    x: 40,
    y: 590,
    width: 520,
    height: 250,
  },
  headerArea: {
    x: 40,
    y: 20,
    height: 24,
    visible: true,
  },
}

export const DEFAULT_ARTWORK_PROPERTIES: ArtworkProperties = {
  framing: 'hero',
  aspectRatio: '4:5',
  backdropTint: '#18181B',
  showPlaceholderMatte: true,
  matteBorderWidth: 1,
}

export const DEFAULT_CONTENT_PROPERTIES: ContentProperties = {
  preset: 'debut',
  nameSize: 34,
  bioSize: 15,
  showCategoryEyebrow: true,
  eyebrowText: 'RARE COLLECTIBLE',
  showDiscipline: true,
}

export const DEFAULT_EFFECTS_PROPERTIES: EffectsProperties = {
  type: 'none',
  intensity: 0.0,
  primaryEffectColor: '#FFFFFF',
}

// ============================================================================
// Full Relational Catalog (Nodes)
// ============================================================================

export const TAXONOMY_NODES: TaxonomyNode[] = [
  // --------------------------------------------------------------------------
  // 1. STYLE DIMENSION & FAMILIES
  // --------------------------------------------------------------------------
  {
    id: 'dim-style',
    key: 'style',
    type: 'DIMENSION',
    dimension: 'style',
    name: 'Style',
    description: 'Color palette, typography theme, frame borders, and visual atmosphere.',
    version: 1,
    properties: DEFAULT_STYLE_PROPERTIES,
  },

  // Family: Arcade
  {
    id: 'fam-style-arcade',
    key: 'style.arcade',
    type: 'FAMILY',
    dimension: 'style',
    parentKey: 'style',
    name: 'Arcade',
    description: 'Vibrant neon luminescence, 8-bit accents, high-energy gaming aesthetics.',
    version: 1,
    properties: {
      palette: {
        background: '#0D0B18',
        surface: '#171132',
        foreground: '#00F5FF',
        accent: '#FF31C8',
        border: '#432C7A',
        subtext: '#9D8CD7',
      },
      typography: {
        nameRole: 'pixel-display',
        labelRole: 'mono',
        allCaps: true,
      },
      ornament: {
        density: 0.8,
        style: 'arcade',
      },
      frame: {
        thickness: 4,
        inset: 14,
        color: '#FF31C8',
      },
    },
  },
  // Variation: Neon Pulse
  {
    id: 'var-style-arcade-neon-07',
    key: 'style.arcade.neon-07',
    type: 'VARIATION',
    dimension: 'style',
    parentKey: 'style.arcade',
    name: 'Neon Pulse 07',
    description: 'Electric cyan and magenta glow on a deep void background.',
    version: 1,
    properties: {
      palette: {
        background: '#0B0814',
        surface: '#16102E',
        foreground: '#00F5FF',
        accent: '#FF31C8',
        border: '#5B21B6',
        subtext: '#A78BFA',
      },
    },
  },
  // Variation: Pixel 08
  {
    id: 'var-style-arcade-pixel-08',
    key: 'style.arcade.pixel-08',
    type: 'VARIATION',
    dimension: 'style',
    parentKey: 'style.arcade',
    name: 'Pixel Gold 08',
    description: 'Retro phosphor amber and emerald CRT palette with pixel accents.',
    version: 1,
    properties: {
      palette: {
        background: '#080C0B',
        surface: '#111D19',
        foreground: '#FBBF24',
        accent: '#10B981',
        border: '#065F46',
        subtext: '#6EE7B7',
      },
      frame: {
        thickness: 4,
        inset: 16,
        color: '#FBBF24',
      },
    },
  },

  // Family: Editorial
  {
    id: 'fam-style-editorial',
    key: 'style.editorial',
    type: 'FAMILY',
    dimension: 'style',
    parentKey: 'style',
    name: 'Editorial',
    description: 'Refined serif typography, high-contrast layouts, and timeless magazine aesthetics.',
    version: 1,
    properties: {
      palette: {
        background: '#F9F8F6',
        surface: '#FFFFFF',
        foreground: '#111827',
        accent: '#B91C1C',
        border: '#E5E0D8',
        subtext: '#4B5563',
      },
      typography: {
        nameRole: 'serif',
        labelRole: 'sans',
        allCaps: false,
      },
      ornament: {
        density: 0.3,
        style: 'serif',
      },
      frame: {
        thickness: 1,
        inset: 20,
        color: '#111827',
      },
    },
  },
  // Variation: Monocle Editorial
  {
    id: 'var-style-editorial-vogue',
    key: 'style.editorial.vogue-serif',
    type: 'VARIATION',
    dimension: 'style',
    parentKey: 'style.editorial',
    name: 'Monocle Serif',
    description: 'Stark ivory parchment, deep charcoal typography, crimson accent.',
    version: 1,
    properties: {},
  },
  // Variation: Dark Broadsheet
  {
    id: 'var-style-editorial-dark',
    key: 'style.editorial.dark-broadsheet',
    type: 'VARIATION',
    dimension: 'style',
    parentKey: 'style.editorial',
    name: 'Nocturne Magazine',
    description: 'Deep espresso backdrop with crisp cream typography and gold ruling.',
    version: 1,
    properties: {
      palette: {
        background: '#131110',
        surface: '#1D1A18',
        foreground: '#FDFBF7',
        accent: '#D4AF37',
        border: '#2E2A27',
        subtext: '#A8A29E',
      },
      frame: {
        thickness: 1,
        inset: 18,
        color: '#D4AF37',
      },
    },
  },

  // Family: Prestige
  {
    id: 'fam-style-prestige',
    key: 'style.prestige',
    type: 'FAMILY',
    dimension: 'style',
    parentKey: 'style',
    name: 'Prestige',
    description: 'Gilded luxury, obsidian finishes, metallic highlights, and premier rarity.',
    version: 1,
    properties: {
      palette: {
        background: '#09090B',
        surface: '#141417',
        foreground: '#F4E8C1',
        accent: '#D4AF37',
        border: '#3F3722',
        subtext: '#A1977F',
      },
      typography: {
        nameRole: 'serif',
        labelRole: 'mono',
        allCaps: true,
      },
      ornament: {
        density: 0.7,
        style: 'serif',
      },
      frame: {
        thickness: 3,
        inset: 16,
        color: '#D4AF37',
      },
    },
  },
  // Variation: Gilded Noir
  {
    id: 'var-style-prestige-gilded-noir',
    key: 'style.prestige.gilded-noir',
    type: 'VARIATION',
    dimension: 'style',
    parentKey: 'style.prestige',
    name: 'Gilded Noir',
    description: 'Obsidian card face with polished 24k gold ornamental border and accents.',
    version: 1,
    properties: {},
  },
  // Variation: Platinum Sovereign
  {
    id: 'var-style-prestige-platinum',
    key: 'style.prestige.royal-platinum',
    type: 'VARIATION',
    dimension: 'style',
    parentKey: 'style.prestige',
    name: 'Platinum Sovereign',
    description: 'Frosted gunmetal with icy platinum-silver borders and arctic blue highlights.',
    version: 1,
    properties: {
      palette: {
        background: '#0F1216',
        surface: '#1B2028',
        foreground: '#F8FAFC',
        accent: '#38BDF8',
        border: '#334155',
        subtext: '#94A3B8',
      },
      frame: {
        thickness: 2,
        inset: 16,
        color: '#CBD5E1',
      },
    },
  },

  // Family: Cyber Tech
  {
    id: 'fam-style-cyber',
    key: 'style.cyber-tech',
    type: 'FAMILY',
    dimension: 'style',
    parentKey: 'style',
    name: 'Cyber Tech',
    description: 'Futuristic HUD telemetry, angular brackets, monospace coordinates.',
    version: 1,
    properties: {
      palette: {
        background: '#020617',
        surface: '#0B1120',
        foreground: '#38BDF8',
        accent: '#4ADE80',
        border: '#1E293B',
        subtext: '#64748B',
      },
      typography: {
        nameRole: 'mono',
        labelRole: 'mono',
        allCaps: true,
      },
      ornament: {
        density: 0.75,
        style: 'cyber',
      },
      frame: {
        thickness: 2,
        inset: 12,
        color: '#38BDF8',
      },
    },
  },
  // Variation: HUD Terminal
  {
    id: 'var-style-cyber-hud',
    key: 'style.cyber-tech.matrix-hud',
    type: 'VARIATION',
    dimension: 'style',
    parentKey: 'style.cyber-tech',
    name: 'HUD Terminal',
    description: 'Tactical HUD telemetry with cyan telemetry readouts and green status indicators.',
    version: 1,
    properties: {},
  },

  // Family: Synthwave
  {
    id: 'fam-style-synthwave',
    key: 'style.synthwave',
    type: 'FAMILY',
    dimension: 'style',
    parentKey: 'style',
    name: 'Synthwave',
    description: 'Outrun sunset gradients, retro laser horizons, hot pink and twilight violet.',
    version: 1,
    properties: {
      palette: {
        background: '#1A0B2E',
        surface: '#2B134D',
        foreground: '#FF61D2',
        accent: '#FFE600',
        border: '#6B21A8',
        subtext: '#D8B4FE',
      },
      typography: {
        nameRole: 'display',
        labelRole: 'sans',
        allCaps: true,
      },
      ornament: {
        density: 0.6,
        style: 'arcade',
      },
      frame: {
        thickness: 3,
        inset: 14,
        color: '#FF61D2',
      },
    },
  },
  // Variation: Outrun Sunset
  {
    id: 'var-style-synthwave-sunset',
    key: 'style.synthwave.outrun-sunset',
    type: 'VARIATION',
    dimension: 'style',
    parentKey: 'style.synthwave',
    name: 'Outrun Sunset',
    description: 'Twilight purple foundation with laser-pink headers and amber highlights.',
    version: 1,
    properties: {},
  },

  // Family: Minimalist
  {
    id: 'fam-style-minimalist',
    key: 'style.minimalist',
    type: 'FAMILY',
    dimension: 'style',
    parentKey: 'style',
    name: 'Minimalist',
    description: 'Swiss modernist purity, stark contrast, rational geometry, bold negative space.',
    version: 1,
    properties: {
      palette: {
        background: '#FFFFFF',
        surface: '#F4F4F5',
        foreground: '#09090B',
        accent: '#FF4800',
        border: '#E4E4E7',
        subtext: '#71717A',
      },
      typography: {
        nameRole: 'sans',
        labelRole: 'sans',
        allCaps: true,
      },
      ornament: {
        density: 0.1,
        style: 'minimal',
      },
      frame: {
        thickness: 1,
        inset: 24,
        color: '#09090B',
      },
    },
  },
  // Variation: Swiss Stark
  {
    id: 'var-style-minimalist-swiss',
    key: 'style.minimalist.swiss-stark',
    type: 'VARIATION',
    dimension: 'style',
    parentKey: 'style.minimalist',
    name: 'Swiss Stark',
    description: 'Black and white rationalism with an International Orange focal accent.',
    version: 1,
    properties: {},
  },

  // Family: Comic Book
  {
    id: 'fam-style-comic',
    key: 'style.comic-book',
    type: 'FAMILY',
    dimension: 'style',
    parentKey: 'style',
    name: 'Comic Book',
    description: 'Pop art punchiness, bold ink outlines, energetic action yellow & punch red.',
    version: 1,
    properties: {
      palette: {
        background: '#FFDE00',
        surface: '#FFFFFF',
        foreground: '#000000',
        accent: '#E63946',
        border: '#000000',
        subtext: '#1F2937',
      },
      typography: {
        nameRole: 'display',
        labelRole: 'sans',
        allCaps: true,
      },
      ornament: {
        density: 0.7,
        style: 'brutalist',
      },
      frame: {
        thickness: 6,
        inset: 12,
        color: '#000000',
      },
    },
  },
  // Variation: Halftone Pop
  {
    id: 'var-style-comic-pop',
    key: 'style.comic-book.halftone-pop',
    type: 'VARIATION',
    dimension: 'style',
    parentKey: 'style.comic-book',
    name: 'Pop Art Action',
    description: 'Primary pop colors with high-impact ink outlines and yellow faceplate.',
    version: 1,
    properties: {},
  },

  // Family: Vintage
  {
    id: 'fam-style-vintage',
    key: 'style.vintage',
    type: 'FAMILY',
    dimension: 'style',
    parentKey: 'style',
    name: 'Vintage',
    description: 'Letterpress heritage, antique cardstock tones, weathered patina.',
    version: 1,
    properties: {
      palette: {
        background: '#EFE6D5',
        surface: '#E5DAC4',
        foreground: '#38281D',
        accent: '#9A3412',
        border: '#C8BBA4',
        subtext: '#685444',
      },
      typography: {
        nameRole: 'serif',
        labelRole: 'serif',
        allCaps: true,
      },
      ornament: {
        density: 0.5,
        style: 'vintage',
      },
      frame: {
        thickness: 3,
        inset: 18,
        color: '#38281D',
      },
    },
  },
  // Variation: Heritage Press
  {
    id: 'var-style-vintage-heritage',
    key: 'style.vintage.letterpress-sepia',
    type: 'VARIATION',
    dimension: 'style',
    parentKey: 'style.vintage',
    name: 'Heritage Press',
    description: 'Aged cotton paper palette, deep umber text, and rust orange accent.',
    version: 1,
    properties: {},
  },

  // --------------------------------------------------------------------------
  // 2. LAYOUT DIMENSION & FAMILIES
  // --------------------------------------------------------------------------
  {
    id: 'dim-layout',
    key: 'layout',
    type: 'DIMENSION',
    dimension: 'layout',
    name: 'Layout',
    description: 'Spatial proportions and geometry for artwork, typography, and badges.',
    version: 1,
    properties: DEFAULT_LAYOUT_PROPERTIES,
  },

  // Family: Portrait Hero
  {
    id: 'fam-layout-hero',
    key: 'layout.portrait-hero',
    type: 'FAMILY',
    dimension: 'layout',
    parentKey: 'layout',
    name: 'Portrait Hero',
    description: 'Generous vertical artwork window with a compact, high-legibility footer.',
    version: 1,
    properties: {
      type: 'portrait',
      artArea: { x: 36, y: 52, width: 528, height: 530 },
      contentArea: { x: 40, y: 604, width: 520, height: 246 },
      headerArea: { x: 40, y: 20, height: 24, visible: true },
    },
  },
  // Variation: Hero Standard
  {
    id: 'var-layout-hero-std',
    key: 'layout.portrait-hero.standard',
    type: 'VARIATION',
    dimension: 'layout',
    parentKey: 'layout.portrait-hero',
    name: 'Hero Standard',
    description: 'Balanced vertical portrait window with spacious footer for title and bio.',
    version: 1,
    properties: {},
  },
  // Variation: Hero Elevated
  {
    id: 'var-layout-hero-elevated',
    key: 'layout.portrait-hero.elevated',
    type: 'VARIATION',
    dimension: 'layout',
    parentKey: 'layout.portrait-hero',
    name: 'Hero Elevated',
    description: 'Taller 570px portrait window with sleek bottom nameplate and badge.',
    version: 1,
    properties: {
      artArea: { x: 36, y: 44, width: 528, height: 580 },
      contentArea: { x: 40, y: 644, width: 520, height: 210 },
    },
  },

  // Family: Split Editorial
  {
    id: 'fam-layout-split',
    key: 'layout.split-editorial',
    type: 'FAMILY',
    dimension: 'layout',
    parentKey: 'layout',
    name: 'Split Editorial',
    description: 'Equal harmonic balance between portrait artwork and substantial biographical text.',
    version: 1,
    properties: {
      type: 'split',
      artArea: { x: 40, y: 60, width: 520, height: 420 },
      contentArea: { x: 40, y: 504, width: 520, height: 346 },
      headerArea: { x: 40, y: 24, height: 24, visible: true },
    },
  },
  // Variation: Balanced Split
  {
    id: 'var-layout-split-balanced',
    key: 'layout.split-editorial.balanced',
    type: 'VARIATION',
    dimension: 'layout',
    parentKey: 'layout.split-editorial',
    name: 'Balanced Split',
    description: '50/50 visual proportion ideal for creators with detailed stories.',
    version: 1,
    properties: {},
  },

  // Family: Full Bleed
  {
    id: 'fam-layout-bleed',
    key: 'layout.full-bleed',
    type: 'FAMILY',
    dimension: 'layout',
    parentKey: 'layout',
    name: 'Full Bleed',
    description: 'Artwork extends across the card surface with floating contrast overlays.',
    version: 1,
    properties: {
      type: 'full-bleed',
      artArea: { x: 0, y: 0, width: 600, height: 900 },
      contentArea: { x: 40, y: 640, width: 520, height: 220 },
      headerArea: { x: 40, y: 32, height: 32, visible: true },
    },
  },
  // Variation: Bleed Overlay
  {
    id: 'var-layout-bleed-overlay',
    key: 'layout.full-bleed.overlay',
    type: 'VARIATION',
    dimension: 'layout',
    parentKey: 'layout.full-bleed',
    name: 'Bleed Scrim',
    description: 'Unbounded edge-to-edge artwork with tinted bottom contrast bar.',
    version: 1,
    properties: {},
  },

  // Family: Framed Collector
  {
    id: 'fam-layout-framed',
    key: 'layout.framed-collector',
    type: 'FAMILY',
    dimension: 'layout',
    parentKey: 'layout',
    name: 'Framed Collector',
    description: 'Classic physical trading card proportion with wide ornamental borders.',
    version: 1,
    properties: {
      type: 'framed',
      artArea: { x: 54, y: 64, width: 492, height: 480 },
      contentArea: { x: 54, y: 570, width: 492, height: 270 },
      headerArea: { x: 54, y: 28, height: 24, visible: true },
    },
  },
  // Variation: Classic Inset
  {
    id: 'var-layout-framed-inset',
    key: 'layout.framed-collector.inset',
    type: 'VARIATION',
    dimension: 'layout',
    parentKey: 'layout.framed-collector',
    name: 'Classic Inset Window',
    description: 'Recessed portrait frame bordered by dual matting lines.',
    version: 1,
    properties: {},
  },

  // Family: Modern Poster
  {
    id: 'fam-layout-poster',
    key: 'layout.modern-poster',
    type: 'FAMILY',
    dimension: 'layout',
    parentKey: 'layout',
    name: 'Modern Poster',
    description: 'Top masthead typography followed by artwork and minimalist footer stamp.',
    version: 1,
    properties: {
      type: 'poster',
      artArea: { x: 40, y: 150, width: 520, height: 560 },
      contentArea: { x: 40, y: 730, width: 520, height: 130 },
      headerArea: { x: 40, y: 36, height: 90, visible: true },
    },
  },
  // Variation: Poster Masthead
  {
    id: 'var-layout-poster-masthead',
    key: 'layout.modern-poster.masthead',
    type: 'VARIATION',
    dimension: 'layout',
    parentKey: 'layout.modern-poster',
    name: 'Masthead Headline',
    description: 'Bold top headline with centered portrait and discreet bottom metadata.',
    version: 1,
    properties: {},
  },

  // --------------------------------------------------------------------------
  // 3. ARTWORK DIMENSION & FAMILIES
  // --------------------------------------------------------------------------
  {
    id: 'dim-artwork',
    key: 'artwork',
    type: 'DIMENSION',
    dimension: 'artwork',
    name: 'Artwork',
    description: 'Subject window framing, aspect ratios, and background texture backdrop.',
    version: 1,
    properties: DEFAULT_ARTWORK_PROPERTIES,
  },

  // Family: Studio Portrait
  {
    id: 'fam-art-studio',
    key: 'artwork.studio-portrait',
    type: 'FAMILY',
    dimension: 'artwork',
    parentKey: 'artwork',
    name: 'Studio Portrait',
    description: 'Clean centered subject presentation with crisp studio matting.',
    version: 1,
    properties: {
      framing: 'hero',
      aspectRatio: '4:5',
      backdropTint: '#1F2937',
      showPlaceholderMatte: true,
      matteBorderWidth: 1,
    },
  },
  // Variation: Studio Clean
  {
    id: 'var-art-studio-clean',
    key: 'artwork.studio-portrait.clean',
    type: 'VARIATION',
    dimension: 'artwork',
    parentKey: 'artwork.studio-portrait',
    name: 'Studio Clean',
    description: 'Pure neutral backdrop with single hairline frame.',
    version: 1,
    properties: {},
  },
  // Variation: Studio Spotlight
  {
    id: 'var-art-studio-spotlight',
    key: 'artwork.studio-portrait.spotlight',
    type: 'VARIATION',
    dimension: 'artwork',
    parentKey: 'artwork.studio-portrait',
    name: 'Studio Spotlight',
    description: 'Subtle illuminated center with darker perimeter vignette.',
    version: 1,
    properties: {
      backdropTint: '#27272A',
      matteBorderWidth: 2,
    },
  },

  // Family: Dynamic Action
  {
    id: 'fam-art-action',
    key: 'artwork.dynamic-action',
    type: 'FAMILY',
    dimension: 'artwork',
    parentKey: 'artwork',
    name: 'Dynamic Action',
    description: 'Geometric framing designed for energetic photography.',
    version: 1,
    properties: {
      framing: 'inset',
      aspectRatio: '1:1',
      backdropTint: '#18181B',
      showPlaceholderMatte: true,
      matteBorderWidth: 3,
    },
  },
  // Variation: Angled Inset
  {
    id: 'var-art-action-angled',
    key: 'artwork.dynamic-action.angled',
    type: 'VARIATION',
    dimension: 'artwork',
    parentKey: 'artwork.dynamic-action',
    name: 'Angled Inset',
    description: 'Heavier border matting with contrast background chamber.',
    version: 1,
    properties: {},
  },

  // Family: Framed Vignette
  {
    id: 'fam-art-vignette',
    key: 'artwork.framed-vignette',
    type: 'FAMILY',
    dimension: 'artwork',
    parentKey: 'artwork',
    name: 'Framed Vignette',
    description: 'Traditional archival matting with delicate double inner frame.',
    version: 1,
    properties: {
      framing: 'window',
      aspectRatio: '4:5',
      backdropTint: '#0F172A',
      showPlaceholderMatte: true,
      matteBorderWidth: 2,
    },
  },
  // Variation: Archival Window
  {
    id: 'var-art-vignette-archival',
    key: 'artwork.framed-vignette.archival',
    type: 'VARIATION',
    dimension: 'artwork',
    parentKey: 'artwork.framed-vignette',
    name: 'Archival Window',
    description: 'Classic museum-style portrait presentation with double-line margin.',
    version: 1,
    properties: {},
  },

  // --------------------------------------------------------------------------
  // 4. CONTENT DIMENSION & FAMILIES
  // --------------------------------------------------------------------------
  {
    id: 'dim-content',
    key: 'content',
    type: 'DIMENSION',
    dimension: 'content',
    name: 'Content',
    description: 'Information hierarchy, typography sizing, headlines, and badges.',
    version: 1,
    properties: DEFAULT_CONTENT_PROPERTIES,
  },

  // Family: Prestige Debut
  {
    id: 'fam-content-debut',
    key: 'content.prestige-debut',
    type: 'FAMILY',
    dimension: 'content',
    parentKey: 'content',
    name: 'Prestige Debut',
    description: 'Large display subject nameplate, debut kicker, and biography block.',
    version: 1,
    properties: {
      preset: 'debut',
      nameSize: 34,
      bioSize: 15,
      showCategoryEyebrow: true,
      eyebrowText: 'RARE COLLECTIBLE',
      showDiscipline: true,
    },
  },
  // Variation: Official Debut
  {
    id: 'var-content-debut-official',
    key: 'content.prestige-debut.official',
    type: 'VARIATION',
    dimension: 'content',
    parentKey: 'content.prestige-debut',
    name: 'Official Debut',
    description: 'Hero name with official registration kicker and full bio description.',
    version: 1,
    properties: {},
  },

  // Family: Editorial Feature
  {
    id: 'fam-content-feature',
    key: 'content.editorial-feature',
    type: 'FAMILY',
    dimension: 'content',
    parentKey: 'content',
    name: 'Editorial Feature',
    description: 'High-contrast typography with pull-quote styling and origins.',
    version: 1,
    properties: {
      preset: 'feature',
      nameSize: 38,
      bioSize: 16,
      showCategoryEyebrow: true,
      eyebrowText: 'FEATURED CREATOR',
      showDiscipline: true,
    },
  },
  // Variation: Pullquote Feature
  {
    id: 'var-content-feature-pullquote',
    key: 'content.editorial-feature.pullquote',
    type: 'VARIATION',
    dimension: 'content',
    parentKey: 'content.editorial-feature',
    name: 'Editorial Pullquote',
    description: 'Authoritative headline name with prominent statement styling.',
    version: 1,
    properties: {},
  },

  // Family: Archival Profile
  {
    id: 'fam-content-archival',
    key: 'content.archival-profile',
    type: 'FAMILY',
    dimension: 'content',
    parentKey: 'content',
    name: 'Archival Profile',
    description: 'Numbered registry format with origins and specialization details.',
    version: 1,
    properties: {
      preset: 'archival',
      nameSize: 30,
      bioSize: 14,
      showCategoryEyebrow: true,
      eyebrowText: 'ARCHIVE REGISTRY',
      showDiscipline: true,
    },
  },
  // Variation: Archival Index
  {
    id: 'var-content-archival-index',
    key: 'content.archival-profile.index',
    type: 'VARIATION',
    dimension: 'content',
    parentKey: 'content.archival-profile',
    name: 'Registry Index',
    description: 'Catalog index formatting with hometown and career achievements.',
    version: 1,
    properties: {},
  },

  // Family: Minimal Badge
  {
    id: 'fam-content-minimal',
    key: 'content.minimal-badge',
    type: 'FAMILY',
    dimension: 'content',
    parentKey: 'content',
    name: 'Minimal Badge',
    description: 'Whisper-quiet typography focusing viewer attention strictly on artwork.',
    version: 1,
    properties: {
      preset: 'minimal',
      nameSize: 26,
      bioSize: 13,
      showCategoryEyebrow: false,
      eyebrowText: '',
      showDiscipline: false,
    },
  },
  // Variation: Pure Badge
  {
    id: 'var-content-minimal-pure',
    key: 'content.minimal-badge.pure',
    type: 'VARIATION',
    dimension: 'content',
    parentKey: 'content.minimal-badge',
    name: 'Pure Minimalist',
    description: 'Only subject name and subtle discipline indicator.',
    version: 1,
    properties: {},
  },

  // --------------------------------------------------------------------------
  // 5. EFFECTS DIMENSION & FAMILIES
  // --------------------------------------------------------------------------
  {
    id: 'dim-effects',
    key: 'effects',
    type: 'DIMENSION',
    dimension: 'effects',
    name: 'Effects',
    description: 'Foil finishes, holographic prisms, neon glow borders, and film grain.',
    version: 1,
    properties: DEFAULT_EFFECTS_PROPERTIES,
  },

  // Family: Clean Matte (None)
  {
    id: 'fam-effects-clean',
    key: 'effects.clean-matte',
    type: 'FAMILY',
    dimension: 'effects',
    parentKey: 'effects',
    name: 'Clean Matte',
    description: 'Zero metallic or glow enhancements; pure vector and photographic clarity.',
    version: 1,
    properties: {
      type: 'none',
      intensity: 0.0,
      primaryEffectColor: '#FFFFFF',
    },
  },
  // Variation: Pure Matte
  {
    id: 'var-effects-clean-pure',
    key: 'effects.clean-matte.pure',
    type: 'VARIATION',
    dimension: 'effects',
    parentKey: 'effects.clean-matte',
    name: 'Pure Matte',
    description: 'Crisp, timeless, unenhanced collectible print finish.',
    version: 1,
    properties: {},
  },

  // Family: Gold Foil
  {
    id: 'fam-effects-foil',
    key: 'effects.gold-foil',
    type: 'FAMILY',
    dimension: 'effects',
    parentKey: 'effects',
    name: 'Gold Foil',
    description: 'Gilded metallic frame lines and embossed gold highlight accents.',
    version: 1,
    properties: {
      type: 'foil',
      intensity: 0.8,
      primaryEffectColor: '#D4AF37',
      secondaryEffectColor: '#F3E5AB',
    },
  },
  // Variation: 24k Gilt Accent
  {
    id: 'var-effects-foil-gilt',
    key: 'effects.gold-foil.24k-rim',
    type: 'VARIATION',
    dimension: 'effects',
    parentKey: 'effects.gold-foil',
    name: '24k Gilt Inset',
    description: 'Twin gold foil inner trim lines with warm champagne sheen.',
    version: 1,
    properties: {},
  },

  // Family: Cyber Glow
  {
    id: 'fam-effects-cyber',
    key: 'effects.cyber-glow',
    type: 'FAMILY',
    dimension: 'effects',
    parentKey: 'effects',
    name: 'Cyber Glow',
    description: 'Electrified neon edge accents with dual cyan and laser magenta rays.',
    version: 1,
    properties: {
      type: 'cyber',
      intensity: 0.9,
      primaryEffectColor: '#00F5FF',
      secondaryEffectColor: '#FF31C8',
    },
  },
  // Variation: Neon Ray Trim
  {
    id: 'var-effects-cyber-neon',
    key: 'effects.cyber-glow.neon-trim',
    type: 'VARIATION',
    dimension: 'effects',
    parentKey: 'effects.cyber-glow',
    name: 'Neon Laser Trim',
    description: 'Pulsing cyan and magenta edge highlights.',
    version: 1,
    properties: {},
  },

  // Family: Holographic Prism
  {
    id: 'fam-effects-holo',
    key: 'effects.holographic',
    type: 'FAMILY',
    dimension: 'effects',
    parentKey: 'effects',
    name: 'Holographic',
    description: 'Multi-spectrum rainbow prism bands across borders and badges.',
    version: 1,
    properties: {
      type: 'holographic',
      intensity: 0.85,
      primaryEffectColor: '#38BDF8',
      secondaryEffectColor: '#F472B6',
    },
  },
  // Variation: Prismatic Spectrum
  {
    id: 'var-effects-holo-prism',
    key: 'effects.holographic.prism-spectrum',
    type: 'VARIATION',
    dimension: 'effects',
    parentKey: 'effects.holographic',
    name: 'Prism Spectrum',
    description: 'Iridescent color spectrum accents with high collectible finish.',
    version: 1,
    properties: {},
  },

  // Family: Darkroom Grain
  {
    id: 'fam-effects-grain',
    key: 'effects.darkroom-grain',
    type: 'FAMILY',
    dimension: 'effects',
    parentKey: 'effects',
    name: 'Darkroom Grain',
    description: 'Analogue photographic film texture and vintage matte framing.',
    version: 1,
    properties: {
      type: 'grain',
      intensity: 0.5,
      primaryEffectColor: '#71717A',
    },
  },
  // Variation: 35mm Silver Grain
  {
    id: 'var-effects-grain-35mm',
    key: 'effects.darkroom-grain.35mm',
    type: 'VARIATION',
    dimension: 'effects',
    parentKey: 'effects.darkroom-grain',
    name: '35mm Film Grain',
    description: 'Classic silver gelatin border texture with subtle vintage tone.',
    version: 1,
    properties: {},
  },
]

// ============================================================================
// Query & Lookup Helpers
// ============================================================================

export const DIMENSIONS: Array<{
  key: TaxonomyDimensionKey
  name: string
  description: string
}> = [
  { key: 'style', name: 'Style', description: 'Color palette & visual atmosphere' },
  { key: 'layout', name: 'Layout', description: 'Spatial grid & card geometry' },
  { key: 'artwork', name: 'Artwork', description: 'Framing, matting & backdrop' },
  { key: 'content', name: 'Content', description: 'Typography hierarchy & badges' },
  { key: 'effects', name: 'Effects', description: 'Foil, holographic & finishes' },
]

export const DEFAULT_TAXONOMY_SELECTIONS: TaxonomySelections = {
  style: { key: 'style.arcade.neon-07', version: 1 },
  layout: { key: 'layout.portrait-hero.standard', version: 1 },
  artwork: { key: 'artwork.studio-portrait.clean', version: 1 },
  content: { key: 'content.prestige-debut.official', version: 1 },
  effects: { key: 'effects.cyber-glow.neon-trim', version: 1 },
}

export function getNodeByKey(key: string): TaxonomyNode | undefined {
  return TAXONOMY_NODES.find((node) => node.key === key)
}

export function getFamiliesForDimension(dimension: TaxonomyDimensionKey): TaxonomyNode[] {
  return TAXONOMY_NODES.filter(
    (node) => node.dimension === dimension && node.type === 'FAMILY',
  )
}

export function getVariationsForFamily(familyKey: string): TaxonomyNode[] {
  return TAXONOMY_NODES.filter(
    (node) => node.parentKey === familyKey && node.type === 'VARIATION',
  )
}

export function getVariationsForDimension(dimension: TaxonomyDimensionKey): TaxonomyNode[] {
  return TAXONOMY_NODES.filter(
    (node) => node.dimension === dimension && node.type === 'VARIATION',
  )
}
