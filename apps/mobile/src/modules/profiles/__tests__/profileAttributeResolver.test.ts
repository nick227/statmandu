import {
  resolveProfileAttributeForField,
  buildBoundCardFields,
} from '../profileAttributeResolver'
import type { UniversalProfile } from '../profileTaxonomy'
import { getCardTypeById } from '@/modules/designs/cardTypes'

describe('RARE Profile Attribute Resolver & Linked Content Engine', () => {
  const milesDavisProfile: UniversalProfile = {
    id: 'person-miles',
    slug: 'miles-davis',
    displayName: 'Miles Davis',
    bio: 'Pioneered modal jazz, hard bop, and jazz-rock fusion with groundbreaking albums Kind of Blue and Bitches Brew.',
    hometown: 'Alton, Illinois',
    originEra: 'Alton, Illinois · Mid-Century Jazz Era',
    specializations: [
      {
        type: 'MUSICIAN',
        attributes: {
          primaryGenre: 'Jazz',
          instruments: ['Trumpet', 'Synthesizer'],
          keyReleases: ['Kind of Blue', 'Bitches Brew', 'Birth of the Cool'],
          honors: ['Grammy Lifetime Achievement Award', 'Rock and Roll Hall of Fame'],
        },
      },
    ],
  }

  const wilmaRudolphProfile: UniversalProfile = {
    id: 'person-wilma',
    slug: 'wilma-rudolph',
    displayName: 'Wilma Rudolph',
    bio: 'Overcame childhood polio to become the fastest woman in the world, capturing three Olympic gold medals at the 1960 Rome Games.',
    hometown: 'Clarksville, Tennessee',
    originEra: 'Clarksville, Tennessee · 1960 Olympic Era',
    specializations: [
      {
        type: 'ATHLETE',
        attributes: {
          sport: 'Track & Field',
          primaryRole: 'Olympic Sprinter',
          primaryStatistic: '3x Olympic Gold Medalist · 100m World Record',
          careerAccolades: ['1960 Rome Olympic Triple Champion', 'National Track & Field Hall of Fame'],
          yearsActive: '1956 - 1962',
        },
      },
    ],
  }

  // Multi-specialist: Maya Angelou (Author + Historical Cultural Figure)
  const mayaAngelouProfile: UniversalProfile = {
    id: 'person-maya',
    slug: 'maya-angelou',
    displayName: 'Maya Angelou',
    bio: 'Celebrated poet, memoirist, and civil rights champion whose literary voice and presidential recitations moved generations.',
    hometown: 'St. Louis, Missouri',
    specializations: [
      {
        type: 'WRITER',
        attributes: {
          literaryGenres: ['Poetry', 'Autobiography'],
          flagshipWorks: ['I Know Why the Caged Bird Sings', 'And Still I Rise'],
          literaryHonors: ['Presidential Medal of Freedom', 'National Medal of Arts'],
        },
      },
      {
        type: 'HISTORICAL',
        attributes: {
          epochOrEra: 'Civil Rights Movement · 1928 - 2014',
          historicContribution: 'Inaugural Presidential Poet and Voice for Human Dignity',
          archiveProvenance: 'Schomburg Center Archives',
        },
      },
    ],
  }

  describe('Deterministic Profile Attribute Resolution', () => {
    test('resolves Musician profile attributes into Profile card fields', () => {
      const cardType = getCardTypeById('profile')
      const bound = buildBoundCardFields(cardType, milesDavisProfile, ['input1', 'input2', 'input3'])

      expect(bound[0].effectiveValue).toBe('Miles Davis')
      expect(bound[0].isLinked).toBe(true)
      expect(bound[0].linkedSourceLabel).toBe('Profile Name')

      expect(bound[1].effectiveValue).toBe('JAZZ · MUSICIAN')
      expect(bound[1].isLinked).toBe(true)

      expect(bound[2].effectiveValue).toContain('Pioneered modal jazz')
      expect(bound[2].isLinked).toBe(true)
    })

    test('resolves Athlete profile attributes into Sports card fields', () => {
      const cardType = getCardTypeById('sports')
      const bound = buildBoundCardFields(cardType, wilmaRudolphProfile, ['input1', 'input2', 'input3'])

      expect(bound[0].effectiveValue).toBe('Wilma Rudolph')
      expect(bound[1].effectiveValue).toBe('TRACK & FIELD · OLYMPIC SPRINTER')
      expect(bound[2].effectiveValue).toBe('3x Olympic Gold Medalist · 100m World Record')
    })

    test('resolves Multi-specialist profile attributes into Achievement card fields', () => {
      const cardType = getCardTypeById('achievement')
      const bound = buildBoundCardFields(cardType, mayaAngelouProfile, ['input1', 'input2', 'input3'])

      // Achievement field extracts honors from Writer specialization
      expect(bound[0].effectiveValue).toBe('Presidential Medal of Freedom')
      expect(bound[1].effectiveValue).toBe('Maya Angelou')
      expect(bound[2].effectiveValue).toContain('Celebrated poet')
    })
  })

  describe('Linked State & Custom Overrides', () => {
    test('retains creator override without overwriting profile data', () => {
      const cardType = getCardTypeById('profile')
      const overrides = {
        input2: 'LEGENDARY JAZZ TRUMPETER & INNOVATOR (CUSTOM)',
      }

      const bound = buildBoundCardFields(
        cardType,
        milesDavisProfile,
        ['input1', 'input2', 'input3'],
        overrides,
      )

      // Field 1 is still linked
      expect(bound[0].isLinked).toBe(true)
      expect(bound[0].effectiveValue).toBe('Miles Davis')

      // Field 2 has custom override
      expect(bound[1].isLinked).toBe(false)
      expect(bound[1].overrideValue).toBe('LEGENDARY JAZZ TRUMPETER & INNOVATOR (CUSTOM)')
      expect(bound[1].effectiveValue).toBe('LEGENDARY JAZZ TRUMPETER & INNOVATOR (CUSTOM)')
      // Underlying linkedValue is still preserved
      expect(bound[1].linkedValue).toBe('JAZZ · MUSICIAN')
    })

    test('clearing override restores synchronized profile value', () => {
      const cardType = getCardTypeById('profile')
      // Empty overrides
      const bound = buildBoundCardFields(cardType, milesDavisProfile, ['input1', 'input2', 'input3'], {})

      expect(bound[1].isLinked).toBe(true)
      expect(bound[1].effectiveValue).toBe('JAZZ · MUSICIAN')
    })
  })
})
