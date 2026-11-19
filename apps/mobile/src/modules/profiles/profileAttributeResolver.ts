/**
 * RARE Profile Attribute Resolver
 *
 * Links Card Type content fields to Universal Profile attributes and specialist data.
 * Supports:
 * - Deterministic field resolution from Universal profile & specializations
 * - Linked state tracking (synced to profile vs. custom creator override)
 * - Override preservation: editing a field does NOT overwrite profile data
 * - Re-linking back to profile values
 */

import type { CardType, CardTypeField } from '@/modules/designs/cardTypes'
import type { UniversalProfile, SpecializationPayload } from './profileTaxonomy'

export interface BoundCardField {
  slotId: string
  fieldId: string
  label: string
  placeholder?: string
  multiline?: boolean
  maxLines?: number
  isMappedInDesign: boolean
  isLinked: boolean
  linkedSourceLabel?: string
  linkedValue: string
  overrideValue?: string
  effectiveValue: string
}

/**
 * Resolves a suggested value from a UniversalProfile for a specific CardType field.
 */
export function resolveProfileAttributeForField(
  profile: UniversalProfile,
  cardTypeId: string,
  field: CardTypeField,
  fieldIndex: number,
): { value: string; sourceLabel: string } {
  // Universal attributes
  const name = profile.displayName || ''
  const hometown = profile.hometown || profile.location || ''
  const bio = profile.bio || ''
  const age = profile.age != null ? String(profile.age) : ''
  const originEra = profile.originEra || (hometown ? `${hometown} · RARE Heritage` : '')

  // Extract specializations
  const athlete = profile.specializations?.find((s) => s.type === 'ATHLETE')?.attributes
  const musician = profile.specializations?.find((s) => s.type === 'MUSICIAN')?.attributes
  const writer = profile.specializations?.find((s) => s.type === 'WRITER')?.attributes
  const actor = profile.specializations?.find((s) => s.type === 'ACTOR')?.attributes
  const scientist = profile.specializations?.find((s) => s.type === 'SCIENTIST')?.attributes
  const creator = profile.specializations?.find((s) => s.type === 'CREATOR')?.attributes
  const historical = profile.specializations?.find((s) => s.type === 'HISTORICAL')?.attributes

  // Universal Primary Subject / Name fields across all card types
  if (
    field.id === 'name' ||
    field.id === 'subject' ||
    field.id === 'athlete' ||
    field.id === 'athleteName' ||
    field.id === 'creatorName' ||
    field.id === 'recipient' ||
    field.id === 'author' ||
    field.id === 'artist' ||
    field.id === 'speaker' ||
    field.id === 'presenter' ||
    field.id === 'alias'
  ) {
    return { value: name, sourceLabel: name ? 'Profile Name' : 'Unset' }
  }

  if (field.id === 'age') {
    return { value: age, sourceLabel: age ? 'Profile Age' : 'Unset' }
  }

  if (field.id === 'location' || field.id === 'hometown') {
    return { value: hometown, sourceLabel: hometown ? 'Profile Location' : 'Unset' }
  }

  // Specialist calling / role resolution
  const calling =
    profile.calling ||
    (athlete?.sport ? `${athlete.sport.toUpperCase()} · ${athlete.primaryRole || 'ATHLETE'}` :
    musician?.primaryGenre ? `${musician.primaryGenre.toUpperCase()} · MUSICIAN` :
    writer?.literaryGenres?.[0] ? `${writer.literaryGenres[0].toUpperCase()} · AUTHOR` :
    actor?.primaryMedium ? `${actor.primaryMedium.toUpperCase()} · ACTOR` :
    scientist?.fieldOfStudy ? `${scientist.fieldOfStudy.toUpperCase()} · RESEARCHER` :
    creator?.creativeDomains?.[0] ? `${creator.creativeDomains[0].toUpperCase()} · CREATOR` :
    historical?.epochOrEra ? `${historical.epochOrEra.toUpperCase()}` :
    '')

  // Primary accolade / statistic resolution
  const customStat = profile.customFields?.find((cf) => /stat|record|metric/i.test(cf.label))?.value
  const primaryAccolade =
    customStat ||
    athlete?.primaryStatistic ||
    athlete?.careerAccolades?.[0] ||
    musician?.honors?.[0] ||
    writer?.literaryHonors?.[0] ||
    scientist?.majorHonors?.[0] ||
    scientist?.keyBreakthrough ||
    ''

  // Primary work / landmark resolution
  const flagshipWork =
    writer?.flagshipWorks?.[0] ||
    musician?.keyReleases?.[0] ||
    historical?.historicContribution ||
    ''

  // 1. Standard Template (Identity & Bio)
  if (cardTypeId === 'standard' || cardTypeId === 'profile') {
    if (field.id === 'role' || field.id === 'title') {
      return { value: calling, sourceLabel: calling ? 'Role' : 'Unset' }
    }
    if (field.id === 'origin') {
      return { value: originEra || hometown, sourceLabel: (originEra || hometown) ? 'Origin' : 'Unset' }
    }
    if (field.id === 'bio') {
      return { value: bio, sourceLabel: bio ? 'Bio' : 'Unset' }
    }
  }

  // 2. Stats Template (Hero Stat & Metrics)
  if (cardTypeId === 'stats' || cardTypeId === 'sports' || cardTypeId === 'achievement') {
    if (field.id === 'discipline' || field.id === 'category') {
      const discipline = athlete?.sport ? `${athlete.sport.toUpperCase()}` : calling || 'COMPETITOR'
      return { value: discipline, sourceLabel: discipline ? 'Category' : 'Unset' }
    }
    if (field.id === 'stat' || field.id === 'achievement' || field.id === 'highlights') {
      return { value: primaryAccolade, sourceLabel: primaryAccolade ? 'Hero Stat' : 'Unset' }
    }
    if (field.id === 'record' || field.id === 'dateLocation' || field.id === 'honors') {
      const rec = profile.debut || athlete?.careerAccolades?.[0] || athlete?.yearsActive || historical?.epochOrEra || originEra || ''
      return { value: rec, sourceLabel: rec ? 'Record' : 'Unset' }
    }
  }

  // 3. Minimal Template (Full-Bleed Artwork)
  if (cardTypeId === 'minimal' || cardTypeId === 'creator') {
    if (field.id === 'title') {
      return { value: flagshipWork || (name ? `${name}` : ''), sourceLabel: flagshipWork ? 'Title' : 'Unset' }
    }
    if (field.id === 'artist') {
      return { value: name, sourceLabel: name ? 'Creator' : 'Unset' }
    }
    if (field.id === 'year') {
      return { value: profile.debut || originEra || '2026', sourceLabel: (profile.debut || originEra) ? 'Year' : 'Unset' }
    }
  }

  // 4. Publication / Feature Card Type
  if (cardTypeId === 'publication') {
    if (field.id === 'headline') {
      return { value: name ? `THE VOICE OF ${name.toUpperCase()}` : '', sourceLabel: name ? 'Profile Headline' : 'Unset' }
    }
    if (field.id === 'deck') {
      const topic = writer?.literaryGenres?.[0] || musician?.primaryGenre || ''
      return { value: topic && name ? `${name.toUpperCase()} ON ${topic.toUpperCase()}` : '', sourceLabel: (topic && name) ? 'Subject Feature' : 'Unset' }
    }
    if (field.id === 'workTitle') {
      return { value: flagshipWork ? flagshipWork.toUpperCase() : '', sourceLabel: flagshipWork ? 'Key Work' : 'Unset' }
    }
    if (field.id === 'synopsis' || field.id === 'excerpt') {
      return { value: bio, sourceLabel: bio ? 'Synopsis' : 'Unset' }
    }
    if (field.id === 'issue') {
      return { value: originEra || '', sourceLabel: originEra ? 'Issue Era' : 'Unset' }
    }
  }

  // 5. Artwork & Creator Card Type
  if (cardTypeId === 'creator') {
    if (field.id === 'workTitle') {
      return { value: flagshipWork ? flagshipWork.toUpperCase() : '', sourceLabel: flagshipWork ? 'Creative Masterpiece' : 'Unset' }
    }
    if (field.id === 'statement') {
      return { value: bio, sourceLabel: bio ? 'Creative Statement' : 'Unset' }
    }
    if (field.id === 'mediumYear') {
      return { value: originEra ? `${originEra.toUpperCase()} · MASTER ARCHIVE` : '', sourceLabel: originEra ? 'Origin Archive' : 'Unset' }
    }
  }

  // 6. Quote & Manifesto Card Type
  if (cardTypeId === 'manifesto') {
    if (field.id === 'quote') {
      const q = writer?.flagshipWorks?.[0] ? `"${writer.flagshipWorks[0].toUpperCase()}"` : ''
      return { value: q, sourceLabel: q ? 'Core Quote' : 'Unset' }
    }
    if (field.id === 'context') {
      return { value: bio, sourceLabel: bio ? 'Reflection & Context' : 'Unset' }
    }
    if (field.id === 'citation') {
      return { value: originEra || (name ? `${name.toUpperCase()} ARCHIVE` : ''), sourceLabel: (originEra || name) ? 'Citation' : 'Unset' }
    }
  }

  // 7. Event Card Type
  if (cardTypeId === 'event') {
    if (field.id === 'eventName') {
      return { value: name ? `${name.toUpperCase()} · KEYNOTE GATHERING` : '', sourceLabel: name ? 'Event Headline' : 'Unset' }
    }
    if (field.id === 'description') {
      return { value: bio, sourceLabel: bio ? 'Event Narrative' : 'Unset' }
    }
    if (field.id === 'dateLocation') {
      return { value: originEra || hometown, sourceLabel: (originEra || hometown) ? 'Date & Location' : 'Unset' }
    }
  }

  // 8. Lore & Relic Card Types
  if (cardTypeId === 'lore' || cardTypeId === 'relic') {
    if (field.id === 'title' || field.id === 'caption') {
      return { value: historical?.historicContribution || (name ? `${name.toUpperCase()} MEMORABILIA` : ''), sourceLabel: (historical?.historicContribution || name) ? 'Historical Landmark' : 'Unset' }
    }
    if (field.id === 'chronicle' || field.id === 'lore') {
      return { value: bio, sourceLabel: bio ? 'Historic Chronicle' : 'Unset' }
    }
    if (field.id === 'provenance') {
      return { value: historical?.archiveProvenance || (name ? `${name.toUpperCase()} ARCHIVES` : ''), sourceLabel: (historical?.archiveProvenance || name) ? 'Provenance' : 'Unset' }
    }
    if (field.id === 'faction') {
      return { value: calling, sourceLabel: calling ? 'Specialist Faction' : 'Unset' }
    }
  }

  // General field fallback based on common field IDs
  if (field.id === 'bio' || field.id === 'details' || field.id === 'description' || field.id === 'statement') {
    return { value: bio, sourceLabel: bio ? 'Profile Biography' : 'Unset' }
  }
  if (field.id === 'origin' || field.id === 'dateLocation' || field.id === 'era') {
    return { value: originEra || hometown, sourceLabel: (originEra || hometown) ? 'Origin & Era' : 'Unset' }
  }

  // Missing values resolve exclusively to empty string, NEVER example content
  return { value: '', sourceLabel: 'Unset' }
}

export function getFieldSemanticKey(cardTypeId: string, fieldId: string, slotId?: string): string {
  if (slotId === 'input1' || fieldId === 'name' || fieldId === 'subject') {
    return 'input1'
  }
  return `${cardTypeId}.${fieldId}`
}

/**
 * Builds the complete list of BoundCardFields for a CardType and UniversalProfile,
 * taking into account local overrides and active slots of a FlagshipDesign.
 */
export function buildBoundCardFields(
  cardType: CardType,
  profile: UniversalProfile | null | undefined,
  designSlotIds: string[],
  currentOverrides: Record<string, string> = {},
  unlinkedSlotIds: Set<string> = new Set(),
): BoundCardField[] {
  return cardType.fields.map((field, index) => {
    const slotId = `input${index + 1}`
    const isMappedInDesign = designSlotIds.includes(slotId)
    const instructionalPlaceholder = field.placeholder || `Enter ${field.label}...`
    const semanticKey = getFieldSemanticKey(cardType.id, field.id, slotId)

    // Lookup override either by semantic key or direct slotId for backward compatibility
    const override = currentOverrides[semanticKey] ?? currentOverrides[slotId]
    const isUnlinked = unlinkedSlotIds.has(semanticKey) || unlinkedSlotIds.has(slotId)

    if (!profile) {
      return {
        slotId,
        fieldId: field.id,
        label: field.label,
        placeholder: instructionalPlaceholder,
        multiline: field.multiline,
        maxLines: field.maxLines,
        isMappedInDesign,
        isLinked: false,
        linkedValue: '',
        overrideValue: override,
        effectiveValue: override ?? '',
      }
    }

    const { value: resolvedVal, sourceLabel } = resolveProfileAttributeForField(
      profile,
      cardType.id,
      field,
      index,
    )

    const isLinked = !isUnlinked && override === undefined

    const effectiveValue = isLinked ? resolvedVal : (override ?? resolvedVal)

    return {
      slotId,
      fieldId: field.id,
      label: field.label,
      placeholder: instructionalPlaceholder,
      multiline: field.multiline,
      maxLines: field.maxLines,
      isMappedInDesign,
      isLinked,
      linkedSourceLabel: sourceLabel,
      linkedValue: resolvedVal,
      overrideValue: override,
      effectiveValue,
    }
  })
}
