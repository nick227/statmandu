/**
 * Curated Artwork Presets for RARE Digital Collectibles
 *
 * Ensures cards never display empty blank image areas by providing
 * curated historical, cultural, athletic, and creative photography presets
 * along with uploaded asset support.
 */

export interface ArtworkPreset {
  id: string
  label: string
  url: string
  category: string
  attribution?: string
}

export const CURATED_ARTWORKS: ArtworkPreset[] = [
  {
    id: 'art-angelou',
    label: 'Maya Angelou (Portrait)',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80',
    category: 'Literature',
    attribution: 'Literary & Cultural Portrait',
  },
  {
    id: 'art-miles',
    label: 'Miles Davis (Jazz Session)',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
    category: 'Music',
    attribution: 'Live Jazz Session',
  },
  {
    id: 'art-rudolph',
    label: 'Wilma Rudolph (Track & Field)',
    url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
    category: 'Athletics',
    attribution: 'Athletic Gold Collection',
  },
  {
    id: 'art-cyber-core',
    label: 'Cybernetic Neural Core',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
    category: 'Sci-Fi / Tech',
    attribution: 'Digital Abstract Core',
  },
  {
    id: 'art-vintage-press',
    label: 'Vintage Monograph & Press',
    url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80',
    category: 'Editorial',
    attribution: 'Historic Press Archives',
  },
  {
    id: 'art-arcade-85',
    label: 'Neon Arcade Synth',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
    category: 'Arcade',
    attribution: 'Retro Gaming CRT',
  },
  {
    id: 'art-cosmic-fantasy',
    label: 'Ethereal Mythic Realm',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
    category: 'Fantasy',
    attribution: 'Mythic Cosmos',
  },
]

export const DEFAULT_ARTWORK = CURATED_ARTWORKS[0]

export function getArtworkById(id?: string | null): ArtworkPreset | undefined {
  if (!id) return undefined
  return CURATED_ARTWORKS.find((a) => a.id === id)
}
