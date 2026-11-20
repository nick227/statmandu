import type {
  CardComposition,
  CardCompositionLayer,
  FontRole,
} from './layerSpec'
import type { FixtureSubject } from './fixtures'

export interface CardPalette {
  background: string
  surface: string
  foreground: string
  accent: string
  border: string
  subtext: string
  gradientGold?: string[]
  gradientDark?: string[]
  gradientAccent?: string[]
}

export interface CardTypographyConfig {
  headlineFont: FontRole
  bodyFont: FontRole
  subtextFont: FontRole
  numberFont: FontRole
}

export interface CardMaterialSpec {
  finish: 'matte' | 'metallic' | 'holographic' | 'textured'
  sheenIntensity?: number
  foilRegions?: string[]
}

export interface ContentStoreInputs {
  input1?: string // Subject Name
  input2?: string // Role / Moniker / Subtitle
  input3?: string // Story / Bio / Narrative
  input4?: string // Highlight 1 / Stat 1
  input5?: string // Highlight 2 / Stat 2
  input6?: string // Rating / Record / Stat 3
  [key: string]: string | undefined
}

export interface RenderContext {
  content: ContentStoreInputs
  person?: {
    displayName?: string | null
    bio?: string | null
    hometown?: string | null
    avatarUrl?: string | null
  } | null
  imageAssetId?: string
  assets?: Array<{ id: string; url: string; objectKey?: string }>
  issue?: {
    issueNumber?: number | null
    editionSize?: number | null
    editionMode?: string | null
  } | null
}

export interface AuthoredDesignContract {
  id: string
  name: string
  family: string
  description: string
  visualTradition: string
  palette: CardPalette
  typography: CardTypographyConfig
  materials: CardMaterialSpec

  /**
   * Compiles the front collectible face into layers.
   */
  composeFront: (ctx: RenderContext) => CardCompositionLayer[]

  /**
   * Compiles the coordinated reverse face into layers.
   */
  composeBack: (ctx: RenderContext) => CardCompositionLayer[]

  /**
   * Default representative fixture for development and visual previews.
   */
  defaultFixture: FixtureSubject
}
