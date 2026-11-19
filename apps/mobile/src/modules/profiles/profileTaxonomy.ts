/**
 * RARE Universal Profile & Specialization Taxonomy
 *
 * Distinguishes an Account (the user of RARE) from a Person Profile (the subject of cards).
 * Every subject has Universal Identity information plus one or more modular Specializations.
 *
 * User attributes drive:
 * 1. Identity — Who they are.
 * 2. Discovery — Where they appear in browsing, search, and faceted recommendations.
 * 3. Content — What structured information creators can link into card fields.
 * 4. Relationships — Associated collaborators, teams, and related persons.
 */

export type SpecializationType =
  | 'ATHLETE'
  | 'MUSICIAN'
  | 'ACTOR'
  | 'WRITER'
  | 'CREATOR'
  | 'SCIENTIST'
  | 'MODEL'
  | 'HISTORICAL'

export interface SpecializationMeta {
  type: SpecializationType
  name: string
  label: string
  iconName: string
  description: string
  discoveryTags: string[]
}

export const SPECIALIZATION_METAS: Record<SpecializationType, SpecializationMeta> = {
  ATHLETE: {
    type: 'ATHLETE',
    name: 'Athlete & Competitor',
    label: 'Athletics',
    iconName: 'trophy',
    description: 'Championships, career statistics, teams, and athletic records',
    discoveryTags: ['sports', 'athletics', 'champions', 'olympians', 'records'],
  },
  MUSICIAN: {
    type: 'MUSICIAN',
    name: 'Musician & Composer',
    label: 'Music',
    iconName: 'music',
    description: 'Discography, instruments, genres, labels, and live tours',
    discoveryTags: ['music', 'jazz', 'rock', 'hip-hop', 'classical', 'producers'],
  },
  ACTOR: {
    type: 'ACTOR',
    name: 'Actor & Performer',
    label: 'Cinema & Stage',
    iconName: 'film',
    description: 'Signature roles, productions, theater, voice, and honors',
    discoveryTags: ['acting', 'cinema', 'theater', 'broadway', 'television'],
  },
  WRITER: {
    type: 'WRITER',
    name: 'Writer & Literary Artist',
    label: 'Literature',
    iconName: 'book-open',
    description: 'Published bibliography, literary genres, periodicals, and honors',
    discoveryTags: ['literature', 'poetry', 'authors', 'essayists', 'journalism'],
  },
  CREATOR: {
    type: 'CREATOR',
    name: 'Creator & Studio Director',
    label: 'Creative Arts',
    iconName: 'palette',
    description: 'Design, studio directions, digital media, and flagship productions',
    discoveryTags: ['creators', 'directors', 'digital-art', 'design', 'studios'],
  },
  SCIENTIST: {
    type: 'SCIENTIST',
    name: 'Scientist & Pioneer',
    label: 'Science & Discovery',
    iconName: 'atom',
    description: 'Breakthrough discoveries, publications, patents, and institutions',
    discoveryTags: ['science', 'physics', 'medicine', 'astronomy', 'academics'],
  },
  MODEL: {
    type: 'MODEL',
    name: 'Model & Fashion Icon',
    label: 'Fashion',
    iconName: 'sparkles',
    description: 'Runway, haute couture, signature campaigns, and editorials',
    discoveryTags: ['fashion', 'runway', 'editorial', 'haute-couture', 'styling'],
  },
  HISTORICAL: {
    type: 'HISTORICAL',
    name: 'Historical & Cultural Figure',
    label: 'Heritage & Lore',
    iconName: 'landmark',
    description: 'Epoch, societal movements, archive provenance, and legacy speeches',
    discoveryTags: ['history', 'civil-rights', 'philosophy', 'heritage', 'archives'],
  },
}

// ----------------------------------------------------------------------------
// Specialist Attribute Payloads
// ----------------------------------------------------------------------------

export interface AthleteAttributes {
  sport: string
  primaryRole?: string // e.g. "Sprinter", "Point Guard", "Quarterback"
  currentTeam?: string
  teamsPlayedFor?: string[]
  primaryStatistic?: string // e.g. "3x Olympic Gold Medalist", "10.62s 100m World Record"
  careerAccolades?: string[] // e.g. ["Olympic Champion 1960", "USATF Hall of Fame"]
  yearsActive?: string // e.g. "1956 - 1962"
}

export interface MusicianAttributes {
  primaryGenre: string
  instruments?: string[] // e.g. ["Trumpet", "Synthesizer"]
  keyReleases?: string[] // e.g. ["Kind of Blue", "Bitches Brew", "Birth of the Cool"]
  recordLabel?: string
  collaborators?: string[] // e.g. ["John Coltrane", "Bill Evans", "Herbie Hancock"]
  milestoneTourOrLiveEvent?: string // e.g. "Newport Jazz Festival 1958"
  honors?: string[] // e.g. ["Grammy Lifetime Achievement Award"]
}

export interface ActorAttributes {
  primaryMedium: string // e.g. "Cinema & Stage"
  signatureRoles?: string[] // e.g. ["Hamlet", "Michael Corleone"]
  notableProductions?: string[]
  accolades?: string[] // e.g. ["Academy Award Nominee", "Tony Award Winner"]
  representation?: string
}

export interface WriterAttributes {
  literaryGenres: string[] // e.g. ["Poetry", "Autobiography", "Memoir"]
  flagshipWorks: string[] // e.g. ["I Know Why the Caged Bird Sings", "And Still I Rise"]
  periodicalsAndPublications?: string[]
  literaryHonors?: string[] // e.g. ["Presidential Medal of Freedom", "National Book Award"]
  eraOrMovement?: string // e.g. "Civil Rights Era Literature"
}

export interface CreatorAttributes {
  creativeDomains: string[] // e.g. ["Visual Design", "Documentary Film"]
  primaryStudioOrChannel?: string
  flagshipProjects?: string[]
  platforms?: string[]
  awards?: string[]
}

export interface ScientistAttributes {
  fieldOfStudy: string // e.g. "Theoretical Astrophysics"
  keyBreakthrough: string // e.g. "Pioneered calculations on black hole thermodynamics"
  institutionalAffiliations?: string[] // e.g. ["Cambridge University", "Institute for Advanced Study"]
  majorHonors?: string[] // e.g. ["Nobel Prize in Physics", "Copley Medal"]
}

export interface ModelAttributes {
  category: string // e.g. "High Fashion / Runway"
  signatureCampaigns?: string[]
  fashionHouses?: string[]
  editorialAppearances?: string[]
}

export interface HistoricalAttributes {
  epochOrEra: string // e.g. "American Civil Rights Movement · 1950s - 1960s"
  historicContribution: string // e.g. "Literary and oratorical voice for universal human dignity"
  famousQuotesOrSpeeches?: string[] // e.g. ["On the Pulse of Morning"]
  archiveProvenance?: string // e.g. "Schomburg Center for Research in Black Culture"
}

export type SpecializationPayload =
  | { type: 'ATHLETE'; attributes: AthleteAttributes }
  | { type: 'MUSICIAN'; attributes: MusicianAttributes }
  | { type: 'ACTOR'; attributes: ActorAttributes }
  | { type: 'WRITER'; attributes: WriterAttributes }
  | { type: 'CREATOR'; attributes: CreatorAttributes }
  | { type: 'SCIENTIST'; attributes: ScientistAttributes }
  | { type: 'MODEL'; attributes: ModelAttributes }
  | { type: 'HISTORICAL'; attributes: HistoricalAttributes }

// ----------------------------------------------------------------------------
// Universal Profile
// ----------------------------------------------------------------------------

export interface UniversalProfile {
  id: string
  slug: string
  displayName: string
  aliases?: string[]
  bio?: string | null
  hometown?: string | null
  originEra?: string | null
  avatarUrl?: string | null
  claimedByUserId?: string | null
  specializations: SpecializationPayload[]
  mediaAssetIds?: string[]
}

export function getSpecializationMeta(type: SpecializationType): SpecializationMeta {
  return SPECIALIZATION_METAS[type]
}

export function getAllSpecializationMetas(): SpecializationMeta[] {
  return Object.values(SPECIALIZATION_METAS)
}

// ----------------------------------------------------------------------------
// Curated Benchmark Profiles for Instant Linking & Preview
// ----------------------------------------------------------------------------

export const BENCHMARK_PROFILES: UniversalProfile[] = [
  {
    id: 'person-maya-angelou',
    slug: 'maya-angelou',
    displayName: 'Maya Angelou',
    bio: 'Celebrated poet, memoirist, and civil rights champion whose literary voice moved generations.',
    hometown: 'St. Louis, Missouri',
    originEra: 'St. Louis, Missouri · Civil Rights Era',
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
          epochOrEra: '1928 - 2014 · Civil Rights Era',
          historicContribution: 'Inaugural Presidential Poet and Champion of Human Dignity',
          archiveProvenance: 'Schomburg Center Archives',
        },
      },
    ],
  },
  {
    id: 'person-miles-davis',
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
          honors: ['Grammy Lifetime Achievement Award'],
        },
      },
    ],
  },
  {
    id: 'person-wilma-rudolph',
    slug: 'wilma-rudolph',
    displayName: 'Wilma Rudolph',
    bio: 'Overcame childhood polio to become the fastest woman in the world, capturing three gold medals at the 1960 Rome Games.',
    hometown: 'Clarksville, Tennessee',
    originEra: 'Clarksville, Tennessee · 1960 Olympic Games',
    specializations: [
      {
        type: 'ATHLETE',
        attributes: {
          sport: 'Track & Field',
          primaryRole: 'Olympic Sprinter',
          primaryStatistic: '3x Olympic Gold Medalist · 100m World Record',
          careerAccolades: ['1960 Rome Olympic Triple Champion'],
          yearsActive: '1956 - 1962',
        },
      },
    ],
  },
]

export function toUniversalProfile(person: any): UniversalProfile {
  if (!person) {
    return {
      id: '',
      slug: '',
      displayName: '',
      bio: '',
      specializations: [],
    }
  }
  if (person.specializations && Array.isArray(person.specializations) && person.specializations.length > 0) {
    return person as UniversalProfile
  }
  // Check if it matches a benchmark profile by explicit ID or non-empty displayName
  if (person.id || person.displayName) {
    const pName = (person.displayName || '').trim().toLowerCase()
    const benchmark = BENCHMARK_PROFILES.find(
      (b) => (person.id && b.id === person.id) || (pName && b.displayName.toLowerCase() === pName),
    )
    if (benchmark) return benchmark
  }

  // Otherwise return clean universal profile without mock specializations
  return {
    id: person.id || 'custom-person',
    slug: person.slug || 'custom-person',
    displayName: person.displayName || '',
    bio: person.bio || '',
    hometown: person.hometown || '',
    originEra: person.hometown ? `${person.hometown} · Era Archive` : undefined,
    avatarUrl: person.avatarUrl || null,
    specializations: [],
  }
}
