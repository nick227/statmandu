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
    test('resolves Musician profile attributes into Standard card fields', () => {
      const cardType = getCardTypeById('standard')
      const bound = buildBoundCardFields(cardType, milesDavisProfile, ['input1', 'input2', 'input3', 'input4'])

      expect(bound[0].effectiveValue).toBe('Miles Davis')
      expect(bound[0].isLinked).toBe(true)
      expect(bound[0].linkedSourceLabel).toBe('Profile Name')

      expect(bound[1].effectiveValue).toBe('JAZZ · MUSICIAN')
      expect(bound[1].isLinked).toBe(true)

      expect(bound[2].effectiveValue).toBe('Alton, Illinois · Mid-Century Jazz Era')
      expect(bound[2].isLinked).toBe(true)

      expect(bound[3].effectiveValue).toContain('Pioneered modal jazz')
      expect(bound[3].isLinked).toBe(true)
    })

    test('resolves Athlete profile attributes into Stats card fields', () => {
      const cardType = getCardTypeById('stats')
      const bound = buildBoundCardFields(cardType, wilmaRudolphProfile, ['input1', 'input2', 'input3', 'input4'])

      expect(bound[0].effectiveValue).toBe('Wilma Rudolph')
      expect(bound[1].effectiveValue).toBe('TRACK & FIELD')
      expect(bound[2].effectiveValue).toBe('3x Olympic Gold Medalist · 100m World Record')
    })

    test('resolves Writer profile attributes into Minimal card fields', () => {
      const cardType = getCardTypeById('minimal')
      const bound = buildBoundCardFields(cardType, mayaAngelouProfile, ['input1', 'input2', 'input3'])

      // Primary field is title (flagship work), secondary is artist (display name)
      expect(bound[0].effectiveValue).toBe('I Know Why the Caged Bird Sings')
      expect(bound[1].effectiveValue).toBe('Maya Angelou')
    })
  })

  describe('Linked State & Custom Overrides', () => {
    test('retains creator override without overwriting profile data', () => {
      const cardType = getCardTypeById('standard')
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
      const cardType = getCardTypeById('standard')
      // Empty overrides
      const bound = buildBoundCardFields(cardType, milesDavisProfile, ['input1', 'input2', 'input3'], {})

      expect(bound[1].isLinked).toBe(true)
      expect(bound[1].effectiveValue).toBe('JAZZ · MUSICIAN')
    })

    test('dynamically links Minimal card to active profile and provides generic instructional placeholders', () => {
      const minimalCardType = getCardTypeById('minimal')
      const minimalFields = buildBoundCardFields(minimalCardType, milesDavisProfile, ['input1', 'input2', 'input3'])
      expect(minimalFields[0].effectiveValue).toBe('Kind of Blue')
      expect(minimalFields[0].placeholder).toBe('Enter artwork or subject title...')
      expect(minimalFields[1].effectiveValue).toBe('Miles Davis')
      expect(minimalFields[1].placeholder).toBe('Enter creator or artist name...')
    })

    test('resolves missing profile attributes to empty string and never mock data', () => {
      const minimalProfile: UniversalProfile = {
        id: 'person-custom',
        slug: 'custom-person',
        displayName: 'Custom Explorer',
        specializations: [],
      }

      const cardType = getCardTypeById('standard')
      const fields = buildBoundCardFields(cardType, minimalProfile, ['input1', 'input2', 'input3', 'input4'])

      expect(fields[0].effectiveValue).toBe('Custom Explorer')
      expect(fields[1].effectiveValue).toBe('') // calling is empty
      expect(fields[2].effectiveValue).toBe('') // location is empty
      expect(fields[3].effectiveValue).toBe('') // bio is empty
    })

    test('handles unselected/blank profile cleanly with empty values and instructional placeholders', () => {
      const cardType = getCardTypeById('standard')
      const fields = buildBoundCardFields(cardType, null, ['input1', 'input2', 'input3', 'input4'])

      expect(fields[0].effectiveValue).toBe('')
      expect(fields[0].placeholder).toBe('Enter subject or person name...')
      expect(fields[1].effectiveValue).toBe('')
      expect(fields[1].placeholder).toBe('e.g. Architect, Musician, Athlete')
      expect(fields[2].effectiveValue).toBe('')
      expect(fields[2].placeholder).toBe('e.g. City, Country, or Historic Era')
      expect(fields[3].effectiveValue).toBe('')
      expect(fields[3].placeholder).toBe('Brief biographical statement...')
    })
  })
})
