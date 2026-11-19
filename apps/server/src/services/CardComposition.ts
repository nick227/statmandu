import { db } from '@statman/db'
import { personName } from './PersonService'

export const COMPOSITION_RENDERER = 'rdc-composition-v1'
export type CompositionLayer = {
  id: string
  type: 'TEXT' | 'IMAGE' | 'RECTANGLE'
  x: number
  y: number
  width: number
  height: number
  text?: string
  personField?: 'displayName' | 'bio' | 'hometown'
  imageAssetId?: string
  fill?: string
  fontSize?: number
}
export type CardComposition = {
  schemaVersion: 1
  canvas: { width: number; height: number }
  layers: CompositionLayer[]
}

function invalid(message: string): never { throw { statusCode: 400, message } }
function keys(value: object, allowed: string[]) {
  if (Object.keys(value).some(key => !allowed.includes(key))) invalid('Unsupported composition property')
}
function finite(value: unknown, min: number, max: number) {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max
}

// Data-only composition. No HTML, script, CSS expressions, external URLs, or arbitrary bindings.
export function validateComposition(value: unknown): CardComposition {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid('Composition must be an object')
  const doc = value as CardComposition
  keys(doc, ['schemaVersion', 'canvas', 'layers'])
  if (doc.schemaVersion !== 1 || !doc.canvas || typeof doc.canvas !== 'object') invalid('Unsupported composition version or canvas')
  keys(doc.canvas, ['width', 'height'])
  if (![doc.canvas.width, doc.canvas.height].every(n => Number.isInteger(n) && finite(n, 1, 4096))) invalid('Canvas dimensions must be 1–4096 pixels')
  if (!Array.isArray(doc.layers) || doc.layers.length > 100) invalid('A composition supports at most 100 layers')
  const ids = new Set<string>()
  for (const layer of doc.layers) {
    if (!layer || typeof layer !== 'object' || Array.isArray(layer)) invalid('Invalid layer')
    keys(layer, ['id', 'type', 'x', 'y', 'width', 'height', 'text', 'personField', 'imageAssetId', 'fill', 'fontSize'])
    if (typeof layer.id !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(layer.id) || ids.has(layer.id)) invalid('Layer IDs must be unique')
    ids.add(layer.id)
    if (!finite(layer.x, 0, doc.canvas.width) || !finite(layer.y, 0, doc.canvas.height) || !finite(layer.width, 1, doc.canvas.width) || !finite(layer.height, 1, doc.canvas.height) || layer.x + layer.width > doc.canvas.width || layer.y + layer.height > doc.canvas.height) invalid('Layer bounds must fit the canvas')
    if (layer.fill !== undefined && (typeof layer.fill !== 'string' || !/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(layer.fill))) invalid('Fill must be a hex color')
    if (layer.fontSize !== undefined && !finite(layer.fontSize, 1, 512)) invalid('Invalid font size')
    if (layer.type === 'TEXT') {
      if ((layer.text !== undefined) === (layer.personField !== undefined)) invalid('Text requires exactly one literal or person binding')
      if (layer.text !== undefined && (typeof layer.text !== 'string' || layer.text.length > 4000)) invalid('Text is too long')
      if (layer.personField !== undefined && !['displayName', 'bio', 'hometown'].includes(layer.personField)) invalid('Unsupported person binding')
      if (layer.imageAssetId !== undefined) invalid('Text layers cannot reference images')
    } else if (layer.type === 'IMAGE') {
      if (typeof layer.imageAssetId !== 'string' || !layer.imageAssetId || layer.imageAssetId.length > 191) invalid('Image layers require an asset ID')
      if (layer.text !== undefined || layer.personField !== undefined || layer.fontSize !== undefined) invalid('Invalid image-layer properties')
    } else if (layer.type === 'RECTANGLE') {
      if (!layer.fill || layer.text !== undefined || layer.personField !== undefined || layer.imageAssetId !== undefined || layer.fontSize !== undefined) invalid('Rectangles require a fill and geometry only')
    } else invalid('Unsupported layer type')
  }
  if (Buffer.byteLength(JSON.stringify(doc)) > 256_000) invalid('Composition exceeds 256 KB')
  return doc
}

export async function requireCompositionAssets(composition: CardComposition, creatorId: string) {
  const ids = [...new Set(composition.layers.flatMap(layer => layer.imageAssetId ? [layer.imageAssetId] : []))]
  const assets = await db.imageAsset.findMany({ where: { id: { in: ids }, uploadedByUserId: creatorId, deletedAt: null } })
  if (assets.length !== ids.length) throw { statusCode: 403, message: 'Composition images must belong to the design creator' }
  return assets.map(asset => ({ id: asset.id, objectKey: asset.objectKey, url: asset.url, contentType: asset.contentType, byteSize: asset.byteSize }))
}

export function resolveComposition(composition: CardComposition, person: { displayName: string; firstName: string; lastName: string; bio: string | null; hometown: string | null }): CardComposition {
  return {
    ...composition,
    layers: composition.layers.map(layer => {
      if (!layer.personField) return { ...layer }
      const { personField, ...resolved } = layer
      return { ...resolved, text: (personField === 'displayName' ? personName(person) : person[personField] ?? '').slice(0, 4000) }
    }),
  }
}
