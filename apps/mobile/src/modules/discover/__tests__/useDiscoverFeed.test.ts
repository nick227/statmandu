import { DISCOVER_CATEGORIES } from '../useDiscoverFeed'

describe('Discover Categories and Verification', () => {
  it('defines the required product categories including sports as a peer category', () => {
    expect(DISCOVER_CATEGORIES).toContain('All')
    expect(DISCOVER_CATEGORIES).toContain('Music')
    expect(DISCOVER_CATEGORIES).toContain('Film')
    expect(DISCOVER_CATEGORIES).toContain('Art')
    expect(DISCOVER_CATEGORIES).toContain('Comedy')
    expect(DISCOVER_CATEGORIES).toContain('Gaming')
    expect(DISCOVER_CATEGORIES).toContain('Science')
    expect(DISCOVER_CATEGORIES).toContain('Business')
    expect(DISCOVER_CATEGORIES).toContain('Sports')
  })

  it('keeps sports as a browsable category rather than top-level persistent chrome', () => {
    const sportsIndex = DISCOVER_CATEGORIES.indexOf('Sports')
    expect(sportsIndex).toBeGreaterThan(0)
    expect(DISCOVER_CATEGORIES[0]).toBe('All')
  })
})
