import type { FixtureSubject } from '../../types/fixtures'

export const FIXTURE_JERRY_GARCIA: FixtureSubject = {
  id: 'fixture-jerry-garcia',
  label: 'Jerry Garcia (1-of-1 Relic Benchmark)',
  description: 'Grateful Dead lead guitar, ultra legacy anniversary edition with 1965-2025 milestone.',
  imageAssetId: 'art-jerry',
  content: {
    input1: 'Jerry Garcia',
    input2: 'LEAD GUITAR · LIVE FOREVER',
    input3: 'Co-founder and lead guitarist of the Grateful Dead. Renowned for soulful improvisation, Garcia defined an era of counter-culture Americana across three decades of live touring.',
    input4: 'Rock & Roll Hall of Fame · 1994',
    input5: '60th Anniversary Ultra Legacy',
    input6: 'ARCHIVE SPECIFICATION · PROTOTYPE 01',
  },
  person: {
    displayName: 'Jerry Garcia',
    bio: 'Legendary improvisational guitarist, singer, and songwriter for the Grateful Dead.',
    hometown: 'San Francisco, CA',
  },
}

export const FIXTURE_MILES_DAVIS: FixtureSubject = {
  id: 'fixture-miles-davis',
  label: 'Miles Davis (Modal Jazz Master)',
  description: 'Pioneered modal jazz, hard bop, and fusion across five decades of recorded mastery.',
  imageAssetId: 'art-miles',
  content: {
    input1: 'Miles Dewey Davis III',
    input2: 'JAZZ PIONEER & INNOVATOR',
    input3: 'Revolutionized trumpet and modern composition with Kind of Blue, Bitches Brew, and Sketches of Spain.',
    input4: 'Grammy Lifetime Achievement',
    input5: 'Rock & Roll Hall of Fame · 2006',
    input6: 'CHRONICLE #01 · MASTER SERIES',
  },
  person: {
    displayName: 'Miles Davis',
    bio: 'American jazz trumpeter, bandleader, and composer.',
    hometown: 'Alton, IL',
  },
}

export const FIXTURE_LONG_NAME: FixtureSubject = {
  id: 'fixture-long-name',
  label: 'Long Subject Name & Multi-Line Subtitle',
  description: 'Tests layout containment, dynamic font fitting, and multi-line wrapping in plaques.',
  imageAssetId: 'art-angelou',
  content: {
    input1: 'Dr. Marguerite Annie Johnson (Maya Angelou)',
    input2: 'PRESIDENTIAL MEDAL OF FREEDOM · POET LAUREATE',
    input3: 'Phenomenal Woman, presidential inauguration poet, civil rights champion, and Pulitzer Prize nominee whose literary voice inspired generations worldwide.',
    input4: 'National Medal of Arts · 2000',
    input5: 'Lincoln Medal Honoree · 2008',
    input6: 'HISTORIC ARCHIVE · ED. 001',
  },
  person: {
    displayName: 'Maya Angelou',
    bio: 'American memoirist, popular poet, and civil rights activist.',
    hometown: 'St. Louis, MO',
  },
}

export const PRESTIGE_GOLD_FIXTURES: FixtureSubject[] = [
  FIXTURE_JERRY_GARCIA,
  FIXTURE_MILES_DAVIS,
  FIXTURE_LONG_NAME,
]
