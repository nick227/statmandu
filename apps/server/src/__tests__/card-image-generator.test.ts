import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { CARD_ARTWORK_PIXELS, normalizeCardArtwork } from '../services/CardImageGenerator'

describe('card image geometry', () => {
  it('normalizes generated artwork to the canonical 1500 x 2100 portrait canvas', async () => {
    const source = await sharp({
      create: { width: 800, height: 600, channels: 3, background: '#336699' },
    })
      .png()
      .toBuffer()

    const result = await normalizeCardArtwork(source)
    const metadata = await sharp(result).metadata()

    expect(metadata.width).toBe(CARD_ARTWORK_PIXELS.width)
    expect(metadata.height).toBe(CARD_ARTWORK_PIXELS.height)
    expect(metadata.format).toBe('jpeg')
  })
})

