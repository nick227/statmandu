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
        defaultVal: '',
        placeholder: 'Enter subject or person name...',
        required: true,
      },
      {
        id: 'title',
        label: 'Profession / Calling',
        defaultVal: '',
        placeholder: 'e.g. Author, Engineer, Athlete',
      },
      {
        id: 'bio',
        label: 'Biographical Summary',
        defaultVal: '',
        placeholder: 'Brief biography or statement...',
        multiline: true,
        maxLines: 4,
      },
      {
        id: 'origin',
        label: 'Origin & Era',
        defaultVal: '',
        placeholder: 'e.g. City, Country, or Historic Era',
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
        id: 'recipient',
        label: 'Honoree / Subject Name',
        defaultVal: '',
        placeholder: 'Enter recipient or honoree name...',
        required: true,
      },
      {
        id: 'achievement',
        label: 'Milestone / Honor',
        defaultVal: '',
        placeholder: 'e.g. Championship, Award, Breakthrough',
      },
      {
        id: 'details',
        label: 'Achievement Details',
        defaultVal: '',
        placeholder: 'Describe the milestone or achievement...',
        multiline: true,
        maxLines: 4,
      },
      {
        id: 'dateLocation',
        label: 'Date & Venue',
        defaultVal: '',
        placeholder: 'e.g. City, Venue, or Year',
      },
      {
        id: 'category',
        label: 'Category / Domain',
        defaultVal: '',
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
        id: 'presenter',
        label: 'Presenter / Key Figure',
        defaultVal: '',
        placeholder: 'Enter speakers, headliners, or presenter...',
        required: true,
      },
      {
        id: 'eventName',
        label: 'Event Title',
        defaultVal: '',
        placeholder: 'e.g. Historic Gathering, Keynote, Festival',
      },
      {
        id: 'description',
        label: 'Moment Narrative',
        defaultVal: '',
        placeholder: 'Describe the significance of the event...',
        multiline: true,
        maxLines: 4,
      },
      {
        id: 'dateLocation',
        label: 'Date & Location',
        defaultVal: '',
        placeholder: 'Date and venue...',
      },
      {
        id: 'edition',
        label: 'Commemorative Tag',
        defaultVal: '',
        placeholder: 'e.g. Live Recording, Commemorative Drop',
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
        id: 'artist',
        label: 'Creator / Artist',
        defaultVal: '',
        placeholder: 'Enter creator or artist name...',
        required: true,
      },
      {
        id: 'workTitle',
        label: 'Work Title',
        defaultVal: '',
        placeholder: 'Title of the artwork or creative piece...',
      },
      {
        id: 'statement',
        label: 'Creative Statement / Description',
        defaultVal: '',
        placeholder: 'Curatorial notes or artist statement...',
        multiline: true,
        maxLines: 4,
      },
      {
        id: 'mediumYear',
        label: 'Medium & Year',
        defaultVal: '',
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
        defaultVal: '',
        placeholder: 'Player or athlete name...',
        required: true,
      },
      {
        id: 'team',
        label: 'Team / Discipline',
        defaultVal: '',
        placeholder: 'Team, nation, or position...',
      },
      {
        id: 'highlights',
        label: 'Career Highlights',
        defaultVal: '',
        placeholder: 'Career summary, championships, records...',
        multiline: true,
        maxLines: 4,
      },
      {
        id: 'stat1',
        label: 'Primary Stat',
        defaultVal: '',
        placeholder: 'e.g. Scoring Average, Gold Medals, Wins',
      },
      {
        id: 'stat2',
        label: 'Era / Season',
        defaultVal: '',
        placeholder: 'e.g. 1996 - 2016, 2024 Season',
      },
      {
        id: 'badge',
        label: 'Honor / Recognition',
        defaultVal: '',
        placeholder: 'e.g. Hall of Fame, All-Star, MVP',
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
        id: 'author',
        label: 'Author / Subject Name',
        defaultVal: '',
        placeholder: 'Enter author or subject name...',
        required: true,
      },
      {
        id: 'headline',
        label: 'Cover Headline',
        defaultVal: '',
        placeholder: 'Feature headline or title...',
      },
      {
        id: 'deck',
        label: 'Sub-deck / Subject',
        defaultVal: '',
        placeholder: 'Subject or secondary teaser...',
      },
      {
        id: 'excerpt',
        label: 'Story Excerpt',
        defaultVal: '',
        placeholder: 'Lead paragraph or story excerpt...',
        multiline: true,
        maxLines: 4,
      },
      {
        id: 'issue',
        label: 'Issue & Date',
        defaultVal: '',
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
        id: 'speaker',
        label: 'Speaker / Author',
        defaultVal: '',
        placeholder: 'Enter speaker or author name...',
        required: true,
      },
      {
        id: 'quote',
        label: 'Core Quote',
        defaultVal: '',
        placeholder: 'The core quote or thesis...',
      },
      {
        id: 'context',
        label: 'Reflection / Context',
        defaultVal: '',
        placeholder: 'Extended quote or contextual background...',
        multiline: true,
        maxLines: 4,
      },
      {
        id: 'citation',
        label: 'Citation / Year',
        defaultVal: '',
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
        defaultVal: '',
        placeholder: 'Hero name or alias...',
        required: true,
      },
      {
        id: 'faction',
        label: 'Faction / Realm',
        defaultVal: '',
        placeholder: 'Class, realm, or allegiance...',
      },
      {
        id: 'lore',
        label: 'Origin Lore & Abilities',
        defaultVal: '',
        placeholder: 'Character backstory and powers...',
        multiline: true,
        maxLines: 4,
      },
      {
        id: 'rarity',
        label: 'Rarity / Tier',
        defaultVal: '',
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
        defaultVal: '',
        placeholder: 'System code or prototype ID...',
        required: true,
      },
      {
        id: 'role',
        label: 'Classification & Role',
        defaultVal: '',
        placeholder: 'Classification or protocol...',
      },
      {
        id: 'telemetry',
        label: 'Telemetry Readout',
        defaultVal: '',
        placeholder: 'Diagnostic log or technical overview...',
        multiline: true,
        maxLines: 4,
      },
      {
        id: 'nodeHash',
        label: 'Node Hash / Port',
        defaultVal: '',
        placeholder: 'Hash, endpoint, or serial...',
      },
      {
        id: 'clearance',
        label: 'Clearance Level',
        defaultVal: '',
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
        defaultVal: '',
        placeholder: 'Handwritten-style note or caption...',
        required: true,
      },
      {
        id: 'provenance',
        label: 'Provenance & Archive',
        defaultVal: '',
        placeholder: 'Source, venue, or personal note...',
      },
      {
        id: 'chronicle',
        label: 'Historical Chronicle',
        defaultVal: '',
        placeholder: 'Story of how this piece was created or discovered...',
        multiline: true,
        maxLines: 4,
      },
      {
        id: 'serial',
        label: 'Catalog Serial',
        defaultVal: '',
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
