import { createReadStream } from 'fs'
import { mkdir, stat, writeFile } from 'fs/promises'
import { extname, join, resolve } from 'path'
import { randomUUID } from 'crypto'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

export type StoredImage = {
  provider: 'LOCAL' | 'R2' | 'RAILWAY_VOLUME'
  objectKey: string
  url: string
}

type StoreImageInput = {
  buffer: Buffer
  contentType: string
  originalFilename?: string
  targetType: string
  targetId: string
  usage: string
}

const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL ?? `http://localhost:${process.env.PORT ?? 3001}`).replace(/\/$/, '')
const R2_PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, '')

function localImageRoot() {
  const railwayRoot = process.env.RAILWAY_VOLUME_MOUNT_PATH
  return resolve(process.env.IMAGE_STORAGE_DIR ?? (railwayRoot ? join(railwayRoot, 'uploads/images') : 'uploads/images'))
}

function r2Client() {
  if (!process.env.R2_ENDPOINT || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) return null
  return new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  })
}

function extensionFor(contentType: string, originalFilename?: string) {
  const originalExt = originalFilename ? extname(originalFilename).toLowerCase() : ''
  if (['.jpg', '.jpeg', '.png', '.webp'].includes(originalExt)) return originalExt === '.jpeg' ? '.jpg' : originalExt
  if (contentType === 'image/png') return '.png'
  if (contentType === 'image/webp') return '.webp'
  return '.jpg'
}

export async function storeImage(input: StoreImageInput): Promise<StoredImage> {
  const objectKey = [
    input.targetType.toLowerCase(),
    input.targetId,
    input.usage.toLowerCase(),
    `${Date.now()}-${randomUUID()}${extensionFor(input.contentType, input.originalFilename)}`,
  ].join('/')

  const shouldUseR2 = process.env.IMAGE_STORAGE_DRIVER === 'r2' || Boolean(process.env.R2_BUCKET)
  const client = shouldUseR2 ? r2Client() : null
  if (client && process.env.R2_BUCKET && R2_PUBLIC_BASE_URL) {
    try {
      await client.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: objectKey,
        Body: input.buffer,
        ContentType: input.contentType,
      }))
      return {
        provider: 'R2',
        objectKey,
        url: `${R2_PUBLIC_BASE_URL}/uploads/images/${objectKey}`,
      }
    } catch (error) {
      console.warn('R2 image upload failed; falling back to local volume storage', error)
    }
  }

  const imageRoot = localImageRoot()
  await mkdir(join(imageRoot, input.targetType.toLowerCase(), input.targetId, input.usage.toLowerCase()), { recursive: true })
  await writeFile(join(imageRoot, objectKey), input.buffer)

  return {
    provider: process.env.RAILWAY_VOLUME_MOUNT_PATH ? 'RAILWAY_VOLUME' : 'LOCAL',
    objectKey,
    url: `${PUBLIC_BASE_URL}/uploads/images/${objectKey}`,
  }
}

export async function readStoredImage(objectKey: string) {
  const imageRoot = localImageRoot()
  const path = resolve(imageRoot, objectKey)
  if (!path.startsWith(imageRoot)) throw { statusCode: 400, message: 'Invalid image key' }
  await stat(path)
  return createReadStream(path)
}

export function contentTypeForObjectKey(objectKey: string) {
  if (objectKey.endsWith('.png')) return 'image/png'
  if (objectKey.endsWith('.webp')) return 'image/webp'
  return 'image/jpeg'
}
