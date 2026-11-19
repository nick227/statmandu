import { createHash } from 'node:crypto'
import type { Prisma } from '@prisma/client'
import { readStoredImage } from '../lib/imageStorage'

// Digest server-owned object bytes, never client-submitted hashes or URLs.
// Only exported artwork/layers are included, not an unpublished source portrait.
export async function releaseAssetDigests(tx: Prisma.TransactionClient, release: any) {
  const ids: string[] = [...new Set<string>([...(release.templateSnapshotJson?.assetIds ?? []), ...(release.frontImageAssetId ? [release.frontImageAssetId] : [])])].sort()
  const assets = await tx.imageAsset.findMany({ where: { id: { in: ids }, deletedAt: null } })
  if (assets.length !== ids.length) throw { statusCode: 409, message: 'Release artwork is missing' }
  const digests = []
  for (const id of ids) {
    const asset = assets.find(a => a.id === id)!
    try {
      const stream = await readStoredImage(asset.objectKey)
      const hash = createHash('sha256')
      let byteSize = 0
      for await (const chunk of stream as AsyncIterable<Buffer>) {
        byteSize += chunk.length
        if (byteSize > 25 * 1024 * 1024) { (stream as any).destroy?.(); throw new Error('Asset exceeds signing limit') }
        hash.update(chunk)
      }
      if (byteSize !== asset.byteSize) throw new Error('Size mismatch')
      digests.push({ id, objectKey: asset.objectKey, contentType: asset.contentType, byteSize, sha256: hash.digest('hex') })
    } catch { throw { statusCode: 503, message: 'Release artwork could not be digested; publication was not completed' } }
  }
  return digests
}
