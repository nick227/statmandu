/**
 * RARE Card Type Definitions
 *
 * Card Type defines the content schema, fields, and informational structure of a card,
 * while Design defines the visual appearance, typography, layout, and styling.
 *
 * 10 distinct Card Types × 20 Flagship Designs = 200 possible combinations.
 */

export interface CardTypeField {
  id: string
  label: string
  defaultVal: string
  placeholder: string
  multiline?: boolean
  maxLines?: number
  required?: boolean
}

export interface CardType {
  id: string
  name: string
  description: string
  badge: string
  fields: CardTypeField[]
}

export const CARD_TYPES: CardType[] = [
  // 1. Person Profile
  {
    id: 'profile',
    name: 'Person Profile',
    description: 'Personal identity, achievements, and biography',
    badge: 'Identity',
    fields: [
      {
        id: 'name',
        label: 'Subject Name',
        defaultVal: 'MAYA ANGELOU',
        placeholder: 'e.g. Maya Angelou, Jane Doe',
        required: true,
      },
      {
        id: 'title',
        label: 'Profession / Calling',
        defaultVal: 'POET & CIVIL RIGHTS ICON',
        placeholder: 'e.g. Author, Astrophysicist, Architect',
      },
      {
        id: 'bio',
        label: 'Biographical Summary',
        defaultVal: 'Phenomenal Woman, presidential poet, and civil rights champion whose literary voice moved generations.',
        placeholder: 'Brief biography or statement...',
        multiline: true,
        maxLines: 4,
      },
      {
        id: 'origin',
        label: 'Origin & Era',
        defaultVal: 'ST. LOUIS, MISSOURI · 1928 - 2014',
        placeholder: 'e.g. Location, Era, or Affiliation',
      },
    ],
  },

  // 2. Achievement / Milestone
  {
    id: 'achievement',
    name: 'Achievement & Milestone',
    description: 'Records, accolades, awards, breakthroughs, and historic triumphs',
    badge: 'Milestone',
    fields: [
      {
        id: 'achievement',
        label: 'Milestone / Honor',
        defaultVal: 'PRESIDENTIAL MEDAL OF FREEDOM',
        placeholder: 'e.g. Nobel Prize in Physics, Pulitzer Prize',
        required: true,
      },
      {
        id: 'recipient',
        label: 'Honoree / Recipient',
        defaultVal: 'DR. MAYA ANGELOU',
        placeholder: 'Name of the recipient...',
      },
      {
        id: 'details',
        label: 'Achievement Details',
        defaultVal: 'Awarded the nation’s highest civilian honor by President Barack Obama for exemplary lifetime literary and cultural service.',
        placeholder: 'Describe the milestone...',
        multiline: true,
        maxLines: 4,
      },
      {
        id: 'dateLocation',
        label: 'Date & Venue',
        defaultVal: 'FEBRUARY 15, 2011 · THE WHITE HOUSE',
        placeholder: 'e.g. Stockholm 2024, Washington D.C.',
      },
      {
        id: 'category',
        label: 'Category / Domain',
        defaultVal: 'LITERATURE & CIVIL SERVICE',
        placeholder: 'e.g. Science, Literature, Athletics',
      },
    ],
  },

  // 3. Event / Moment
  {
    id: 'event',
    name: 'Event & Historic Moment',
    description: 'Historic gatherings, festivals, keynotes, inaugurations, and exhibitions',
    badge: 'Event',
    fields: [
      {
        id: 'eventName',
        label: 'Event Title',
        defaultVal: '53RD PRESIDENTIAL INAUGURATION',
        placeholder: 'e.g. Woodstock 1969, Apollo 11 Launch',
        required: true,
      },
      {
        id: 'presenter',
        label: 'Key Figures / Presenter',
        defaultVal: 'MAYA ANGELOU · INAUGURAL POET',
        placeholder: 'Headliners, Speakers, or Participants',
      },
      {
        id: 'description',
        label: 'Moment Narrative',
        defaultVal: 'Recitation of "On the Pulse of Morning" captivated a worldwide audience, marking the first inaugural poet reading since 1961.',
        placeholder: 'Describe the significance of the event...',
        multiline: true,
        maxLines: 4,
      },
      {
        id: 'dateLocation',
        label: 'Date & Location',
        defaultVal: 'JANUARY 20, 1993 · WASHINGTON, D.C.',
        placeholder: 'Date and venue...',
      },
      {
        id: 'edition',
        label: 'Commemorative Tag',
        defaultVal: 'OFFICIAL COMMEMORATIVE DROP',
        placeholder: 'e.g. Live Recording, Historical Archive',
      },
    ],
  },

  // 4. Artwork & Creator
  {
    id: 'creator',
    name: 'Artwork & Masterpiece',
    description: 'Paintings, sculpture, photography, architecture, and design works',
    badge: 'Artwork',
    fields: [
      {
        id: 'workTitle',
        label: 'Work Title',
        defaultVal: 'I KNOW WHY THE CAGED BIRD SINGS',
        placeholder: 'Title of the artwork or creative piece...',
        required: true,
      },
      {
        id: 'artist',
        label: 'Creator / Artist',
        defaultVal: 'MAYA ANGELOU',
        placeholder: 'Artist or creator name...',
      },
      {
        id: 'statement',
        label: 'Creative Statement / Description',
        defaultVal: 'A pioneering autobiographical masterpiece illuminating resilience, identity, and the indomitable power of the human spirit.',
        placeholder: 'Curatorial notes or artist statement...',
        multiline: true,
        maxLines: 4,
      },
      {
        id: 'mediumYear',
        label: 'Medium & Year',
        defaultVal: 'FIRST EDITION MEMOIR · RANDOM HOUSE 1969',
        placeholder: 'e.g. Oil on Canvas 1907, Vinyl LP 1959',
      },
    ],
  },

  // 5. Sports Legend
  {
    id: 'sports',
    name: 'Sports & Athletic Legend',
    description: 'Championships, player statlines, franchises, and hall of fame careers',
    badge: 'Athletics',
    fields: [
      {
        id: 'athleteName',
        label: 'Athlete Name',
        defaultVal: 'WILMA RUDOLPH',
        placeholder: 'Player or athlete name...',
        required: true,
      },
      {
        id: 'team',
        label: 'Team / Discipline',
        defaultVal: 'USA TRACK & FIELD · SPRINTING',
        placeholder: 'Team, nation, or position...',
      },
      {
        id: 'highlights',
        label: 'Career Highlights',
        defaultVal: 'Overcame childhood paralysis to become the world’s fastest woman, sweeping three sprint gold medals at the 1960 Olympic Games.',
        placeholder: 'Career summary, championships, records...',
        multiline: true,
        maxLines: 4,
      },
      {
        id: 'stat1',
        label: 'Primary Stat',
        defaultVal: '3x OLYMPIC GOLD',
        placeholder: 'e.g. 6x NBA CHAMPION, 762 HOME RUNS',
      },
      {
        id: 'stat2',
        label: 'Era / Season',
        defaultVal: '1960 ROME GAMES',
        placeholder: 'e.g. 1996 - 2016, 2024 MVP',
      },
      {
        id: 'badge',
        label: 'Honor / Recognition',
        defaultVal: 'USATF HALL OF FAME',
        placeholder: 'e.g. Hall of Fame, All-Star',
      },
    ],
  },

  // 6. Publication & Press
  {
    id: 'publication',
    name: 'Publication & Feature',
    description: 'Magazine covers, investigative journalism, essays, and front page press',
    badge: 'Press',
    fields: [
      {
        id: 'headline',
        label: 'Cover Headline',
        defaultVal: 'THE VOICE OF RESILIENCE',
        placeholder: 'Feature headline or title...',
        required: true,
      },
      {
        id: 'deck',
        label: 'Sub-deck / Subject',
        defaultVal: 'DR. MAYA ANGELOU ON COURAGE & LITERATURE',
        placeholder: 'Subject or secondary teaser...',
      },
      {
        id: 'excerpt',
        label: 'Story Excerpt',
        defaultVal: 'Courage is the most important of all the virtues because without courage, you cannot practice any other virtue consistently.',
        placeholder: 'Lead paragraph or story excerpt...',
        multiline: true,
        maxLines: 4,
      },
      {
        id: 'issue',
        label: 'Issue & Date',
        defaultVal: 'SPECIAL EDITION · VOL. 24 NO. 8',
        placeholder: 'Volume, issue, date...',
      },
    ],
  },

  // 7. Quote & Manifesto
  {
    id: 'manifesto',
    name: 'Quote & Manifesto',
    description: 'Memorable aphorisms, philosophical insights, and influential doctrines',
    badge: 'Wisdom',
    fields: [
      {
        id: 'quote',
        label: 'Core Quote',
        defaultVal: '"STILL I RISE"',
        placeholder: 'The core quote or thesis...',
        required: true,
      },
      {
        id: 'speaker',
        label: 'Speaker / Author',
        defaultVal: 'MAYA ANGELOU',
        placeholder: 'Speaker or thinker...',
      },
      {
        id: 'context',
        label: 'Reflection / Context',
        defaultVal: 'You may write me down in history with your bitter, twisted lies. You may trod me in the very dirt, but still, like dust, I’ll rise.',
        placeholder: 'Extended quote or contextual background...',
        multiline: true,
        maxLines: 4,
      },
      {
        id: 'citation',
        label: 'Citation / Year',
        defaultVal: 'AND STILL I RISE · PUBLISHED 1978',
        placeholder: 'Source work, date, or speech...',
      },
    ],
  },

  // 8. Character & Lore
  {
    id: 'lore',
    name: 'Character & Mythic Lore',
    description: 'Fictional avatars, graphic novel heroes, game characters, and mythology',
    badge: 'Fiction',
    fields: [
      {
        id: 'alias',
        label: 'Character / Alias',
        defaultVal: 'PHOENIX ARCHIVIST',
        placeholder: 'Hero name or alias...',
        required: true,
      },
      {
        id: 'faction',
        label: 'Faction / Realm',
        defaultVal: 'ORDER OF CHRONOMANCERS',
        placeholder: 'Class, realm, or allegiance...',
      },
      {
        id: 'lore',
        label: 'Origin Lore & Abilities',
        defaultVal: 'Keeper of lost civilizations and eternal resonance. Commands ethereal archives across the dimensional fabric of time.',
        placeholder: 'Character backstory and powers...',
        multiline: true,
        maxLines: 4,
      },
      {
        id: 'rarity',
        label: 'Rarity / Tier',
        defaultVal: 'MYTHIC LEGENDARY · TIER 5',
        placeholder: 'e.g. Ultra Rare, Tier 1',
      },
    ],
  },

  // 9. Tech & Systems Spec
  {
    id: 'tech',
    name: 'Tech & Telemetry Spec',
    description: 'System architectures, patents, cybernetic agents, and node manifests',
    badge: 'Tech',
    fields: [
      {
        id: 'systemName',
        label: 'System / Agent ID',
        defaultVal: 'NEURAL-CORE // V9.4',
        placeholder: 'System code or prototype ID...',
        required: true,
      },
      {
        id: 'role',
        label: 'Classification & Role',
        defaultVal: 'QUANTUM SYNTHESIS ENGINE',
        placeholder: 'Classification or protocol...',
      },
      {
        id: 'telemetry',
        label: 'Telemetry Readout',
        defaultVal: 'Operating at nominal threshold. Continuous cognitive indexing across 4096 distributed memory partitions.',
        placeholder: 'Diagnostic log or technical overview...',
        multiline: true,
        maxLines: 4,
      },
      {
        id: 'nodeHash',
        label: 'Node Hash / Port',
        defaultVal: 'NODE-0x7F // SHA256-VALIDATED',
        placeholder: 'Hash, endpoint, or serial...',
      },
      {
        id: 'clearance',
        label: 'Clearance Level',
        defaultVal: 'CLEARANCE LEVEL-A',
        placeholder: 'Security clearance or tier...',
      },
    ],
  },

  // 10. Memorabilia & Relic
  {
    id: 'relic',
    name: 'Memorabilia & Relic',
    description: 'Tickets, vintage photography, tokens, polaroid moments, and artifacts',
    badge: 'Relic',
    fields: [
      {
        id: 'caption',
        label: 'Memory Caption',
        defaultVal: 'SUMMER OF RESILIENCE',
        placeholder: 'Handwritten-style note or caption...',
        required: true,
      },
      {
        id: 'provenance',
        label: 'Provenance & Archive',
        defaultVal: 'PRIVATE COLLECTION · ARCHIVE #104',
        placeholder: 'Source, venue, or personal note...',
      },
      {
        id: 'chronicle',
        label: 'Historical Chronicle',
        defaultVal: 'Preserved authentic analogue recording from the personal collection of the family foundation.',
        placeholder: 'Story of how this piece was created or discovered...',
        multiline: true,
        maxLines: 4,
      },
      {
        id: 'serial',
        label: 'Catalog Serial',
        defaultVal: 'AUTHENTIC DROP · SERIES 01',
        placeholder: 'Serial or accession number...',
      },
    ],
  },
]

export function getCardTypeById(id: string): CardType {
  return CARD_TYPES.find((t) => t.id === id) || CARD_TYPES[0]
}

/**
 * Maps a CardType's fields to the positional slots of a FlagshipDesign.
 *
 * Each design defines an array of positional inputs (e.g. input1, input2, input3...).
 * The mapping layer connects cardType.fields[i] -> design.inputs[i].
 */
export function mapCardTypeToDesignSlots(
  cardType: CardType,
  designSlotIds: string[],
): Array<{
  slotId: string
  field: CardTypeField
  isMapped: boolean
}> {
  return designSlotIds.map((slotId, index) => {
    const field = cardType.fields[index] || {
      id: `slot_${index + 1}`,
      label: `Detail ${index + 1}`,
      defaultVal: '',
      placeholder: '',
    }
    return {
      slotId,
      field,
      isMapped: index < cardType.fields.length,
    }
  })
}
