import { db } from '@statman/db'
import { personName } from './PersonService'

export const COMPOSITION_RENDERER = 'rdc-composition-v1'

export type GradientSpec = {
  type?: 'linear' | 'radial'
  colors: string[]
  locations?: number[]
  start?: { x: number; y: number }
  end?: { x: number; y: number }
  angle?: number
}

export type ShadowSpec = {
  color?: string
  offsetX?: number
  offsetY?: number
  blur?: number
  opacity?: number
}

export type MaskSpec = {
  type?: 'rounded' | 'arch' | 'path'
  borderRadius?: number
  borderTopLeftRadius?: number
  borderTopRightRadius?: number
  borderBottomLeftRadius?: number
  borderBottomRightRadius?: number
  pathData?: string
}

export type CompositionLayer = {
  id: string
  type: 'TEXT' | 'IMAGE' | 'RECTANGLE' | 'SVG' | 'PATH'
  x: number
  y: number
  width: number
  height: number
  text?: string
  personField?: 'displayName' | 'bio' | 'hometown'
  imageAssetId?: string
  fill?: string
  fontSize?: number
  fontRole?: string
  allCaps?: boolean
  bold?: boolean
  italic?: boolean
  tracking?: number
  letterSpacing?: number
  textAlign?: 'left' | 'center' | 'right'
  lineHeight?: number
  borderRadius?: number
  borderWidth?: number
  borderColor?: string
  borderLeftWidth?: number
  borderRightWidth?: number
  borderTopWidth?: number
  borderBottomWidth?: number
  gradient?: GradientSpec
  shadow?: ShadowSpec
  mask?: MaskSpec
  opacity?: number
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'color-dodge' | 'soft-light'
  pathData?: string
  viewBox?: string
  stroke?: string
  strokeWidth?: number
  [key: string]: any
}

export type CardComposition = {
  schemaVersion: 1
  canvas: { width: number; height: number }
  layers: CompositionLayer[]
  backComposition?: CardComposition
  metadata?: Record<string, any>
}

function invalid(message: string): never { throw { statusCode: 400, message } }
function keys(value: object, allowed: string[]) {
  if (Object.keys(value).some(key => !allowed.includes(key))) invalid('Unsupported composition property')
}
function finite(value: unknown, min: number, max: number) {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max
}

const ALLOWED_BLEND_MODES = new Set(['normal', 'multiply', 'screen', 'overlay', 'color-dodge', 'soft-light'])

function validateLayer(layer: unknown, canvas: { width: number; height: number }, ids: Set<string>): CompositionLayer {
  if (!layer || typeof layer !== 'object' || Array.isArray(layer)) invalid('Invalid layer')
  const l = layer as CompositionLayer
  keys(l, [
    'id', 'type', 'x', 'y', 'width', 'height', 'text', 'personField', 'imageAssetId', 'fill', 'fontSize',
    'fontRole', 'allCaps', 'bold', 'italic', 'tracking', 'letterSpacing', 'textAlign', 'lineHeight',
    'borderRadius', 'borderWidth', 'borderColor', 'borderLeftWidth', 'borderRightWidth', 'borderTopWidth', 'borderBottomWidth',
    'gradient', 'shadow', 'mask', 'opacity', 'blendMode', 'pathData', 'viewBox', 'stroke', 'strokeWidth',
  ])

  if (typeof l.id !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(l.id) || ids.has(l.id)) invalid('Layer IDs must be unique')
  ids.add(l.id)

  if (!finite(l.x, -canvas.width, canvas.width * 2) || !finite(l.y, -canvas.height, canvas.height * 2) ||
      !finite(l.width, 1, canvas.width * 2) || !finite(l.height, 1, canvas.height * 2)) {
    invalid('Layer bounds must fit within valid canvas coordinates')
  }

  if (l.opacity !== undefined && !finite(l.opacity, 0, 1)) invalid('Opacity must be between 0 and 1')
  if (l.blendMode !== undefined && !ALLOWED_BLEND_MODES.has(l.blendMode)) invalid('Unsupported blendMode')

  if (l.gradient) {
    if (!Array.isArray(l.gradient.colors) || l.gradient.colors.length < 2 || l.gradient.colors.length > 20) {
      invalid('Gradient requires 2–20 colors')
    }
  }

  if (l.shadow) {
    if (l.shadow.blur !== undefined && !finite(l.shadow.blur, 0, 200)) invalid('Invalid shadow blur')
  }

  if (l.type === 'TEXT') {
    if ((l.text !== undefined) === (l.personField !== undefined)) invalid('Text requires exactly one literal or person binding')
    if (l.text !== undefined && (typeof l.text !== 'string' || l.text.length > 4000)) invalid('Text is too long')
    if (l.personField !== undefined && !['displayName', 'bio', 'hometown'].includes(l.personField)) invalid('Unsupported person binding')
    if (l.imageAssetId !== undefined) invalid('Text layers cannot reference images')
    if (l.pathData !== undefined) invalid('Text layers cannot contain vector paths')
    if (l.fontSize !== undefined && !finite(l.fontSize, 1, 512)) invalid('Invalid font size')
  } else if (l.type === 'IMAGE') {
    if (typeof l.imageAssetId !== 'string' || !l.imageAssetId || l.imageAssetId.length > 191) invalid('Image layers require an asset ID')
    if (l.text !== undefined || l.personField !== undefined || l.fontSize !== undefined || l.pathData !== undefined) {
      invalid('Invalid image-layer properties')
    }
  } else if (l.type === 'RECTANGLE') {
    if ((!l.fill && !l.gradient) || l.text !== undefined || l.personField !== undefined || l.imageAssetId !== undefined || l.fontSize !== undefined || l.pathData !== undefined) {
      invalid('Rectangles require a fill or gradient without text/image/path content')
    }
  } else if (l.type === 'SVG' || l.type === 'PATH') {
    if (typeof l.pathData !== 'string' || !l.pathData || l.pathData.length > 8000) invalid('SVG/PATH layer requires valid pathData')
    if (l.text !== undefined || l.personField !== undefined || l.imageAssetId !== undefined || l.fontSize !== undefined) {
      invalid('SVG/PATH layers cannot contain text or image references')
    }
  } else {
    invalid('Unsupported layer type')
  }

  return l
}

// Data-only composition. No HTML, script, CSS expressions, external URLs, or arbitrary bindings.
export function validateComposition(value: unknown): CardComposition {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid('Composition must be an object')
  const doc = value as CardComposition
  keys(doc, ['schemaVersion', 'canvas', 'layers', 'backComposition', 'metadata'])
  if (doc.schemaVersion !== 1 || !doc.canvas || typeof doc.canvas !== 'object') invalid('Unsupported composition version or canvas')
  keys(doc.canvas, ['width', 'height'])
  if (![doc.canvas.width, doc.canvas.height].every(n => Number.isInteger(n) && finite(n, 1, 4096))) invalid('Canvas dimensions must be 1–4096 pixels')
  if (!Array.isArray(doc.layers) || doc.layers.length > 100) invalid('A composition supports at most 100 layers')

  const ids = new Set<string>()
  for (const layer of doc.layers) {
    validateLayer(layer, doc.canvas, ids)
  }

  if (doc.backComposition) {
    if (typeof doc.backComposition !== 'object' || Array.isArray(doc.backComposition)) invalid('Back composition must be an object')
    validateComposition(doc.backComposition)
  }

  if (doc.metadata !== undefined) {
    if (typeof doc.metadata !== 'object' || Array.isArray(doc.metadata)) invalid('Metadata must be an object')
  }

  if (Buffer.byteLength(JSON.stringify(doc)) > 512_000) invalid('Composition exceeds 512 KB')
  return doc
}

export async function requireCompositionAssets(composition: CardComposition, creatorId: string) {
  const frontIds = composition.layers.flatMap(layer => layer.imageAssetId ? [layer.imageAssetId] : [])
  const backIds = composition.backComposition?.layers ? composition.backComposition.layers.flatMap(layer => layer.imageAssetId ? [layer.imageAssetId] : []) : []
  const ids = [...new Set([...frontIds, ...backIds])]
  if (ids.length === 0) return []
  const assets = await db.imageAsset.findMany({ where: { id: { in: ids }, uploadedByUserId: creatorId, deletedAt: null } })
  if (assets.length !== ids.length) throw { statusCode: 403, message: 'Composition images must belong to the design creator' }
  return assets.map(asset => ({ id: asset.id, objectKey: asset.objectKey, url: asset.url, contentType: asset.contentType, byteSize: asset.byteSize }))
}

export function resolveComposition(composition: CardComposition, person: { displayName: string; firstName: string; lastName: string; bio: string | null; hometown: string | null }): CardComposition {
  const resolvedLayers = composition.layers.map(layer => {
    if (!layer.personField) return { ...layer }
    const { personField, ...resolved } = layer
    return { ...resolved, text: (personField === 'displayName' ? personName(person) : person[personField] ?? '').slice(0, 4000) }
  })

  return {
    ...composition,
    layers: resolvedLayers,
    ...(composition.backComposition
      ? { backComposition: resolveComposition(composition.backComposition, person) }
      : {}),
  }
}
