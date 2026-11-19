/**
 * RARE Card Type Definitions
 *
 * 3 Ultra-Simple Templates:
 * 1. Standard (Identity & Bio) - Portrait layout with name, role, origin, and bio story
 * 2. Stats (Hero Stat & Metrics) - Performance layout with competitor, category, big stat callout, and record
 * 3. Minimal (Full-Bleed Artwork) - Artwork presentation with full-bleed canvas, piece title, creator, and year
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
  // 1. Standard (Identity & Bio)
  {
    id: 'standard',
    name: 'Standard',
    description: 'Identity & Bio portrait layout',
    badge: 'Identity',
    fields: [
      {
        id: 'name',
        label: 'Name',
        defaultVal: '',
        placeholder: 'Enter subject or person name...',
        required: true,
      },
      {
        id: 'role',
        label: 'Role',
        defaultVal: '',
        placeholder: 'e.g. Architect, Musician, Athlete',
      },
      {
        id: 'origin',
        label: 'Origin',
        defaultVal: '',
        placeholder: 'e.g. City, Country, or Historic Era',
      },
      {
        id: 'bio',
        label: 'Bio',
        defaultVal: '',
        placeholder: 'Brief biographical statement...',
        multiline: true,
        maxLines: 4,
      },
    ],
  },

  // 2. Stats (Hero Stat & Metrics)
  {
    id: 'stats',
    name: 'Stats',
    description: 'Hero Stat & Metrics performance layout',
    badge: 'Metrics',
    fields: [
      {
        id: 'name',
        label: 'Name',
        defaultVal: '',
        placeholder: 'Enter competitor or subject name...',
        required: true,
      },
      {
        id: 'discipline',
        label: 'Category',
        defaultVal: '',
        placeholder: 'e.g. Basketball, Track & Field, Racing',
      },
      {
        id: 'stat',
        label: 'Hero Stat',
        defaultVal: '',
        placeholder: 'e.g. 3x Champion, 28.4 PPG, World Record',
      },
      {
        id: 'record',
        label: 'Record',
        defaultVal: '',
        placeholder: 'e.g. 1960 Olympic Games, Hall of Fame',
      },
    ],
  },

  // 3. Minimal (Full-Bleed Artwork)
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Full-bleed artwork & minimal caption layout',
    badge: 'Artwork',
    fields: [
      {
        id: 'title',
        label: 'Title',
        defaultVal: '',
        placeholder: 'Enter artwork or subject title...',
        required: true,
      },
      {
        id: 'artist',
        label: 'Creator',
        defaultVal: '',
        placeholder: 'Enter creator or artist name...',
      },
      {
        id: 'year',
        label: 'Year',
        defaultVal: '',
        placeholder: 'e.g. 2026 or Contemporary Era',
      },
    ],
  },
]

/**
 * Resolves a CardType by ID with backward compatibility aliasing for legacy draft IDs.
 */
export function getCardTypeById(id: string): CardType {
  const normalized =
    id === 'profile' || id === 'standard' ? 'standard' :
    id === 'stats' || id === 'sports' || id === 'achievement' || id === 'award' ? 'stats' :
    id === 'minimal' || id === 'creator' || id === 'art' ? 'minimal' :
    id
  return CARD_TYPES.find((t) => t.id === normalized) || CARD_TYPES[0]
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
