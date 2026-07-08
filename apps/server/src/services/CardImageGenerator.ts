import { createHash } from 'crypto'
import { db } from '@statman/db'

export type CardImageGenerationInput = {
  cardTemplateId: string
  title: string
  cardType: string
  stylePreset: string
  athleteName: string
  createdByUserId: string
}

export type CardImageGenerationOutput = {
  frontImageAssetId: string
  url: string
  provider: 'STUB'
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
    const prompt = `${input.stylePreset} ${input.cardType} card for ${input.athleteName}: ${input.title}`
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
      prompt,
    }
  }
}
