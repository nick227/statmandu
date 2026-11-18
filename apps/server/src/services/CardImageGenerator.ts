import { createHash } from 'crypto'
import { GoogleGenAI } from '@google/genai'
import sharp from 'sharp'
import { db } from '@statman/db'
import { storeImage } from '../lib/imageStorage'

const GEMINI_MODEL = 'gemini-2.5-flash-image'
const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])
const MAX_IMAGE_BYTES = Number(process.env.IMAGE_UPLOAD_MAX_BYTES ?? 5 * 1024 * 1024)
export const CARD_ARTWORK_PIXELS = { width: 1500, height: 2100 } as const

export type CardGenerationFailureCategory =
  | 'SAFETY_BLOCKED'
  | 'NO_IMAGE_RETURNED'
  | 'INVALID_RESPONSE'
  | 'NETWORK_ERROR'
  | 'UNKNOWN'

// Typed failure reason so CardService can record a real failureCategory in
// job observability instead of string-matching error messages.
export class CardGenerationError extends Error {
  category: CardGenerationFailureCategory
  constructor(category: CardGenerationFailureCategory, message: string) {
    super(message)
    this.name = 'CardGenerationError'
    this.category = category
  }
}

export type CardImageGenerationInput = {
  cardTemplateId: string
  title: string
  cardType: string
  stylePreset: string
  athleteName: string
  createdByUserId: string
  // The athlete's uploaded reference photo — when present, the generator
  // should use it to preserve likeness across pose variations rather than
  // generating a generic figure from text alone.
  sourceImageUrl?: string | null
  // Set for batch/pose-driven generation (see packages/sports' cardPoses) —
  // describes the specific stance/action to render. Falls back to a
  // generic prompt built from title/cardType/stylePreset when absent (the
  // original single-card manual flow).
  posePromptTemplate?: string | null
}

export type CardImageGenerationOutput = {
  frontImageAssetId: string
  url: string
  provider: 'STUB' | 'GEMINI'
  model: string
  prompt: string
}

export interface CardImageGenerator {
  generate(input: CardImageGenerationInput): Promise<CardImageGenerationOutput>
}

export class StubCardImageGenerator implements CardImageGenerator {
  async generate(input: CardImageGenerationInput): Promise<CardImageGenerationOutput> {
    const seed = createHash('sha256')
      .update(JSON.stringify(input))
      .digest('hex')
      .slice(0, 16)
    const prompt = buildPrompt(input)
    const objectKey = `cards/${input.cardTemplateId}/front-${seed}.png`
    const url = `statman://generated/cards/${input.cardTemplateId}/front-${seed}.png`

    const asset = await db.imageAsset.create({
      data: {
        targetType: 'CARD_TEMPLATE',
        targetId: input.cardTemplateId,
        usage: 'HERO',
        storageProvider: 'LOCAL',
        objectKey,
        url,
        originalFilename: `stub-card-${seed}.png`,
        contentType: 'image/png',
        byteSize: 0,
        uploadedByUserId: input.createdByUserId,
      },
    })

    return {
      frontImageAssetId: asset.id,
      url,
      provider: 'STUB',
      model: 'stub',
      prompt,
    }
  }
}

function buildPrompt(input: CardImageGenerationInput): string {
  const subject = input.posePromptTemplate
    ?? `Premium sports portrait artwork for ${input.athleteName}, in the "${input.stylePreset}" style, for a ${input.cardType} card titled "${input.title}". Photorealistic, dynamic composition, professional studio quality.`

  return [
    subject,
    'Create portrait artwork in an exact 5:7 aspect ratio, intended for a 1500 x 2100 pixel card.',
    'Keep the athlete and all essential action inside the upper 78 percent so the artwork can sit inside a printed card photo window.',
    'Artwork only: do not add a border, frame, nameplate, logo, text, badges, buttons, translucent panels, or other interface elements.',
  ].join(' ')
}

export async function normalizeCardArtwork(sourceBuffer: Buffer): Promise<Buffer> {
  return sharp(sourceBuffer)
    .resize(CARD_ARTWORK_PIXELS.width, CARD_ARTWORK_PIXELS.height, {
      fit: 'cover',
      position: 'attention',
    })
    .jpeg({ quality: 90, chromaSubsampling: '4:4:4' })
    .toBuffer()
}

// Real image synthesis via Google Gemini 2.5 Flash Image ("nano-banana") —
// the only model in this family that both generates images and accepts a
// reference photo as input, which is what makes likeness-preserving pose
// variations possible instead of a generic figure.
export class GeminiCardImageGenerator implements CardImageGenerator {
  private readonly client: GoogleGenAI

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey })
  }

  async generate(input: CardImageGenerationInput): Promise<CardImageGenerationOutput> {
    const prompt = buildPrompt(input)
    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [{ text: prompt }]

    if (input.sourceImageUrl) {
      const referencePhoto = await fetchImageAsInlineData(input.sourceImageUrl)
      if (referencePhoto) parts.push({ inlineData: referencePhoto })
    }

    let response: Awaited<ReturnType<GoogleGenAI['models']['generateContent']>>
    try {
      response = await this.client.models.generateContent({
        model: GEMINI_MODEL,
        contents: [{ role: 'user', parts }],
      })
    } catch (err: any) {
      throw new CardGenerationError('NETWORK_ERROR', err?.message ?? 'Gemini request failed')
    }

    // Moderation state — a blocked prompt/response never reaches "here's an
    // image", it comes back as a refusal signal instead. Check before
    // looking for image data so a safety block is reported as exactly
    // that, not as a confusing "no image returned".
    if (response.promptFeedback?.blockReason) {
      throw new CardGenerationError('SAFETY_BLOCKED', `Blocked by Gemini: ${response.promptFeedback.blockReason}`)
    }
    const candidate = response.candidates?.[0]
    if (candidate?.finishReason === 'SAFETY') {
      throw new CardGenerationError('SAFETY_BLOCKED', 'Generation blocked by Gemini safety filters')
    }

    const imagePart = candidate?.content?.parts?.find(
      (part): part is { inlineData: { mimeType: string; data: string } } => Boolean((part as any)?.inlineData?.data)
    )
    if (!imagePart) {
      throw new CardGenerationError('NO_IMAGE_RETURNED', 'Gemini did not return an image in its response')
    }

    const contentType = imagePart.inlineData.mimeType || 'image/png'
    if (!ALLOWED_IMAGE_MIME_TYPES.has(contentType)) {
      throw new CardGenerationError('INVALID_RESPONSE', `Unsupported image type returned: ${contentType}`)
    }

    const sourceBuffer = Buffer.from(imagePart.inlineData.data, 'base64')
    if (sourceBuffer.byteLength === 0) {
      throw new CardGenerationError('INVALID_RESPONSE', 'Gemini returned an empty image')
    }
    if (sourceBuffer.byteLength > MAX_IMAGE_BYTES) {
      throw new CardGenerationError('INVALID_RESPONSE', `Generated image (${sourceBuffer.byteLength} bytes) exceeds the ${MAX_IMAGE_BYTES}-byte limit`)
    }

    // Gemini's output dimensions vary by model response. Normalize every
    // result before storage so downstream card composition always receives
    // the same press-ready 5:7 artwork canvas. The final card frame and
    // name/brand plate are deliberately composed by CardFace, not painted
    // inconsistently by the generative model.
    let buffer: Buffer
    try {
      buffer = await normalizeCardArtwork(sourceBuffer)
    } catch (err: any) {
      throw new CardGenerationError('INVALID_RESPONSE', err?.message ?? 'Generated image could not be normalized')
    }

    const normalizedContentType = 'image/jpeg'
    if (buffer.byteLength > MAX_IMAGE_BYTES) {
      throw new CardGenerationError('INVALID_RESPONSE', `Normalized card artwork (${buffer.byteLength} bytes) exceeds the ${MAX_IMAGE_BYTES}-byte limit`)
    }

    const stored = await storeImage({
      buffer,
      contentType: normalizedContentType,
      targetType: 'CARD_TEMPLATE',
      targetId: input.cardTemplateId,
      usage: 'HERO',
    })

    const asset = await db.imageAsset.create({
      data: {
        targetType: 'CARD_TEMPLATE',
        targetId: input.cardTemplateId,
        usage: 'HERO',
        storageProvider: stored.provider,
        objectKey: stored.objectKey,
        url: stored.url,
        contentType: normalizedContentType,
        byteSize: buffer.byteLength,
        uploadedByUserId: input.createdByUserId,
      },
    })

    return {
      frontImageAssetId: asset.id,
      url: stored.url,
      provider: 'GEMINI',
      model: GEMINI_MODEL,
      prompt,
    }
  }
}

async function fetchImageAsInlineData(url: string): Promise<{ mimeType: string; data: string } | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const contentType = res.headers.get('content-type') ?? 'image/jpeg'
    const buffer = Buffer.from(await res.arrayBuffer())
    return { mimeType: contentType, data: buffer.toString('base64') }
  } catch (error) {
    console.warn('Failed to fetch reference photo for card generation; continuing without it', error)
    return null
  }
}

// Same "env var present -> real provider, absent -> stub" pattern
// imageStorage.ts already uses for R2 vs. local storage — dev/test never
// hard-fails just because no key is configured.
export function createCardImageGenerator(): CardImageGenerator {
  if (process.env.GEMINI_API_KEY) return new GeminiCardImageGenerator(process.env.GEMINI_API_KEY)
  return new StubCardImageGenerator()
}
