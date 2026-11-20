import type {
  CardComposition,
  CardCompositionLayer,
  GradientSpec,
  ShadowSpec,
} from '@/modules/cards/CardCompositionRenderer'
import type { FontRole } from '@/modules/typography/textFit'

export type {
  CardComposition,
  CardCompositionLayer,
  GradientSpec,
  ShadowSpec,
  FontRole,
}

export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'color-dodge'
  | 'soft-light'

export interface VectorShapeSpec {
  pathData: string
  viewBox?: string
  fill?: string
  stroke?: string
  strokeWidth?: number
}
