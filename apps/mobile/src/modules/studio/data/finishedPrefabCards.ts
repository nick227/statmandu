import type { LayoutVariant, ArtworkStyle, FinishEffect } from '@/modules/designs/flagshipDesigns'
import type { FontRole } from '@/modules/typography/textFit'

export interface FinishedPrefabCard {
  id: string
  title: string
  subtitle: string
  series: string
  badge: string
  badgeColor: string
  accentColor: string
  flagshipId: string
  cardTypeId: string
  subjectName: string
  subjectBio: string
  imageAssetId: string
  avatarUrl?: string
  contentStore: {
    input1: string // Name
    input2: string // Role / Moniker
    input3: string // The Story / Narrative
    input4: string // Highlight 1 / Milestone
    input5: string // Highlight 2 / Honor
    input6: string // Rating / Record
    [key: string]: string
  }
  appearance: {
    layoutVariant: LayoutVariant
    fontRole: FontRole
    artworkStyle: ArtworkStyle
    finishEffect: FinishEffect
    backgroundColor: string
    accentColor: string
    borderColor: string
    textColor: string
  }
}

export const FINISHED_PREFAB_CARDS: FinishedPrefabCard[] = [
  // 1. Ultra Legacy · Jerry Garcia (1-of-1 Gilded Relic Benchmark)
  {
    id: 'prefab-ultra-legacy-jerry',
    title: 'Grateful Dead · 1/1',
    subtitle: 'Jerry Garcia · Ultra Legacy',
    series: 'Ultra Legacy Series #GD-01',
    badge: '1 OF 1',
    badgeColor: '#D4AF37',
    accentColor: '#F59E0B',
    flagshipId: 'royal-heritage',
    cardTypeId: 'standard',
    subjectName: 'Jerry Garcia',
    subjectBio: 'Co-founder and lead guitarist of the Grateful Dead. Renowned for soulful improvisation, Garcia defined an era of counter-culture Americana across three decades of live touring.',
    imageAssetId: 'art-miles',
    contentStore: {
      input1: 'Jerry Garcia',
      input2: 'LEAD GUITAR · LIVE FOREVER',
      input3: 'Co-founder and lead guitarist of the Grateful Dead. Renowned for soulful improvisation, Garcia defined an era of counter-culture Americana across three decades of live touring.',
      input4: 'Rock & Roll Hall of Fame · 1994',
      input5: '60th Anniversary Ultra Legacy',
      input6: 'ARCHIVE 1-OF-1 · MINT 10',
    },
    appearance: {
      layoutVariant: 'portrait',
      fontRole: 'serif',
      artworkStyle: 'cinematic',
      finishEffect: 'metallic',
      backgroundColor: '#090A0F',
      accentColor: '#D4AF37',
      borderColor: '#F59E0B',
      textColor: '#FFFFFF',
    },
  },

  // 2. Special Illustration Rare (SAR) · Cyber Shogun (Pokémon SAR / Full-Art Benchmark)
  {
    id: 'prefab-cyber-shogun-sar',
    title: 'Cyber Shogun · SAR',
    subtitle: 'Ryuto Kurogane · Special Rare',
    series: 'Secret Illustration Rare #231/198',
    badge: 'SAR ★★★',
    badgeColor: '#00F0FF',
    accentColor: '#06B6D4',
    flagshipId: 'chrome-future',
    cardTypeId: 'stats',
    subjectName: 'Ryuto Kurogane',
    subjectBio: 'Master tactician of the 7th orbital fleet, deploying hyper-frequency plasma arrays across the neon stratosphere.',
    imageAssetId: 'art-cyber-core',
    contentStore: {
      input1: 'Ryuto Kurogane',
      input2: 'NEO-TOKYO CYBER COMMANDER',
      input3: 'Revered across orbital megacities as the architect of quantum defense grids. His neural synaptic harness operates at zero-latency synchronization with vanguard dreadnoughts.',
      input4: 'Grand Master Champion · 2026',
      input5: 'Secret Illustration #231/198',
      input6: 'PLASMA CORE 99.8% · 340 HP',
    },
    appearance: {
      layoutVariant: 'editorial',
      fontRole: 'mono',
      artworkStyle: 'photographic',
      finishEffect: 'holographic',
      backgroundColor: '#0B0F19',
      accentColor: '#00F0FF',
      borderColor: '#38BDF8',
      textColor: '#FFFFFF',
    },
  },

  // 3. Cosmos Archive · Ada Lovelace (Scientific Archive Benchmark)
  {
    id: 'prefab-cosmos-ada',
    title: 'Cosmos Archive · Ada',
    subtitle: 'Ada Lovelace · Scientific Gem',
    series: 'Scientific Heritage Series #01',
    badge: 'COSMOS HOLO',
    badgeColor: '#D97706',
    accentColor: '#B45309',
    flagshipId: 'museum-archive',
    cardTypeId: 'standard',
    subjectName: 'Ada Lovelace',
    subjectBio: 'Mathematician and writer, chiefly known for her work on the Analytical Engine and widely considered the first computer programmer.',
    imageAssetId: 'art-cyber-core',
    contentStore: {
      input1: 'Ada Lovelace',
      input2: 'FIRST COMPUTER PROGRAMMER',
      input3: 'Published the first algorithm intended to be carried out by a machine. Her visionary insight foresaw that computers could manipulate symbols beyond mere mathematical calculations.',
      input4: 'Analytical Engine Algorithm · 1843',
      input5: 'Pioneer of Modern Computing',
      input6: 'ARCHIVE ALGORITHM · MINT 10',
    },
    appearance: {
      layoutVariant: 'balanced',
      fontRole: 'serif',
      artworkStyle: 'vintage',
      finishEffect: 'textured',
      backgroundColor: '#1C160E',
      accentColor: '#D97706',
      borderColor: '#C4A47C',
      textColor: '#FBF8F3',
    },
  },

  // 4. Arcade Legends · Billy Mitchell (Retro High Score HUD)
  {
    id: 'prefab-arcade-mitchell',
    title: 'Arcade Legends · Pac-King',
    subtitle: 'Billy Mitchell · High Score',
    series: 'Retro Hall of Fame #85',
    badge: 'PERFECT 3.33M',
    badgeColor: '#EC4899',
    accentColor: '#A855F7',
    flagshipId: 'arcade-legends',
    cardTypeId: 'stats',
    subjectName: 'Billy Mitchell',
    subjectBio: 'On July 3, 1999, Mitchell achieved the world first perfect game of Pac-Man, navigating all 256 boards over six hours without losing a single life.',
    imageAssetId: 'art-rudolph',
    contentStore: {
      input1: 'Billy Mitchell',
      input2: 'GOLDEN AGE HIGH SCORER',
      input3: 'On July 3, 1999, Mitchell achieved the world first perfect game of Pac-Man, navigating all 256 boards over six hours without losing a single life.',
      input4: 'First Perfect Game in History',
      input5: 'Video Game Player of the Century',
      input6: 'SCORE: 3,333,360 · RANK #1',
    },
    appearance: {
      layoutVariant: 'portrait',
      fontRole: 'display',
      artworkStyle: 'illustrated',
      finishEffect: 'holographic',
      backgroundColor: '#110B29',
      accentColor: '#EC4899',
      borderColor: '#00F0FF',
      textColor: '#FFFFFF',
    },
  },

  // 5. Modern Editorial · Zaha Hadid (Swiss Architecture Broadsheet)
  {
    id: 'prefab-editorial-hadid',
    title: 'Modern Editorial · Zaha',
    subtitle: 'Zaha Hadid · Spatial Form',
    series: 'Master Architect Monograph #04',
    badge: 'SWISS EDITORIAL',
    badgeColor: '#E11D48',
    accentColor: '#BE123C',
    flagshipId: 'modern-editorial',
    cardTypeId: 'minimal',
    subjectName: 'Zaha Hadid',
    subjectBio: 'Revolutionized 21st-century architecture with fluid computational designs that transformed cityscapes from London to Baku and Guangzhou.',
    imageAssetId: 'art-cyber-core',
    contentStore: {
      input1: 'Zaha Hadid',
      input2: 'DECONSTRUCTIVIST ARCHITECT',
      input3: 'Revolutionized 21st-century architecture with fluid computational designs that transformed cityscapes from London to Baku and Guangzhou.',
      input4: 'Pritzker Architecture Prize 2004',
      input5: 'Stirling Prize 2010 & 2011',
      input6: '950+ PROJECTS · 44 NATIONS',
    },
    appearance: {
      layoutVariant: 'editorial',
      fontRole: 'sans',
      artworkStyle: 'photographic',
      finishEffect: 'matte',
      backgroundColor: '#F8F9FA',
      accentColor: '#E11D48',
      borderColor: '#0F172A',
      textColor: '#0F172A',
    },
  },

  // 6. Psychedelic Archive · Jimi Hendrix (Liquid Fuzz Alchemy)
  {
    id: 'prefab-psychedelic-hendrix',
    title: 'Liquid Sound · Hendrix',
    subtitle: 'Jimi Hendrix · Electric Sky',
    series: 'Woodstock Legacy Archive #69',
    badge: 'PSYCHEDELIC',
    badgeColor: '#F43F5E',
    accentColor: '#F59E0B',
    flagshipId: 'psychedelic-archive',
    cardTypeId: 'standard',
    subjectName: 'Jimi Hendrix',
    subjectBio: 'Headlined Woodstock 1969 with an epochal rendition of the American anthem. Inducted into the Rock and Roll Hall of Fame as the greatest instrumentalist in rock history.',
    imageAssetId: 'art-miles',
    contentStore: {
      input1: 'Jimi Hendrix',
      input2: 'ELECTRIC SONIC WIZARD',
      input3: 'Headlined Woodstock 1969 with an epochal rendition of the American anthem. Inducted into the Rock and Roll Hall of Fame as the greatest instrumentalist in rock history.',
      input4: 'Woodstock Historic Headliner 1969',
      input5: 'Greatest Guitarist of All Time',
      input6: 'FUZZ OVERDRIVE 100% · VINTAGE',
    },
    appearance: {
      layoutVariant: 'balanced',
      fontRole: 'serif',
      artworkStyle: 'cinematic',
      finishEffect: 'metallic',
      backgroundColor: '#1A0B2E',
      accentColor: '#F43F5E',
      borderColor: '#F59E0B',
      textColor: '#FFFFFF',
    },
  },
]
