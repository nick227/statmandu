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
  const hometown = profile.hometown || ''
  const bio = profile.bio || ''
  const originEra = profile.originEra || (hometown ? `${hometown} · RARE Heritage` : '')

  // Extract specializations
  const athlete = profile.specializations.find((s) => s.type === 'ATHLETE')?.attributes
  const musician = profile.specializations.find((s) => s.type === 'MUSICIAN')?.attributes
  const writer = profile.specializations.find((s) => s.type === 'WRITER')?.attributes
  const actor = profile.specializations.find((s) => s.type === 'ACTOR')?.attributes
  const scientist = profile.specializations.find((s) => s.type === 'SCIENTIST')?.attributes
  const creator = profile.specializations.find((s) => s.type === 'CREATOR')?.attributes
  const historical = profile.specializations.find((s) => s.type === 'HISTORICAL')?.attributes

  // Primary Subject / Name fields
  if (
    field.id === 'name' ||
    field.id === 'subject' ||
    field.id === 'athlete' ||
    field.id === 'athleteName' ||
    field.id === 'creatorName' ||
    field.id === 'recipient' ||
    field.id === 'author'
  ) {
    return { value: name, sourceLabel: 'Profile Name' }
  }

  // 1. Profile Card Type
  if (cardTypeId === 'profile') {
    if (field.id === 'title') {
      const calling =
        athlete?.sport ? `${athlete.sport.toUpperCase()} · ${athlete.primaryRole || 'ATHLETE'}` :
        musician?.primaryGenre ? `${musician.primaryGenre.toUpperCase()} · MUSICIAN` :
        writer?.literaryGenres?.[0] ? `${writer.literaryGenres[0].toUpperCase()} · AUTHOR` :
        actor?.primaryMedium ? `${actor.primaryMedium.toUpperCase()} · ACTOR` :
        scientist?.fieldOfStudy ? `${scientist.fieldOfStudy.toUpperCase()} · RESEARCHER` :
        'CULTURAL ICON'
      return { value: calling, sourceLabel: 'Specialist Calling' }
    }
    if (field.id === 'bio') {
      return { value: bio || field.defaultVal, sourceLabel: 'Profile Biography' }
    }
    if (field.id === 'origin') {
      return { value: originEra || hometown || field.defaultVal, sourceLabel: 'Hometown / Era' }
    }
  }

  // 2. Achievement Card Type
  if (cardTypeId === 'achievement') {
    if (field.id === 'achievement') {
      const accolade =
        athlete?.primaryStatistic || athlete?.careerAccolades?.[0] ||
        musician?.honors?.[0] ||
        writer?.literaryHonors?.[0] ||
        scientist?.majorHonors?.[0] ||
        scientist?.keyBreakthrough ||
        'PRESTIGIOUS CAREER HONORS'
      return { value: accolade, sourceLabel: 'Specialist Honor' }
    }
    if (field.id === 'recipient') {
      return { value: name, sourceLabel: 'Profile Name' }
    }
    if (field.id === 'details' || field.id === 'chronicle') {
      return { value: bio || field.defaultVal, sourceLabel: 'Profile Biography' }
    }
    if (field.id === 'dateLocation' || field.id === 'dateScope') {
      const dates = athlete?.yearsActive || historical?.epochOrEra || 'CAREER LANDMARK'
      return { value: dates, sourceLabel: 'Career Era' }
    }
  }

  // 3. Sports Card Type
  if (cardTypeId === 'sports') {
    if (field.id === 'athlete' || field.id === 'athleteName') {
      return { value: name, sourceLabel: 'Athlete Name' }
    }
    if (field.id === 'team' || field.id === 'sportRole') {
      const role = athlete ? `${athlete.sport} · ${athlete.primaryRole || athlete.currentTeam || 'Competitor'}` : 'Athletics'
      return { value: role.toUpperCase(), sourceLabel: 'Sport & Role' }
    }
    if (field.id === 'highlights' || field.id === 'stat1') {
      return { value: athlete?.primaryStatistic || 'RECORD PERFORMANCES', sourceLabel: 'Primary Stat' }
    }
    if (field.id === 'honors') {
      return { value: athlete?.careerAccolades?.[0] || 'CHAMPIONSHIP HONORS', sourceLabel: 'Career Accolades' }
    }
    if (field.id === 'era') {
      return { value: athlete?.yearsActive || 'HISTORIC ERA', sourceLabel: 'Years Active' }
    }
    if (field.id === 'careerStory') {
      return { value: bio || field.defaultVal, sourceLabel: 'Career Summary' }
    }
  }

  // 4. Publication / Literary Card Type
  if (cardTypeId === 'publication') {
    if (field.id === 'workTitle') {
      const work = writer?.flagshipWorks?.[0] || musician?.keyReleases?.[0] || 'FLAGSHIP WORK'
      return { value: work.toUpperCase(), sourceLabel: 'Key Work' }
    }
    if (field.id === 'author') {
      return { value: name, sourceLabel: 'Author Name' }
    }
    if (field.id === 'synopsis') {
      return { value: bio || field.defaultVal, sourceLabel: 'Synopsis' }
    }
  }

  // 5. Lore / Historical Card Type
  if (cardTypeId === 'lore' || cardTypeId === 'relic') {
    if (field.id === 'title') {
      return { value: historical?.historicContribution || name, sourceLabel: 'Historical Landmark' }
    }
    if (field.id === 'chronicle') {
      return { value: bio || field.defaultVal, sourceLabel: 'Historic Chronicle' }
    }
    if (field.id === 'provenance') {
      return { value: historical?.archiveProvenance || `${name} ARCHIVES`, sourceLabel: 'Provenance' }
    }
  }

  // Fallback to default field value
  return { value: field.defaultVal, sourceLabel: 'Standard Default' }
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

    if (!profile) {
      const override = currentOverrides[slotId]
      return {
        slotId,
        fieldId: field.id,
        label: field.label,
        placeholder: field.placeholder,
        multiline: field.multiline,
        maxLines: field.maxLines,
        isMappedInDesign,
        isLinked: false,
        linkedValue: field.defaultVal,
        overrideValue: override,
        effectiveValue: override ?? field.defaultVal,
      }
    }

    const { value: resolvedVal, sourceLabel } = resolveProfileAttributeForField(
      profile,
      cardType.id,
      field,
      index,
    )

    const isUnlinked = unlinkedSlotIds.has(slotId)
    const override = currentOverrides[slotId]
    const isLinked = !isUnlinked && override === undefined

    const effectiveValue = isLinked ? resolvedVal : (override ?? resolvedVal)

    return {
      slotId,
      fieldId: field.id,
      label: field.label,
      placeholder: field.placeholder,
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
