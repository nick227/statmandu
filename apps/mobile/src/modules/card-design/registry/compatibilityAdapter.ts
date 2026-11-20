import type { AuthoredDesignContract } from '../types/designContract'
import { designRegistry } from './designRegistry'
import { compileAuthoredDesign, type CompiledCardDesign } from '../compiler/compileDesign'

export function tryCompileWithAuthoredDesign(
  designId: string,
  contentStore: Record<string, string>,
  profile?: any,
  assetsList?: Array<{ id: string; url: string }>,
  selectedImageId?: string,
): CompiledCardDesign | null {
  const authored = designRegistry.get(designId)
  if (!authored) return null

  return compileAuthoredDesign(authored, {
    content: contentStore,
    person: profile,
    imageAssetId: selectedImageId,
    assets: assetsList,
  })
}
