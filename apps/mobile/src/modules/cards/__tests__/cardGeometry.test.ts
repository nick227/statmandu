import { CARD_GEOMETRY } from '../cardGeometry'

describe('canonical card geometry', () => {
  it('keeps screen, artwork, trim, and bleed measurements explicit', () => {
    expect(CARD_GEOMETRY.aspectRatio).toBe(5 / 7)
    expect(CARD_GEOMETRY.displayPixels).toEqual({ width: 320, height: 448 })
    expect(CARD_GEOMETRY.interactionStageWidth).toBe(368)
    expect(CARD_GEOMETRY.artworkPixels).toEqual({ width: 1500, height: 2100 })
    expect(CARD_GEOMETRY.printInches).toEqual({ width: 2.75, height: 3.75 })
    expect(CARD_GEOMETRY.printPixels).toEqual({ width: 1650, height: 2250 })
    expect(CARD_GEOMETRY.bleedInches).toBe(0.125)
  })
})
